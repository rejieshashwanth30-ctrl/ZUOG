'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Bell, MessageSquare, Mail, Calendar, ShieldCheck } from 'lucide-react';

export function CreateReminderModal() {
  const {
    selectedVendorForReminder,
    setSelectedVendorForReminder,
    vendors,
    addReminder,
  } = useApp();

  // 39. CREATE REMINDER UI Fields
  const [vendorId, setVendorId] = useState('');
  const [docType, setDocType] = useState('Insurance Certificate');
  const [timing, setTiming] = useState<'30_days' | '15_days' | '7_days' | 'on_expiry'>('15_days');
  const [channels, setChannels] = useState<('whatsapp' | 'email')[]>(['whatsapp', 'email']);
  const [recipients, setRecipients] = useState<('vendor' | 'internal')[]>(['vendor', 'internal']);
  const [expiryDate, setExpiryDate] = useState('2026-12-15');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedVendorForReminder) {
      setVendorId(selectedVendorForReminder.vendorId);
      if (selectedVendorForReminder.documentType) {
        setDocType(selectedVendorForReminder.documentType);
      }
    } else if (vendors.length > 0 && !vendorId) {
      setVendorId(vendors[0].id);
    }
  }, [selectedVendorForReminder, vendors, vendorId]);

  if (!selectedVendorForReminder) return null;

  const currentVendor = vendors.find((v) => v.id === vendorId);

  const toggleChannel = (ch: 'whatsapp' | 'email') => {
    setChannels((prev) =>
      prev.includes(ch) ? (prev.length > 1 ? prev.filter((c) => c !== ch) : prev) : [...prev, ch]
    );
  };

  const toggleRecipient = (rc: 'vendor' | 'internal') => {
    setRecipients((prev) =>
      prev.includes(rc) ? (prev.length > 1 ? prev.filter((r) => r !== rc) : prev) : [...prev, rc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVendor) return;

    setIsSubmitting(true);
    try {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + (timing === '7_days' ? 2 : timing === '15_days' ? 5 : 10));
      const nextDateStr = nextDate.toISOString().split('T')[0];

      await addReminder({
        vendorId: currentVendor.id,
        vendorName: currentVendor.name,
        documentType: docType,
        expiryDate,
        nextReminderDate: nextDateStr,
        timing,
        channels,
        recipients,
        status: 'scheduled',
      });

      setSelectedVendorForReminder(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={!!selectedVendorForReminder}
      onClose={() => setSelectedVendorForReminder(null)}
      title="Create Reminder"
      subtitle="Schedule automated compliance renewal alerts"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Vendor Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Vendor
          </label>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900 font-medium"
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.category})
              </option>
            ))}
          </select>
        </div>

        {/* Document Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Document
            </label>
            <input
              type="text"
              required
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Certificate Expiry Date
            </label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900"
            />
          </div>
        </div>

        {/* 39. Reminder timing: 30 days before, 15 days before, 7 days before, On expiry */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Reminder Timing
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: '30_days', label: '30 days before' },
              { id: '15_days', label: '15 days before' },
              { id: '7_days', label: '7 days before' },
              { id: 'on_expiry', label: 'On expiry' },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTiming(t.id as any)}
                className={`py-2 px-2 text-center rounded text-xs font-medium border transition-all cursor-pointer ${
                  timing === t.id
                    ? 'border-[#0B1E3B] bg-[#0B1E3B] text-white font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 39. Channels: WhatsApp, Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Channels
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer select-none ${
                channels.includes('whatsapp')
                  ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-medium'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={channels.includes('whatsapp')}
                onChange={() => toggleChannel('whatsapp')}
                className="rounded border-slate-300 text-[#00A878] focus:ring-[#00A878]"
              />
              <span className="text-xs">WhatsApp</span>
            </label>

            <label
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer select-none ${
                channels.includes('email')
                  ? 'border-sky-500 bg-sky-50/40 text-sky-950 font-medium'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={channels.includes('email')}
                onChange={() => toggleChannel('email')}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs">Email</span>
            </label>
          </div>
        </div>

        {/* 39. Recipients: Vendor, Internal team */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Recipients
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer select-none ${
                recipients.includes('vendor')
                  ? 'border-[#0B1E3B] bg-slate-50 text-slate-900 font-medium'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={recipients.includes('vendor')}
                onChange={() => toggleRecipient('vendor')}
                className="rounded border-slate-300 text-[#0B1E3B] focus:ring-[#0B1E3B]"
              />
              <span className="text-xs">Vendor</span>
            </label>

            <label
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer select-none ${
                recipients.includes('internal')
                  ? 'border-[#0B1E3B] bg-slate-50 text-slate-900 font-medium'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={recipients.includes('internal')}
                onChange={() => toggleRecipient('internal')}
                className="rounded border-slate-300 text-[#0B1E3B] focus:ring-[#0B1E3B]"
              />
              <span className="text-xs">Internal team</span>
            </label>
          </div>
        </div>

        {/* 39. CTA: Schedule Reminder */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSelectedVendorForReminder(null)}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Schedule Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
}
