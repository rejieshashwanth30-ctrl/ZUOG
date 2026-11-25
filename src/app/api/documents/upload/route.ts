import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { StorageService } from '@/lib/storage/storageService';
import { prisma } from '@/lib/db/prisma';
import { DocumentValidityStatus } from '@prisma/client';
import crypto from 'crypto';

/**
 * POST /api/documents/upload
 * Handles real binary multipart/form-data file uploads from any device.
 * Stores binary in secure private storage, saves metadata in Neon PostgreSQL.
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const vendorId = formData.get('vendorId') as string | null;
    const documentTypeId = formData.get('documentTypeId') as string | null;
    const documentTypeName = formData.get('documentType') as string | null;
    const documentNumber = (formData.get('documentNumber') as string | null) || undefined;
    const expiryDateStr = (formData.get('expiryDate') as string | null) || undefined;
    const notes = (formData.get('notes') as string | null) || undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided in the upload.' }, { status: 400 });
    }

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required.' }, { status: 400 });
    }

    // 19. IDOR & Workspace Authorization Check
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, workspaceId: workspace.id },
    });
    if (!vendor) {
      return NextResponse.json(
        { error: 'Unauthorized or vendor does not belong to this workspace.' },
        { status: 403 }
      );
    }

    // Resolve or create DocumentType in catalog
    let resolvedTypeId = documentTypeId;
    if (!resolvedTypeId && documentTypeName) {
      const existingType = await prisma.documentType.findFirst({
        where: {
          name: { equals: documentTypeName, mode: 'insensitive' },
          OR: [{ workspaceId: workspace.id }, { workspaceId: null }],
        },
      });
      if (existingType) {
        resolvedTypeId = existingType.id;
      } else {
        const newType = await prisma.documentType.create({
          data: {
            workspaceId: workspace.id,
            name: documentTypeName,
            code: documentTypeName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            isRequiredDefault: true,
          },
        });
        resolvedTypeId = newType.id;
      }
    }

    if (!resolvedTypeId) {
      // Fallback to first available document type
      const firstType = await prisma.documentType.findFirst({
        where: { OR: [{ workspaceId: workspace.id }, { workspaceId: null }] },
      });
      resolvedTypeId = firstType?.id || 'default_type';
    }

    // 20. Server-Side File Validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'application/octet-stream';
    const originalFileName = file.name || 'document.pdf';

    const validation = StorageService.validateFile(originalFileName, mimeType, buffer.length);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate safe document ID
    const documentId = `doc_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;

    // 4. Save binary to Private Storage
    const storageResult = await StorageService.uploadFile(
      buffer,
      workspace.id,
      vendor.id,
      documentId,
      originalFileName,
      mimeType
    );

    if (!storageResult.success) {
      return NextResponse.json(
        { error: storageResult.error || 'Failed to save file to private storage.' },
        { status: 500 }
      );
    }

    // 10. Server-side Expiry Validity Calculation
    let parsedExpiry: Date | null = null;
    let validityStatus: DocumentValidityStatus = 'VALID';
    if (expiryDateStr) {
      parsedExpiry = new Date(expiryDateStr);
      const now = new Date();
      const thirtyDaysAhead = new Date();
      thirtyDaysAhead.setDate(now.getDate() + 30);

      if (parsedExpiry < now) {
        validityStatus = 'EXPIRED';
      } else if (parsedExpiry <= thirtyDaysAhead) {
        validityStatus = 'EXPIRING_SOON';
      }
    }

    // 4. Save metadata into Neon PostgreSQL
    const docRecord = await prisma.$transaction(async (tx) => {
      const doc = await tx.vendorDocument.create({
        data: {
          id: documentId,
          workspaceId: workspace.id,
          vendorId: vendor.id,
          documentTypeId: resolvedTypeId!,
          fileName: originalFileName,
          fileSize: storageResult.sizeFormatted,
          fileUrl: `/api/documents/${documentId}/preview`,
          storagePath: storageResult.storageKey,
          mimeType: mimeType,
          uploadedBy: dbUser.name || authUser.email,
          expiryDate: parsedExpiry,
          status: validityStatus,
          verificationStatus: 'PENDING',
          documentNumber,
          notes,
          uploadedAt: new Date(),
        },
        include: {
          documentType: true,
          vendor: true,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          workspaceId: workspace.id,
          userId: dbUser.id,
          action: 'DOCUMENT_UPLOADED',
          entityType: 'DOCUMENT',
          entityId: doc.id,
          metadata: {
            vendorName: vendor.vendorName,
            documentType: doc.documentType.name,
            fileName: originalFileName,
            fileSize: storageResult.sizeFormatted,
          },
        },
      });

      return doc;
    });

    const signedUrl = await StorageService.getSignedUrl(storageResult.storageKey, 3600);

    return NextResponse.json(
      {
        success: true,
        document: {
          id: docRecord.id,
          vendorId: docRecord.vendorId,
          vendorName: docRecord.vendor.vendorName,
          type: docRecord.documentType.name,
          fileName: docRecord.fileName,
          fileSize: docRecord.fileSize,
          fileUrl: signedUrl || docRecord.fileUrl,
          uploadedAt: docRecord.uploadedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          expiryDate: docRecord.expiryDate ? docRecord.expiryDate.toISOString().split('T')[0] : null,
          status: 'pending',
          verificationStatus: 'PENDING',
          mimeType: docRecord.mimeType,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/documents/upload POST] Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
