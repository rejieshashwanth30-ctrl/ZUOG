import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db/prisma';

/**
 * Health check endpoint for ADYK ZUOG and Neon PostgreSQL.
 * Securely probes the database connection without exposing secrets or connection strings.
 */
export async function GET() {
  const dbHealth = await checkDatabaseConnection();

  return NextResponse.json({
    status: dbHealth.connected ? 'healthy' : 'degraded',
    product: 'ADYK ZUOG',
    version: '1.0.0',
    attribution: 'Build & Develop : Rejiesh Ashwanth V | ADYK Multi Venture Company',
    database: {
      provider: 'Neon PostgreSQL',
      connected: dbHealth.connected,
      latencyMs: dbHealth.durationMs ?? 0,
      status: dbHealth.connected ? 'online' : 'unreachable_or_unconfigured',
    },
    auth: {
      provider: 'Supabase Auth',
      configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    },
    timestamp: new Date().toISOString(),
  }, {
    status: 200,
  });
}
