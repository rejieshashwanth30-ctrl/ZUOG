import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { DocumentRepository } from '@/lib/db/repositories/documentRepository';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/documents/[id]/reject
 * Rejects a document with a mandatory reason and records an audit log.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const rejected = await DocumentRepository.rejectDocument(
      workspace.id,
      id,
      reason.trim(),
      dbUser.id
    );

    return NextResponse.json({ document: rejected }, { status: 200 });
  } catch (error) {
    console.error('[API /api/documents/[id]/reject POST] Error:', error);
    return NextResponse.json({ error: 'Failed to reject document' }, { status: 500 });
  }
}
