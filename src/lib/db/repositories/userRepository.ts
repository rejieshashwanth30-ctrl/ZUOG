import { prisma } from '../prisma';
import type { User } from '@prisma/client';

export class UserRepository {
  /**
   * Synchronizes a Supabase authenticated user into the Neon PostgreSQL database.
   * Safe idempotent operation: creates user if first login, updates last sync if existing.
   */
  static async syncSupabaseUser({
    authUserId,
    email,
    name,
    phone,
  }: {
    authUserId: string;
    email: string;
    name: string;
    phone?: string;
  }): Promise<User> {
    try {
      // 1. Check if user already exists by Supabase authUserId
      const existing = await prisma.user.findUnique({
        where: { authUserId },
      });

      if (existing) {
        // Update name or phone if provided and currently empty
        if ((name && existing.name === 'User' && name !== 'User') || (phone && !existing.phone)) {
          return await prisma.user.update({
            where: { id: existing.id },
            data: {
              name: name || existing.name,
              phone: phone || existing.phone,
            },
          });
        }
        return existing;
      }

      // 2. Check if email already registered with different auth ID (e.g. migration or provider switch)
      const byEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (byEmail) {
        return await prisma.user.update({
          where: { id: byEmail.id },
          data: {
            authUserId,
            name: name || byEmail.name,
            phone: phone || byEmail.phone,
          },
        });
      }

      // 3. Create new application User record in Neon
      // Includes race-condition protection (P2002) for rapid mobile double-taps
      try {
        return await prisma.user.create({
          data: {
            authUserId,
            email,
            name: name || 'User',
            phone,
          },
        });
      } catch (createErr: any) {
        if (createErr?.code === 'P2002') {
          console.warn('[UserRepository] Concurrent user creation detected, retrieving record...');
          const retryUser = await prisma.user.findFirst({
            where: {
              OR: [{ authUserId }, { email }],
            },
          });
          if (retryUser) return retryUser;
        }
        throw createErr;
      }
    } catch (err) {
      console.error('[UserRepository] Error syncing user to Neon:', err);
      throw err;
    }
  }

  /**
   * Alias for syncSupabaseUser with flexible naming
   */
  static async syncAuthUser({
    authUserId,
    email,
    fullName,
    name,
    phone,
  }: {
    authUserId: string;
    email: string;
    fullName?: string;
    name?: string;
    phone?: string;
  }): Promise<User> {
    return this.syncSupabaseUser({
      authUserId,
      email,
      name: fullName || name || 'User',
      phone,
    });
  }

  /**
   * Fetches user by Supabase auth ID
   */
  static async getUserByAuthId(authUserId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { authUserId },
      });
    } catch (err) {
      console.warn('[UserRepository] Database offline or error, returning null:', err);
      return null;
    }
  }

  /**
   * Fetches user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}
