import { PrismaClient } from '@prisma/client';

// Global declaration to maintain singleton across Next.js hot reloads in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Health check utility that safely tests the connection to Neon PostgreSQL
 * Returns safe metadata without ever exposing database credentials or passwords
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  provider: string;
  error?: string;
  durationMs?: number;
}> {
  const start = Date.now();
  try {
    // Run a lightweight raw query to test PostgreSQL connectivity
    await prisma.$queryRaw`SELECT 1 as ping`;
    const durationMs = Date.now() - start;
    return {
      connected: true,
      provider: 'Neon PostgreSQL',
      durationMs,
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Unknown database error';
    // Log server-side only for diagnostics; never expose connection string
    console.warn('[Neon PostgreSQL] Connection probe result:', message);
    return {
      connected: false,
      provider: 'Neon PostgreSQL',
      error: 'Database connection currently unavailable or credentials not configured',
      durationMs,
    };
  }
}
