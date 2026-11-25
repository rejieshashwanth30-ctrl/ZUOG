import { NextRequest, NextResponse } from 'next/server';
import { ExpiryEngine } from '@/lib/notifications/expiryEngine';
import { getAuthenticatedUser } from '@/lib/supabase/server';

/**
 * POST /api/cron/reminders
 * Automated, scheduled background processor for vendor document expiry alerts.
 * Idempotent, protected by CRON_SECRET or authenticated user session.
 */
export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    const customHeader = request.headers.get('x-cron-secret');

    let isAuthorized = false;

    // 1. Validate Cron Secret Header
    if (cronSecret) {
      if (
        (authHeader && authHeader === `Bearer ${cronSecret}`) ||
        (customHeader && customHeader === cronSecret)
      ) {
        isAuthorized = true;
      }
    }

    // 2. Validate Authenticated Admin User Session as fallback
    if (!isAuthorized) {
      const authUser = await getAuthenticatedUser(request);
      if (authUser) {
        isAuthorized = true;
      }
    }

    // 3. Reject unauthorized invocations
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized. Valid CRON_SECRET bearer token or admin session required.' },
        { status: 401 }
      );
    }

    // 4. Run idempotent reminder cycle
    const result = await ExpiryEngine.runCycle();

    return NextResponse.json(
      {
        success: true,
        message: 'Expiry reminder cycle executed successfully.',
        metrics: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[CRON /api/cron/reminders] Execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal error executing expiry reminder cycle.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/reminders
 * Lightweight status & readiness check for cron scheduler ping services.
 */
export async function GET(request: NextRequest) {
  return POST(request);
}
