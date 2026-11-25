import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { DocumentRepository } from '@/lib/db/repositories/documentRepository';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/documents
 * Retrieves documents strictly scoped to the authenticated user's workspace.
 * Starts from a fresh empty state with zero mock documents.
 */
export async function GET(request: NextRequest) {
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
      return NextResponse.json({ documents: [] }, { status: 200 });
    }

    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendorId') || undefined;

    const dbDocs = await DocumentRepository.getDocumentsByWorkspace(workspace.id, {
      vendorId,
    });

    const documents = dbDocs.map((d: any) => {
      // Calculate true document status
      let docStatus = d.verificationStatus.toLowerCase();
      if (d.verificationStatus === 'VERIFIED') {
        if (d.status === 'EXPIRED') docStatus = 'expired';
        else if (d.status === 'EXPIRING_SOON') docStatus = 'expiring';
        else docStatus = 'verified';
      }

      return {
        id: d.id,
        vendorId: d.vendorId,
        vendorName: d.vendor?.vendorName || 'Vendor',
        type: d.documentType?.name || 'Document',
        fileName: d.fileName,
        fileSize: d.fileSize || '—',
        fileUrl: d.storagePath ? `/api/documents/${d.id}/preview` : (d.fileUrl || `/api/documents/${d.id}/preview`),
        uploadedAt: d.uploadedAt ? d.uploadedAt.toISOString().split('T')[0] : d.createdAt.toISOString().split('T')[0],
        expiryDate: d.expiryDate ? d.expiryDate.toISOString().split('T')[0] : null,
        status: docStatus as any,
        verificationStatus: d.verificationStatus,
        verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString().split('T')[0] : undefined,
        verifiedBy: d.verifiedBy || undefined,
        rejectionReason: d.rejectionReason || undefined,
        mimeType: d.mimeType || 'application/pdf',
        storagePath: d.storagePath || undefined,
      };
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('[API /api/documents GET] Error querying Neon database:', error);
    return NextResponse.json(
      { error: 'Unable to load documents from database.', documents: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Records an uploaded document scoped to the workspace and vendor.
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

    const body = await request.json();
    const { vendorId, type, fileName, fileSize, expiryDate, documentNumber, notes } = body;

    if (!vendorId || !fileName) {
      return NextResponse.json({ error: 'Vendor ID and File Name are required.' }, { status: 400 });
    }

    // Verify vendor belongs to this workspace
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, workspaceId: workspace.id },
    });
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found in this workspace.' }, { status: 404 });
    }

    // Resolve or find document type
    let docType = await prisma.documentType.findFirst({
      where: {
        workspaceId: workspace.id,
        name: type || 'General Document',
      },
    });

    if (!docType) {
      docType = await prisma.documentType.create({
        data: {
          workspaceId: workspace.id,
          name: type || 'General Document',
          code: (type || 'general_document').toLowerCase().replace(/\s+/g, '_'),
          isRequiredDefault: false,
        },
      });
    }

    const uploaded = await DocumentRepository.uploadDocument(
      workspace.id,
      vendorId,
      docType.id,
      {
        fileName,
        fileSize: fileSize || '1.2 MB',
        documentNumber,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        notes,
      },
      dbUser.id
    );

    const document = {
      id: uploaded.id,
      vendorId: uploaded.vendorId,
      vendorName: vendor.vendorName,
      type: docType.name,
      fileName: uploaded.fileName,
      fileSize: uploaded.fileSize || '1.2 MB',
      fileUrl: uploaded.fileUrl || '/mock-docs/sample.pdf',
      uploadedAt: uploaded.createdAt.toISOString().split('T')[0],
      expiryDate: uploaded.expiryDate ? uploaded.expiryDate.toISOString().split('T')[0] : '2027-12-31',
      status: uploaded.verificationStatus.toLowerCase() as any,
      verifiedAt: uploaded.verifiedAt ? uploaded.verifiedAt.toISOString().split('T')[0] : undefined,
      verifiedBy: uploaded.verifiedBy || undefined,
      rejectionReason: uploaded.rejectionReason || undefined,
    };

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('[API /api/documents POST] Error creating document in Neon:', error);
    return NextResponse.json({ error: 'Failed to record document in database.' }, { status: 500 });
  }
}
