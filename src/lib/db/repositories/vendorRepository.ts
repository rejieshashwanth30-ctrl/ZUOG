import { prisma } from '../prisma';
import type { Vendor, VendorStatus } from '@prisma/client';

export class VendorRepository {
  /**
   * Retrieves all vendors for a specific workspace.
   * Strict workspace isolation: queries always include workspaceId.
   */
  static async getVendorsByWorkspace(
    workspaceId: string,
    options?: {
      status?: VendorStatus;
      category?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<Vendor[]> {
    try {
      const where: Record<string, unknown> = {
        workspaceId,
      };

      if (options?.status) {
        where.status = options.status;
      }

      if (options?.category && options.category !== 'all') {
        where.category = options.category;
      }

      if (options?.search && options.search.trim()) {
        const q = options.search.trim();
        where.OR = [
          { vendorName: { contains: q, mode: 'insensitive' } },
          { contactPerson: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { gstin: { contains: q, mode: 'insensitive' } },
        ];
      }

      return await prisma.vendor.findMany({
        where,
        include: {
          documents: {
            include: {
              documentType: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: options?.limit ?? 50,
        skip: options?.offset ?? 0,
      });
    } catch (err) {
      console.warn('[VendorRepository] Failed to fetch vendors from Neon:', err);
      return [];
    }
  }

  /**
   * Gets a specific vendor by ID with strict workspace ownership validation.
   * Prevents IDOR vulnerabilities.
   */
  static async getVendorById(workspaceId: string, vendorId: string): Promise<Vendor | null> {
    try {
      return await prisma.vendor.findFirst({
        where: {
          id: vendorId,
          workspaceId, // Tenant security scope
        },
        include: {
          documents: {
            include: {
              documentType: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          reminders: {
            orderBy: {
              scheduledFor: 'asc',
            },
          },
        },
      });
    } catch (err) {
      console.warn('[VendorRepository] Error getting vendor by ID:', err);
      return null;
    }
  }

  /**
   * Registers a new supplier in the workspace and records an audit log.
   */
  static async createVendor(
    workspaceId: string,
    userId: string | null,
    data: {
      vendorName: string;
      contactPerson: string;
      email: string;
      phone: string;
      category: string;
      address?: string;
      city?: string;
      state?: string;
      gstin?: string;
      pan?: string;
      status?: VendorStatus;
      notes?: string;
      requiredDocumentTypeCodes?: string[];
    }
  ): Promise<Vendor> {
    return prisma.$transaction(
      async (tx) => {
        const vendor = await tx.vendor.create({
          data: {
            workspaceId,
            vendorName: data.vendorName,
            contactPerson: data.contactPerson,
            email: data.email,
            phone: data.phone,
            category: data.category,
            address: data.address,
            city: data.city,
            state: data.state,
            gstin: data.gstin,
            pan: data.pan,
            status: data.status || 'PENDING',
            notes: data.notes,
          },
        });

        // Audit log entry
        await tx.auditLog.create({
          data: {
            workspaceId,
            userId,
            action: 'VENDOR_CREATED',
            entityType: 'VENDOR',
            entityId: vendor.id,
            metadata: {
              vendorName: vendor.vendorName,
              category: vendor.category,
              email: vendor.email,
            },
          },
        });

        return vendor;
      },
      { timeout: 25000, maxWait: 15000 }
    );
  }

  /**
   * Updates vendor details with tenant verification.
   */
  static async updateVendor(
    workspaceId: string,
    vendorId: string,
    userId: string | null,
    updates: Partial<{
      vendorName: string;
      contactPerson: string;
      email: string;
      phone: string;
      category: string;
      address: string;
      city: string;
      state: string;
      gstin: string;
      pan: string;
      status: VendorStatus;
      notes: string;
    }>
  ): Promise<Vendor | null> {
    const existing = await prisma.vendor.findFirst({
      where: { id: vendorId, workspaceId },
    });

    if (!existing) return null;

    return prisma.$transaction(
      async (tx) => {
        const updated = await tx.vendor.update({
          where: { id: vendorId },
          data: updates,
        });

        await tx.auditLog.create({
          data: {
            workspaceId,
            userId,
            action: 'VENDOR_UPDATED',
            entityType: 'VENDOR',
            entityId: vendorId,
            metadata: updates,
          },
        });

        return updated;
      },
      { timeout: 25000, maxWait: 15000 }
    );
  }

  /**
   * Deletes a vendor safely with cascade and audit log.
   */
  static async deleteVendor(
    workspaceId: string,
    vendorId: string,
    userId: string | null
  ): Promise<boolean> {
    const existing = await prisma.vendor.findFirst({
      where: { id: vendorId, workspaceId },
    });

    if (!existing) return false;

    await prisma.$transaction(
      async (tx) => {
        await tx.vendor.delete({
          where: { id: vendorId },
        });

        await tx.auditLog.create({
          data: {
            workspaceId,
            userId,
            action: 'VENDOR_DELETED',
            entityType: 'VENDOR',
            entityId: vendorId,
            metadata: {
              vendorName: existing.vendorName,
            },
          },
        });
      },
      { timeout: 25000, maxWait: 15000 }
    );

    return true;
  }
}
