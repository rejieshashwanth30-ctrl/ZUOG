import { prisma } from '../db/prisma';
import { NotificationService } from './notificationService';
import { ReminderType, NotificationChannel, NotificationTemplateData } from './types';
import type { Reminder, ReminderStatus } from '@prisma/client';

export interface ExpiryRuleConfig {
  days: number;
  type: ReminderType;
  label: string;
}

export const DEFAULT_EXPIRY_RULES: ExpiryRuleConfig[] = [
  { days: 30, type: '30_days', label: '30 Days Before' },
  { days: 15, type: '15_days', label: '15 Days Before' },
  { days: 7, type: '7_days', label: '7 Days Before' },
  { days: 1, type: '1_day', label: '1 Day Before' },
  { days: 0, type: 'expired', label: 'Expired' },
];

export class ExpiryEngine {
  /**
   * Generates a deterministic deduplication key for a reminder.
   */
  static buildDedupKey(
    workspaceId: string,
    documentId: string,
    timing: string,
    channel: string,
    recipient: string
  ): string {
    const cleanRecipient = recipient.includes('@')
      ? recipient.toLowerCase().trim()
      : recipient.replace(/\D/g, '');
    return `${workspaceId}_${documentId}_${timing}_${channel}_${cleanRecipient}`.toLowerCase();
  }

  /**
   * When a document is updated with a new expiry date or renewed,
   * invalidates/cancels any pending or processing reminders that were scheduled for the previous expiry date.
   */
  static async invalidateOldReminders(
    documentId: string,
    _newExpiryDate?: Date | null
  ): Promise<number> {
    try {
      const result = await prisma.reminder.updateMany({
        where: {
          documentId,
          status: {
            in: ['PENDING', 'PROCESSING'] as ReminderStatus[],
          },
        },
        data: {
          status: 'CANCELLED',
          notes: 'Cancelled due to document renewal/expiry date change.',
        },
      });

      return result.count;
    } catch (err) {
      console.warn('[ExpiryEngine] Error invalidating old reminders:', err);
      return 0;
    }
  }

