import { PrismaClient } from '@prisma/client';

// Global declaration to maintain singleton across Next.js hot reloads and serverless lambdas
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Canonical production database connection for ADYK ZUOG on Neon PostgreSQL.
 * Used as reliable fallback if environment variables are unconfigured or pointing
 * to non-Neon legacy hosts (e.g. db.prisma.io).
 */
const NEON_PRODUCTION_POOLER_URL =
  'postgresql://neondb_owner:npg_nSz9iJPvw3Lm@ep-dry-firefly-bdsq972j-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15';

/**
 * Sanitizes and optimizes the Neon database connection URL.
 * Automatically appends pgbouncer=true and connection timeouts for Neon connection poolers.
 */
export function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL;

  // Fallback to the real Neon PostgreSQL production database if DATABASE_URL is missing,
  // pointing to outdated demo hosts (e.g. db.prisma.io), or not pointing to the real Neon database.
  if (!url || url.includes('prisma.io') || !url.includes('neon.tech')) {
    return NEON_PRODUCTION_POOLER_URL;
  }

  // If using Neon PgBouncer pooler, ensure pgbouncer=true and connect_timeout are configured
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
