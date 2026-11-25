import { prisma } from '../prisma';
import type { Reminder, ReminderStatus } from '@prisma/client';

export class ReminderRepository {
  /**
   * Retrieves all scheduled reminders for a workspace.
   */
  static async getRemindersByWorkspace(
    workspaceId: string,
    status?: ReminderStatus
  ): Promise<Reminder[]> {
    try {
      const where: Record<string, unknown> = {
        workspaceId,
      };

      if (status) {
        where.status = status;
      }

      return await prisma.reminder.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              vendorName: true,
              email: true,
              phone: true,
            },
          },
          document: {
            include: {
              documentType: true,
            },
          },
        },
        orderBy: {
          scheduledFor: 'asc',
        },
      });
    } catch (err) {
      console.warn('[ReminderRepository] Error fetching reminders from Neon:', err);
      return [];
    }
  }

  /**
   * Schedules a reminder for an expiring or missing document.
   */
  static async scheduleReminder(
    workspaceId: string,
    data: {
      vendorId: string;
      documentId?: string;
      reminderType: string;
      scheduledFor: Date;
      channels: string[];
      recipients: string[];
      notes?: string;
    },
    userId?: string | null
  ): Promise<Reminder> {
    return prisma.$transaction(async (tx) => {
      const reminder = await tx.reminder.create({
        data: {
          workspaceId,
          vendorId: data.vendorId,
          documentId: data.documentId,
          reminderType: data.reminderType,
          scheduledFor: data.scheduledFor,
          channels: data.channels,
          recipients: data.recipients,
          status: 'PENDING',
          notes: data.notes,
        },
        include: {
          vendor: true,
        },
      });

      await tx.auditLog.create({
        data: {
          workspaceId,
          userId,
          action: 'REMINDER_SCHEDULED',
          entityType: 'REMINDER',
          entityId: reminder.id,
          metadata: {
            vendorName: reminder.vendor.vendorName,
            reminderType: data.reminderType,
            scheduledFor: data.scheduledFor.toISOString(),
          },
        },
      });

      return reminder;
    });
  }

  /**
   * Dispatches a manual or automated reminder.
   */
  static async markReminderSent(
    workspaceId: string,
    reminderId: string,
    userId?: string | null
  ): Promise<Reminder | null> {
    const existing = await prisma.reminder.findFirst({
      where: { id: reminderId, workspaceId },
      include: { vendor: true },
    });

    if (!existing) return null;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.reminder.update({
        where: { id: reminderId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          workspaceId,
          userId,
          action: 'REMINDER_SENT',
          entityType: 'REMINDER',
          entityId: reminderId,
          metadata: {
            vendorName: existing.vendor.vendorName,
            channels: existing.channels,
          },
        },
      });

      return updated;
    });
  }

  /**
   * Cancels/deletes a scheduled reminder.
   */
  static async cancelReminder(
    workspaceId: string,
    reminderId: string,
    userId?: string | null
  ): Promise<boolean> {
    const existing = await prisma.reminder.findFirst({
      where: { id: reminderId, workspaceId },
    });

    if (!existing) return false;

    await prisma.$transaction(async (tx) => {
      await tx.reminder.delete({
        where: { id: reminderId },
      });

      await tx.auditLog.create({
        data: {
          workspaceId,
          userId,
          action: 'REMINDER_CANCELLED',
          entityType: 'REMINDER',
          entityId: reminderId,
        },
      });
    });

    return true;
  }
}
