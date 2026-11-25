import { prisma } from '../prisma';
import type { AuditLog } from '@prisma/client';

export class AuditLogRepository {
  /**
   * Logs an action in the workspace audit trail.
   */
  static async logAction(
    workspaceId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>,
    userId?: string | null
  ): Promise<AuditLog | null> {
    try {
      return await prisma.auditLog.create({
        data: {
          workspaceId,
          userId,
          action,
          entityType,
          entityId,
          metadata: metadata as any,
        },
      });
    } catch (err) {
      console.warn('[AuditLogRepository] Failed to record audit log:', err);
      return null;
    }
  }

  /**
   * Retrieves recent audit logs for compliance monitoring.
   */
  static async getRecentLogs(workspaceId: string, limit = 25): Promise<AuditLog[]> {
    try {
      return await prisma.auditLog.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
    } catch (err) {
      console.warn('[AuditLogRepository] Error reading audit logs:', err);
      return [];
    }
  }
}
