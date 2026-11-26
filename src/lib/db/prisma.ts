import { PrismaClient } from '@prisma/client';

// Global declaration to maintain singleton across Next.js hot reloads and serverless lambdas
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Sanitizes and optimizes the Neon database connection URL.
 * Automatically appends pgbouncer=true and connection timeouts for Neon connection poolers.
 */
function getDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // If using Neon PgBouncer pooler, ensure pgbouncer=true is set to disable prepared statements
  if (url.includes('-pooler.') && !url.includes('pgbouncer=true')) {
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}pgbouncer=true&connect_timeout=15`;
  }

  return url;
}

const resolvedDbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedDbUrl ? { db: { url: resolvedDbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

// Always maintain singleton across warm serverless execution contexts
globalForPrisma.prisma = prisma;

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
      error: `Database unavailable: ${message}`,
      durationMs,
    };
  }
}