  /**
   * Scans all verified and active documents in Neon to generate due reminder records idempotently.
   */
  static async generateDueReminders(workspaceId?: string): Promise<{
    created: number;
    skipped: number;
  }> {
    const now = new Date();
    let createdCount = 0;
    let skippedCount = 0;

    const whereClause: Record<string, unknown> = {
      expiryDate: { not: null },
      verificationStatus: { not: 'REJECTED' },
    };

    if (workspaceId) {
      whereClause.workspaceId = workspaceId;
    }

    const documents = await prisma.vendorDocument.findMany({
      where: whereClause,
      include: {
        vendor: true,
        documentType: true,
        workspace: true,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (const doc of documents) {
      if (!doc.expiryDate) continue;

      const expiryTime = new Date(doc.expiryDate).getTime();
      const diffMs = expiryTime - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Determine applicable rule
      let applicableTiming: ReminderType | null = null;
      if (daysRemaining <= 0) {
        applicableTiming = 'expired';
      } else if (daysRemaining <= 1) {
        applicableTiming = '1_day';
      } else if (daysRemaining <= 7) {
        applicableTiming = '7_days';
      } else if (daysRemaining <= 15) {
        applicableTiming = '15_days';
      } else if (daysRemaining <= 30) {
        applicableTiming = '30_days';
      }

      if (!applicableTiming) continue;

      // Define recipients and channels
      const channels: NotificationChannel[] = ['WHATSAPP', 'EMAIL'];
      const vendorPhone = doc.vendor?.phone;
      const vendorEmail = doc.vendor?.email;

      for (const channel of channels) {
        const recipientContact = channel === 'WHATSAPP' ? vendorPhone : vendorEmail;
        if (!recipientContact || !recipientContact.trim()) continue;

        const dedupKey = this.buildDedupKey(
          doc.workspaceId,
          doc.id,
          applicableTiming,
          channel,
          recipientContact
        );

        // Check if a reminder for this exact key already exists
        const existing = await prisma.reminder.findUnique({
          where: { dedupKey },
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        try {
          await prisma.reminder.create({
            data: {
              workspaceId: doc.workspaceId,
              vendorId: doc.vendorId,
              documentId: doc.id,
              reminderType: applicableTiming,
              scheduledFor: now, // Due immediately
              channels: [channel],
              channel: channel,
              recipient: recipientContact,
              recipients: ['VENDOR'],
              status: 'PENDING',
              dedupKey,
              notes: `Auto-scheduled ${applicableTiming} alert for ${doc.documentType.name}`,
            },
          });
          createdCount++;
        } catch {
          // Handled unique constraint collision safely
          skippedCount++;
        }
      }
    }

    return { created: createdCount, skipped: skippedCount };
  }

  /**
   * Processes all pending reminders that have arrived at their scheduled time.
   */
  static async processDueReminders(workspaceId?: string): Promise<{
    processed: number;
    sent: number;
    failed: number;
    cancelled: number;
  }> {
    const now = new Date();
    let sentCount = 0;
    let failedCount = 0;
    let cancelledCount = 0;

    const whereClause: Record<string, unknown> = {
      scheduledFor: { lte: now },
      OR: [
        { status: 'PENDING' },
        { status: 'FAILED', retryCount: { lt: 3 } },
      ],
    };

    if (workspaceId) {
      whereClause.workspaceId = workspaceId;
    }

    const dueReminders = await prisma.reminder.findMany({
      where: whereClause,
      include: {
        vendor: true,
        document: {
          include: {
            documentType: true,
          },
        },
        workspace: true,
      },
      take: 50, // Batch limit per cycle
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    for (const rem of dueReminders) {
      // Mark processing atomically
      await prisma.reminder.update({
        where: { id: rem.id },
        data: { status: 'PROCESSING' },
      });

      // Validate that the document is still active and valid for notification
      if (!rem.document || !rem.document.expiryDate) {
        await prisma.reminder.update({
          where: { id: rem.id },
          data: {
            status: 'CANCELLED',
            notes: 'Document no longer exists or has no expiry date.',
          },
        });
        cancelledCount++;
        continue;
      }

      const expiryDate = new Date(rem.document.expiryDate);
      const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const channel = (rem.channel || rem.channels[0] || 'EMAIL') as NotificationChannel;
      const recipientContact = rem.recipient || (channel === 'WHATSAPP' ? rem.vendor.phone : rem.vendor.email);

      const portalUrl = `${appUrl}/vendor-upload/${rem.vendor.id}`;

      const templateData: NotificationTemplateData = {
        vendorName: rem.vendor.vendorName,
        companyName: rem.workspace.companyName || rem.workspace.name,
        documentName: rem.document.documentType?.name || 'Statutory Certificate',
        documentNumber: rem.document.documentNumber || undefined,
        expiryDate: expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        daysRemaining,
        portalUrl,
        timing: rem.reminderType as ReminderType,
        recipientPhone: rem.vendor.phone,
        recipientEmail: rem.vendor.email,
        recipientName: rem.vendor.contactPerson,
      };

      const result = await NotificationService.send({
        channel,
        recipient: recipientContact,
        recipientName: rem.vendor.contactPerson || rem.vendor.vendorName,
        templateData,
      });

      if (result.success) {
        await prisma.$transaction([
          prisma.reminder.update({
            where: { id: rem.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              providerMessageId: result.providerMessageId || null,
              failureReason: null,
            },
          }),
          prisma.auditLog.create({
            data: {
              workspaceId: rem.workspaceId,
              action: 'REMINDER_SENT',
              entityType: 'REMINDER',
              entityId: rem.id,
              metadata: {
                vendorId: rem.vendorId,
                vendorName: rem.vendor.vendorName,
                documentName: templateData.documentName,
                channel,
                recipient: recipientContact,
                providerMessageId: result.providerMessageId,
              },
            },
          }),
        ]);
        sentCount++;
      } else {
        await prisma.$transaction([
          prisma.reminder.update({
            where: { id: rem.id },
            data: {
              status: 'FAILED',
              failureReason: result.error || 'Provider delivery error',
              retryCount: { increment: 1 },
            },
          }),
          prisma.auditLog.create({
            data: {
              workspaceId: rem.workspaceId,
              action: 'REMINDER_FAILED',
              entityType: 'REMINDER',
              entityId: rem.id,
              metadata: {
                vendorId: rem.vendorId,
                channel,
                recipient: recipientContact,
                error: result.error,
                retryCount: rem.retryCount + 1,
              },
            },
          }),
        ]);
        failedCount++;
      }
    }

    return {
      processed: dueReminders.length,
      sent: sentCount,
      failed: failedCount,
      cancelled: cancelledCount,
    };
  }

  /**
   * Orchestrates full execution: invalidation, due discovery, and dispatch.
   */
  static async runCycle(workspaceId?: string): Promise<{
    generated: number;
    skipped: number;
    processed: number;
    sent: number;
    failed: number;
    cancelled: number;
    durationMs: number;
  }> {
    const start = Date.now();

    const generation = await this.generateDueReminders(workspaceId);
    const processing = await this.processDueReminders(workspaceId);

    const durationMs = Date.now() - start;

    return {
      generated: generation.created,
      skipped: generation.skipped,
      ...processing,
      durationMs,
    };
  }
}
