import { prisma } from '../prisma';
import type { VendorDocument, DocumentValidityStatus, VerificationStatus } from '@prisma/client';
import { ExpiryEngine } from '@/lib/notifications/expiryEngine';

export class DocumentRepository {
  /**
   * Retrieves all documents for a workspace (optionally filtered by vendor).
   */
  static async getDocumentsByWorkspace(
    workspaceId: string,
    options?: {
      vendorId?: string;
      status?: DocumentValidityStatus;
      verificationStatus?: VerificationStatus;
      documentTypeCode?: string;
    }
  ): Promise<VendorDocument[]> {
    try {
      const where: Record<string, unknown> = {
        workspaceId,
      };

      if (options?.vendorId) {
        where.vendorId = options.vendorId;
      }

      if (options?.status) {
        where.status = options.status;
      }

      if (options?.verificationStatus) {
        where.verificationStatus = options.verificationStatus;
      }

      if (options?.documentTypeCode) {
        where.documentType = {
          code: options.documentTypeCode,
        };
      }

      return await prisma.vendorDocument.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              vendorName: true,
              category: true,
            },
          },
          documentType: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (err) {
      console.warn('[DocumentRepository] Error querying documents from Neon:', err);
      return [];
    }
  }

  /**
   * Retrieves a single document by ID within a workspace.
   */
  static async getDocumentById(
    workspaceId: string,
    documentId: string
  ): Promise<VendorDocument | null> {
    try {
      return await prisma.vendorDocument.findFirst({
        where: { id: documentId, workspaceId },
        include: {
          vendor: true,
          documentType: true,
        },
      });
    } catch (err) {
      console.warn('[DocumentRepository] Error querying document by ID:', err);
      return null;
    }
  }

  /**
   * Creates or records a newly uploaded document from the vendor portal or dashboard.
   */
  static async uploadDocument(
    workspaceId: string,
    vendorId: string,
    documentTypeId: string,
    data: {
      fileName: string;
      fileUrl?: string;
      storagePath?: string;
      mimeType?: string;
      fileSize?: string;
      documentNumber?: string;
      issueDate?: Date;
      expiryDate?: Date;
      notes?: string;
    },
    userId?: string | null
  ): Promise<VendorDocument> {
    return prisma.$transaction(
      async (tx) => {
        // Determine initial validity status based on expiryDate
        let validityStatus: DocumentValidityStatus = 'VALID';
        if (data.expiryDate) {
          const now = new Date();
          const thirtyDaysAhead = new Date();
          thirtyDaysAhead.setDate(now.getDate() + 30);

          if (data.expiryDate < now) {
            validityStatus = 'EXPIRED';
          } else if (data.expiryDate <= thirtyDaysAhead) {
            validityStatus = 'EXPIRING_SOON';
          }
        }

        const doc = await tx.vendorDocument.create({
          data: {
            workspaceId,
            vendorId,
            documentTypeId,
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            storagePath: data.storagePath,
            mimeType: data.mimeType,
            fileSize: data.fileSize,
            documentNumber: data.documentNumber,
            issueDate: data.issueDate,
            expiryDate: data.expiryDate,
            status: validityStatus,
            verificationStatus: 'PENDING',
            uploadedAt: new Date(),
            uploadedBy: userId,
            notes: data.notes,
          },
          include: {
            documentType: true,
            vendor: true,
          },
        });

        // Invalidate old scheduled reminders if re-uploading an existing certificate
        await ExpiryEngine.invalidateOldReminders(doc.id, data.expiryDate);

        // Audit trail
        await tx.auditLog.create({
          data: {
            workspaceId,
            userId,
            action: 'DOCUMENT_UPLOADED',
            entityType: 'DOCUMENT',
            entityId: doc.id,
            metadata: {
              vendorId,
              documentType: doc.documentType.name,
              fileName: data.fileName,
            },
          },
        });

        return doc;
      },
      { timeout: 25000, maxWait: 15000 }
    );
  }

  /**
   * Verifies a document and marks it as compliant.
   */
  static async verifyDocument(
    workspaceId: string,
    documentId: string,
    verifierName: string,
    userId?: string | null
  ): Promise<VendorDocument | null> {
    const existing = await prisma.vendorDocument.findFirst({
      where: { id: documentId, workspaceId },
      include: { documentType: true, vendor: true },
    });

    if (!existing) return null;

    return prisma.$transaction(
      async (tx) => {
        const updated = await tx.vendorDocument.update({
          where: { id: documentId },
          data: {
            verificationStatus: 'VERIFIED',
            verifiedAt: new Date(),
            verifiedBy: verifierName,
            status: 'VALID',
          },
        });

        await tx.auditLog.create({
          data: {
            workspaceId,
            userId,
            action: 'DOCUMENT_VERIFIED',
            entityType: 'DOCUMENT',
            entityId: documentId,
            metadata: {
              verifierName,
              vendorName: existing.vendor.vendorName,
              documentType: existing.documentType.name,
            },
          },
        });

        return updated;
      },
      { timeout: 25000, maxWait: 15000 }
    );
  }

  /**
   * Rejects an uploaded document with a mandatory reason.
   */
  static async rejectDocument(
    workspaceId: string,
    documentId: string,
    reason: string,
    userId?: string | null
  ): Promise<VendorDocument | null> {
    const existing = await prisma.vendorDocument.findFirst({
      where: { id: documentId, workspaceId },
      include: { documentType: true, vendor: true },
    });

    if (!existing) return null;

    return prisma.$transaction(
      async (tx) => {
        const updated = await tx.vendorDocument.update({
          where: { id: documentId },
          data: {
            verificationStatus: 'REJECTED',
            status: 'REJECTED',
            rejectionReason: reason,
          },
        });

        await tx.auditLog.create({
          data: {
            workspaceId,
            userId,
            action: 'DOCUMENT_REJECTED',
            entityType: 'DOCUMENT',
            entityId: documentId,
            metadata: {
              reason,
              vendorName: existing.vendor.vendorName,
              documentType: existing.documentType.name,
            },
          },
        });

        return updated;
      },
      { timeout: 25000, maxWait: 15000 }
    );
  }

  /**
   * Permanently deletes a document from Neon PostgreSQL and records an audit log.
   */
  static async deleteDocument(
    workspaceId: string,
    documentId: string,
    userId?: string | null
  ): Promise<boolean> {
    const existing = await prisma.vendorDocument.findFirst({
      where: { id: documentId, workspaceId },
      include: { documentType: true, vendor: true },
    });

    if (!existing) return false;

    return prisma.$transaction(
      async (tx) => {
        // Delete related reminders first
        await tx.reminder.deleteMany({
          where: { documentId },
        });

        // Delete the document record
        await tx.vendorDocument.delete({
          where: { id: documentId },
        });

        // Audit trail
        await tx.auditLog.create({
          data: {
            workspaceId,
            userId,
            action: 'DOCUMENT_DELETED',
            entityType: 'DOCUMENT',
            entityId: documentId,
            metadata: {
              fileName: existing.fileName,
              documentType: existing.documentType?.name,
              vendorName: existing.vendor?.vendorName,
            },
          },
        });

        return true;
      },
      { timeout: 25000, maxWait: 15000 }
    );
  }
}
