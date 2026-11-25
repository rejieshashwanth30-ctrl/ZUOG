import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/db/repositories/userRepository';
import { WorkspaceRepository } from '@/lib/db/repositories/workspaceRepository';
import { ReminderRepository } from '@/lib/db/repositories/reminderRepository';

/**
 * GET /api/reminders
 * Retrieves scheduled reminders strictly scoped to the authenticated user's workspace.
 * Starts from a fresh empty state with zero mock reminders.
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
      return NextResponse.json({ reminders: [] }, { status: 200 });
    }

    const dbReminders = await ReminderRepository.getRemindersByWorkspace(workspace.id);

    const reminders = dbReminders.map((r: any) => ({
      id: r.id,
      vendorId: r.vendorId,
      vendorName: r.vendor?.vendorName || 'Vendor',
      documentType: r.document?.documentType?.name || 'Compliance Certificate',
      expiryDate: r.document?.expiryDate ? r.document.expiryDate.toISOString().split('T')[0] : null,
      nextReminderDate: r.scheduledFor.toISOString().split('T')[0],
      timing: r.reminderType || '15_days',
      channels: (r.channels as any) || [r.channel?.toLowerCase() || 'email'],
      channel: r.channel || (r.channels?.[0] ? r.channels[0].toUpperCase() : 'EMAIL'),
      recipient: r.recipient || (r.channel === 'WHATSAPP' ? r.vendor?.phone : r.vendor?.email) || 'Registered Contact',
      recipients: ['vendor'] as const,
      status: r.status.toLowerCase() as any,
      createdAt: r.createdAt.toISOString().split('T')[0],
      lastSentAt: r.sentAt ? r.sentAt.toISOString().split('T')[0] : undefined,
      failureReason: r.failureReason || undefined,
      retryCount: r.retryCount || 0,
      providerMessageId: r.providerMessageId || undefined,
    }));

    return NextResponse.json({ reminders }, { status: 200 });
  } catch (error) {
    console.error('[API /api/reminders GET] Error querying Neon database:', error);
    return NextResponse.json(
      { error: 'Unable to load reminders from database.', reminders: [] },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reminders
 * Schedules a reminder scoped to the workspace and vendor.
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
    const { vendorId, documentId, scheduledDate, channels, recipients, notes, documentType } = body;

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required.' }, { status: 400 });
    }

    const created = await ReminderRepository.scheduleReminder(
      workspace.id,
      {
        vendorId,
        documentId,
        reminderType: 'EXPIRY_ALERT',
        scheduledFor: scheduledDate ? new Date(scheduledDate) : new Date(),
        channels: channels || ['email', 'whatsapp'],
        recipients: recipients || ['vendor', 'internal'],
        notes,
      },
      dbUser.id
    );

    const reminder = {
      id: created.id,
      vendorId: created.vendorId,
      vendorName: (created as any).vendor?.vendorName || 'Vendor',
      documentType: documentType || 'Compliance Certificate',
      expiryDate: '2026-12-31',
      nextReminderDate: created.scheduledFor.toISOString().split('T')[0],
      timing: '15_days' as const,
      channels: created.channels as any,
      recipients: ['vendor', 'internal'] as const,
      status: created.status.toLowerCase() as any,
      createdAt: created.createdAt.toISOString().split('T')[0],
    };

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error('[API /api/reminders POST] Error creating reminder in Neon:', error);
    return NextResponse.json({ error: 'Failed to schedule reminder in database.' }, { status: 500 });
  }
}
