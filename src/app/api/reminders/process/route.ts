import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { ExpiryEngine } from '@/lib/notifications/expiryEngine';

/**
 * POST /api/reminders/process
 * Allows workspace managers to trigger on-demand expiry reminder scans and dispatches.
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await UserRepository.syncAuthUser({
      authUserId: authUser.authUserId,
      email: authUser.email,
      fullName: authUser.name,
    });

    const workspace = await WorkspaceRepository.getWorkspaceForUser(dbUser.id);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
    }

    const result = await ExpiryEngine.runCycle(workspace.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Workspace reminder cycle processed.',
        metrics: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/reminders/process POST] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error processing reminders.' },
      { status: 500 }
    );
  }
}
