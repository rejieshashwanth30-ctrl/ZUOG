import { Reminder } from '@/types';
import { apiFetch } from '@/lib/api/apiClient';

/**
 * Production Reminder Service Layer
 *
 * Strictly interfaces with the Next.js App Router API (/api/reminders).
 * All schedules and notifications originate from Neon PostgreSQL.
 * Silent localStorage and mock fallbacks have been removed.
 */
export class ReminderService {
  /**
   * Retrieves all scheduled reminders for the authenticated user's workspace.
   */
  static async getAllReminders(): Promise<Reminder[]> {
    if (typeof window === 'undefined') return [];

    const res = await apiFetch('/api/reminders', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Unable to load reminders from Neon database.');
    }

    const json = await res.json();
    return Array.isArray(json.reminders) ? json.reminders : [];
  }

  /**
   * Schedules a renewal notification in Neon PostgreSQL.
   */
  static async createReminder(data: {
    vendorId: string;
    documentId?: string;
    scheduledDate?: string;
    channels?: string[];
    recipients?: string[];
    notes?: string;
    documentType?: string;
  }): Promise<Reminder> {
    const res = await apiFetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to schedule reminder in Neon database.');
    }

    const json = await res.json();
    return json.reminder;
  }

  /**
   * Deletes a reminder from the workspace.
   */
  static async deleteReminder(id: string): Promise<boolean> {
    const res = await apiFetch(`/api/reminders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete reminder.');
    }

    const json = await res.json();
    return Boolean(json.success);
  }
}
