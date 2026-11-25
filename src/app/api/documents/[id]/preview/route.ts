import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { DocumentRepository } from '@/lib/db/repositories/documentRepository';
import { StorageService } from '@/lib/storage/storageService';
import { prisma } from '@/lib/db/prisma';


/**
 * GET /api/documents/[id]/preview
 * Generates an authorized preview URL or streams the file for PDF / image viewing.
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

    if (!doc) {
      return NextResponse.json({ error: 'Document not found or access denied.' }, { status: 404 });
    }

    if (!doc.storagePath) {
      return NextResponse.json({ error: 'Document has no stored file.' }, { status: 404 });
    }

    const signedUrl = await StorageService.getSignedUrl(doc.storagePath, 1800);
    if (!signedUrl) {
      return NextResponse.json({ error: 'Unable to generate signed preview link.' }, { status: 500 });
    }

    // If request asks for JSON URL redirect or URL metadata
    const acceptHeader = request.headers.get('accept') || '';
    if (acceptHeader.includes('application/json')) {
      return NextResponse.json({
        url: signedUrl,
        fileName: doc.fileName,
        mimeType: doc.mimeType || 'application/pdf',
      });
    }

    // Direct redirect to signed file streaming URL
    return NextResponse.redirect(signedUrl);
  } catch (error: any) {
    console.error('[API /api/documents/[id]/preview GET] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to preview document.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Deletes document record and associated private storage file with workspace verification.
 */
export async function DELETE(
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
      include: { vendor: true, documentType: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found or access denied.' }, { status: 404 });
    }

    // 23. Delete storage file if path exists
    if (doc.storagePath) {
      await StorageService.deleteFile(doc.storagePath);
    }

    // Delete database record and audit log via repository
    await DocumentRepository.deleteDocument(workspace.id, doc.id, dbUser.id);

    return NextResponse.json({ success: true, message: 'Document deleted successfully.' });
  } catch (error: any) {
    console.error('[API /api/documents/[id] DELETE] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete document.' },
      { status: 500 }
    );
  }
}
