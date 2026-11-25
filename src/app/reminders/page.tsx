'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Bell,
  Plus,
  Send,
  MessageSquare,
  Mail,
  Calendar,
  Building2,
  FileText,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Reminder } from '@/types';

export default function RemindersPage() {
  const {
    reminders,
    sendReminderNow,
    deleteReminder,
    setSelectedVendorForReminder,
    vendors,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'sent' | 'failed' | 'expired'>('all');
  const [isRunningScheduler, setIsRunningScheduler] = useState(false);

  // Categorize reminders
  const { allReminders, pendingReminders, sentReminders, failedReminders, expiredAlerts } = useMemo(() => {
    const pend: Reminder[] = [];
    const sent: Reminder[] = [];
    const fail: Reminder[] = [];
    const exp: Reminder[] = [];

    for (let i = 0; i < reminders.length; i++) {
      const r = reminders[i];
      const s = r.status.toLowerCase();
      if (s === 'scheduled' || s === 'pending' || s === 'processing') {
        pend.push(r);
      } else if (s === 'sent') {
        sent.push(r);
      } else if (s === 'failed') {
        fail.push(r);
      }

      if (r.timing === 'expired') {
        exp.push(r);
      }
    }

    return {
      allReminders: reminders,
      pendingReminders: pend,
      sentReminders: sent,
      failedReminders: fail,
      expiredAlerts: exp,
    };
  }, [reminders]);

  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return pendingReminders;
      case 'sent':
        return sentReminders;
      case 'failed':
        return failedReminders;
      case 'expired':
        return expiredAlerts;
      case 'all':
      default:
        return allReminders;
    }
  }, [activeTab, allReminders, pendingReminders, sentReminders, failedReminders, expiredAlerts]);

  // Handle manual trigger of background scheduler
  const handleRunScheduler = async () => {
    setIsRunningScheduler(true);
    try {
      const res = await fetch('/api/reminders/process', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(
          'Scheduler Cycle Completed',
          `Processed: ${data.metrics?.processed || 0}, Sent: ${data.metrics?.sent || 0}, Generated: ${data.metrics?.generated || 0}`
        );
        // Reload page or re-fetch reminders
        window.location.reload();
      } else {
        showToast('Scheduler Run Failed', data.error || 'Server error', 'error');
      }
    } catch (err: any) {
      showToast('Connection Error', err?.message || 'Could not connect to scheduler.', 'error');
    } finally {
      setIsRunningScheduler(false);
    }
  };

  return (
    <AppShell
      pageTitle="Reminders & Notifications"
      pageSubtitle="Automated WhatsApp and email expiry notification schedules and delivery telemetry."
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B1E3B] tracking-tight">Reminders &amp; Notification Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated WhatsApp and email schedules for statutory validity renewals (30d, 15d, 7d, 1d, expired).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRunningScheduler ? 'animate-spin' : ''}`} />}
            isLoading={isRunningScheduler}
            onClick={handleRunScheduler}
            title="Scan database and trigger due notifications now"
          >
            Run Scheduler Now
          </Button>

          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (vendors.length === 0) {
                showToast('No Suppliers Registered', 'Please add a supplier before scheduling reminders.', 'info');
                return;
              }
              setSelectedVendorForReminder({
                vendorId: vendors[0].id,
                vendorName: vendors[0].name,
                documentType: 'Insurance Certificate',
              });
            }}
          >
            Schedule Reminder
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6 flex flex-wrap gap-4 sm:gap-6 text-xs font-semibold">
        {[
          { id: 'all', label: 'All Reminders', count: allReminders.length, badge: 'bg-slate-100 text-slate-700' },
          { id: 'pending', label: 'Upcoming / Pending', count: pendingReminders.length, badge: 'bg-amber-100 text-amber-800' },
          { id: 'sent', label: 'Sent / Delivered', count: sentReminders.length, badge: 'bg-emerald-100 text-emerald-800' },
          { id: 'failed', label: 'Failed / Retrying', count: failedReminders.length, badge: 'bg-red-100 text-red-800' },
          { id: 'expired', label: 'Expired Alerts', count: expiredAlerts.length, badge: 'bg-rose-100 text-rose-800' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-[#0B1E3B] text-[#0B1E3B]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab.badge}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content List */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders scheduled"
          description={
            vendors.length === 0
              ? 'Add your first supplier to unlock automated expiry notification schedules.'
              : 'Automated renewal alerts will appear here when supplier documents have upcoming expiry dates.'
          }
          actionLabel={vendors.length > 0 ? 'Schedule Reminder' : '+ Add Vendor'}
          onAction={() => {
            if (vendors.length === 0) {
              window.location.href = '/vendors';
              return;
            }
            setSelectedVendorForReminder({
              vendorId: vendors[0].id,
              vendorName: vendors[0].name,
            });
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((rem) => {
            const isSent = rem.status === 'sent';
            const isFailed = rem.status === 'failed';
            const isPending = rem.status === 'scheduled' || rem.status === 'pending' || rem.status === 'processing';

            return (
              <div
                key={rem.id}
                className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {rem.timing.replace('_', ' ').toUpperCase()}
                        </span>
                        {rem.timing === 'expired' && (
                          <span className="text-[9px] font-bold bg-red-100 text-red-800 px-1.5 py-0.2 rounded">
                            EXPIRED
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {rem.documentType}
                      </h3>
                      <Link
                        href={`/vendors/${rem.vendorId}`}
                        className="text-xs font-semibold text-[#0B1E3B] hover:text-[#00A878] hover:underline block mt-0.5"
                      >
                        {rem.vendorName}
                      </Link>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                        isPending
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : isSent
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {rem.status}
                    </span>
                  </div>

                  {/* Dates & Schedule */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Document Expiry:</span>
                      <span className="font-semibold text-slate-800">{rem.expiryDate || 'No date'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Scheduled For:</span>
                      <span className="font-semibold text-slate-800">{rem.nextReminderDate}</span>
                    </div>
                  </div>

                  {/* Recipient & Channels */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Recipient Contact:</span>
                      <span className="font-mono text-slate-700 truncate max-w-[200px]">{rem.recipient || 'Vendor Primary Contact'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Dispatched Via:</span>
                      <div className="flex items-center gap-1.5">
                        {rem.channel === 'WHATSAPP' || rem.channels.includes('whatsapp') ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                            <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp
                          </span>
                        ) : null}
                        {rem.channel === 'EMAIL' || rem.channels.includes('email') ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                            <Mail className="w-3 h-3 text-sky-600" /> Email
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {isSent && rem.providerMessageId && (
                      <div className="text-[10px] text-slate-400 font-mono truncate pt-1">
                        Ref: {rem.providerMessageId}
                      </div>
                    )}

                    {isFailed && rem.failureReason && (
                      <div className="p-2 rounded bg-red-50 text-red-700 text-[11px] border border-red-100 mt-2">
                        {rem.failureReason} (Attempt {rem.retryCount || 1}/3)
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>

                  <div className="flex items-center gap-2">
                    {(isPending || isFailed) && (
                      <Button
                        size="sm"
                        variant={isFailed ? 'primary' : 'secondary'}
                        leftIcon={<Send className="w-3 h-3" />}
                        onClick={() => sendReminderNow(rem.id)}
                      >
                        {isFailed ? 'Retry Now' : 'Send Now'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
