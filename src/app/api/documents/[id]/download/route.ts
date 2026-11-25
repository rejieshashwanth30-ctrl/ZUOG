import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { StorageService } from '@/lib/storage/storageService';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/documents/[id]/download
 * Secure download endpoint forcing attachment disposition.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const doc = await prisma.vendorDocument.findFirst({
      where: { id, workspaceId: workspace.id },
    });

    if (!doc || !doc.storagePath) {
      return NextResponse.json({ error: 'Document file not found.' }, { status: 404 });
    }

    const signedUrl = await StorageService.getSignedUrl(doc.storagePath, 900);
    if (!signedUrl) {
      return NextResponse.json({ error: 'Unable to generate download URL.' }, { status: 500 });
    }

    return NextResponse.redirect(`${signedUrl}&download=true`);
  } catch (error: any) {
    console.error('[API /api/documents/[id]/download GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Download failed.' },
      { status: 500 }
    );
  }
}
