import { prisma } from '../prisma';
import type { Workspace } from '@prisma/client';

export const DEFAULT_DOCUMENT_TYPES = [
  { name: 'GST Certificate', code: 'gst_certificate', description: 'Valid GSTIN registration certificate', isRequiredDefault: true },
  { name: 'PAN Card', code: 'pan_card', description: 'Permanent Account Number verification', isRequiredDefault: true },
  { name: 'Udyam Registration', code: 'udyam_registration', description: 'MSME registration certificate', isRequiredDefault: true },
  { name: 'Insurance Certificate', code: 'insurance_certificate', description: 'Commercial liability or transit policy', isRequiredDefault: true },
  { name: 'ISO 9001', code: 'iso_9001', description: 'Quality management certification', isRequiredDefault: true },
  { name: 'Factory License', code: 'factory_license', description: 'Statutory factory inspection & license', isRequiredDefault: false },
  { name: 'Trade License', code: 'trade_license', description: 'Municipal authority operational license', isRequiredDefault: false },
  { name: 'Vendor Agreement', code: 'vendor_agreement', description: 'Signed supply master agreement & NDA', isRequiredDefault: false },
  { name: 'Quality Certificate', code: 'quality_certificate', description: 'Raw material test report / calibration cert', isRequiredDefault: false },
];

export class WorkspaceRepository {
  /**
   * Creates a new organization workspace in Neon PostgreSQL,
   * associates the owner, and initializes default statutory document types.
   */
  static async createWorkspace({
    ownerId,
    name,
    companyName,
    companyEmail,
    companyPhone,
    gstin,
    address,
    city,
    state,
  }: {
    ownerId: string;
    name: string;
    companyName: string;
    companyEmail?: string;
    companyPhone?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
  }): Promise<Workspace> {
    try {
      // Create workspace and add owner as member in a transaction
      return await prisma.$transaction(
        async (tx) => {
          const workspace = await tx.workspace.create({
            data: {
              name,
              ownerId,
              companyName,
              companyEmail,
              companyPhone,
              gstin,
              address,
              city,
              state,
              members: {
                create: {
                  userId: ownerId,
                  role: 'OWNER',
                },
              },
            },
          });

          // Seed default document types catalog for this workspace in a single batch query
          await tx.documentType.createMany({
            data: DEFAULT_DOCUMENT_TYPES.map((doc) => ({
              workspaceId: workspace.id,
              name: doc.name,
              code: doc.code,
              description: doc.description,
              isRequiredDefault: doc.isRequiredDefault,
            })),
          });

          // Record audit log
          await tx.auditLog.create({
            data: {
              workspaceId: workspace.id,
              userId: ownerId,
              action: 'WORKSPACE_CREATED',
              entityType: 'WORKSPACE',
              entityId: workspace.id,
              metadata: {
                companyName,
                gstin,
              },
            },
          });

          return workspace;
        },
        { timeout: 30000, maxWait: 15000 }
      );
    } catch (err) {
      console.error('[WorkspaceRepository] Error creating workspace:', err);
      throw err;
    }
  }

  /**
   * Resolves the active workspace for a user.
   */
  static async getWorkspaceForUser(userId: string): Promise<Workspace | null> {
    try {
      // Find workspace where user is a member
      const memberRecord = await prisma.workspaceMember.findFirst({
        where: { userId },
        include: {
          workspace: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      if (memberRecord) {
        return memberRecord.workspace;
      }

      // Check owned workspaces
      return await prisma.workspace.findFirst({
        where: { ownerId: userId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (err) {
      console.warn('[WorkspaceRepository] Failed to fetch workspace for user:', err);
      return null;
    }
  }

  /**
   * Critical Security Check (Section 14):
   * Verifies that the authenticated user has verified access to the requested workspace.
   * Prevents IDOR and cross-company data leakage.
   */
  static async verifyUserWorkspaceAccess(userId: string, workspaceId: string): Promise<boolean> {
    try {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });
      return Boolean(membership);
    } catch (err) {
      console.error('[WorkspaceRepository] Error verifying access:', err);
      return false;
    }
  }

  /**
   * Fetches workspace by ID with member count
   */
  static async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    try {
      return await prisma.workspace.findUnique({
        where: { id: workspaceId },
      });
    } catch (err) {
      console.warn('[WorkspaceRepository] Error fetching workspace by id:', err);
      return null;
    }
  }
}
