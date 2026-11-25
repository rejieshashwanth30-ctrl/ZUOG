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
      const existing = await prisma.user.findUnique({
        where: { authUserId },
      });

      if (existing) {
        return existing;
      }

      // Check if email already registered with different auth ID
      const byEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (byEmail) {
        return prisma.user.update({
          where: { email },
          data: {
            authUserId,
            name: name || byEmail.name,
            phone: phone || byEmail.phone,
          },
        });
      }

      // Create new application User record in Neon
      return await prisma.user.create({
        data: {
          authUserId,
          email,
          name: name || 'User',
          phone,
        },
      });
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
