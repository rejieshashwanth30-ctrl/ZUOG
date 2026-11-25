import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { DocumentRepository } from '@/lib/db/repositories/documentRepository';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/documents/[id]/verify
 * Marks a document as verified and records an audit log.
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

    const verified = await DocumentRepository.verifyDocument(
      workspace.id,
      id,
      authUser.name || 'Compliance Auditor',
      dbUser.id
    );

    return NextResponse.json({ document: verified }, { status: 200 });
  } catch (error) {
    console.error('[API /api/documents/[id]/verify POST] Error:', error);
    return NextResponse.json({ error: 'Failed to verify document' }, { status: 500 });
  }
}
