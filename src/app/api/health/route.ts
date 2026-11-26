import { NextResponse } from 'next/server';
import { prisma, checkDatabaseConnection, getDatabaseUrl } from '@/lib/db/prisma';

/**
 * Health check endpoint for ADYK ZUOG and Neon PostgreSQL.
 * Securely probes the database connection without exposing secrets or passwords.
 */
export async function GET() {
  const dbHealth = await checkDatabaseConnection();

  let dbDiagnostics: any = null;
  try {
    const dbInfo: any = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as "user",
        current_schema() as schema,
        version() as version
    `;
    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    const activeUrl = getDatabaseUrl();
    let host = 'not_set';
    let databaseFromUrl = 'not_set';
    try {
      if (activeUrl) {
        const u = new URL(activeUrl);
        host = u.host;
        databaseFromUrl = u.pathname.replace(/^\//, '');
      }
    } catch {
      host = 'unparseable';
    }

    dbDiagnostics = {
      connectedDatabase: dbInfo[0]?.database,
      connectedUser: dbInfo[0]?.user,
      connectedSchema: dbInfo[0]?.schema,
      host,
      databaseFromUrl,
      publicTables: tables.map((t: any) => t.table_name),
    };
  } catch (diagErr: any) {
    dbDiagnostics = {
      error: diagErr?.message || 'Failed to inspect database metadata',
    };
  }

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
      ...(dbHealth.error ? { error: dbHealth.error } : {}),
      diagnostics: dbDiagnostics,
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
