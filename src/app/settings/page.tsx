'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Bell,
  Sliders,
  Users,
  Shield,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  MessageSquare,
  KeyRound,
} from 'lucide-react';

const SETTINGS_NAV_ITEMS = [
  { id: 'profile', label: 'Business Profile', icon: Building2 },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell },
  { id: 'rules', label: 'Reminder Rules', icon: Sliders },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const { showToast } = useApp();
  // 41. SETTINGS Sections: Business Profile, Notification Preferences, Reminder Rules, Team, Security
  const [activeSection, setActiveSection] = useState<
    'profile' | 'notifications' | 'rules' | 'team' | 'security'
  >('profile');

  // Business Profile State
  const [companyName, setCompanyName] = useState('ABC Manufacturing Pvt Ltd');
  const [businessType, setBusinessType] = useState('Automotive Components & Precision Machining');
  const [phone, setPhone] = useState('+91 98401 23456');
  const [email, setEmail] = useState('rejiesh@abcmfg.co.in');
  const [address, setAddress] = useState('Plot 18, SIDCO Industrial Estate, Kurichi, Coimbatore, Tamil Nadu');

  // Notification Preferences
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [internalAlerts, setInternalAlerts] = useState(true);

  // Reminder rules defaults: 30 days, 15 days, 7 days
  const [rule30Days, setRule30Days] = useState(true);
  const [rule15Days, setRule15Days] = useState(true);
  const [rule7Days, setRule7Days] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = () => {
    showToast('Settings Saved', 'Your organizational preferences were updated.');
  };

  return (
    <AppShell
      pageTitle="Settings"
      pageSubtitle="Configure business profile, automated reminder rules, team members, and security controls."
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Sidebar (4 cols) */}
        <div className="md:col-span-4 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs h-fit space-y-1">
          {SETTINGS_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#0B1E3B] text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane (8 cols) */}
        <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-2xs">
          {/* Section 1: Business Profile */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Business Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your registered enterprise details used on compliance document requests
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Business Type
                  </label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button size="sm" onClick={handleSave}>
                  Save Profile
                </Button>
              </div>
            </div>
          )}

          {/* Section 2: Notification Preferences: WhatsApp reminders, Email reminders, Internal alerts */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Notification Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which notification channels dispatch automated alerts to suppliers
                </p>
              </div>

              <div className="space-y-3.5">
                <label className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        WhatsApp Reminders
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Deliver automated WhatsApp renewal notifications directly to supplier phones
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#00A878] rounded border-slate-300 focus:ring-[#00A878]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-sky-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Email Reminders</div>
                      <div className="text-[11px] text-slate-500">
                        Send formal renewal requests with one-click direct upload portal links
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#0B1E3B] rounded border-slate-300 focus:ring-[#0B1E3B]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Internal Alerts
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Notify internal quality and procurement officers when certificates approach expiration
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={internalAlerts}
                    onChange={(e) => setInternalAlerts(e.target.checked)}
                    className="w-4 h-4 text-[#0B1E3B] rounded border-slate-300 focus:ring-[#0B1E3B]"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button size="sm" onClick={handleSave}>
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {/* Section 3: Reminder Rules: 30 days, 15 days, 7 days */}
          {activeSection === 'rules' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Reminder Rules</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Advance notification schedule triggers for expiring compliance certificates
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">30 Days</span>
                    <span className="text-[11px] text-slate-500">
                      Initial renewal notice for policies requiring audit or board approval
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rule30Days}
                    onChange={(e) => setRule30Days(e.target.checked)}
                    className="w-4 h-4 text-[#0B1E3B] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">15 Days</span>
                    <span className="text-[11px] text-slate-500">
                      Standard follow-up reminder with direct mobile upload link
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rule15Days}
                    onChange={(e) => setRule15Days(e.target.checked)}
                    className="w-4 h-4 text-[#0B1E3B] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">7 Days</span>
                    <span className="text-[11px] text-slate-500">
                      Urgent escalation notice for impending expiration
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rule7Days}
                    onChange={(e) => setRule7Days(e.target.checked)}
                    className="w-4 h-4 text-[#0B1E3B] rounded"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button size="sm" onClick={handleSave}>
                  Save Rules
                </Button>
              </div>
            </div>
          )}

          {/* Section 4: Team: Members, Roles, Permissions */}
          {activeSection === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Team</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Workspace members, roles, and compliance verification permissions
                  </p>
                </div>
                <Button size="sm" variant="secondary">
                  + Invite Member
                </Button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-3.5 flex items-center justify-between bg-white text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#0B1E3B] text-white flex items-center justify-center font-bold">
                      RA
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Rejiesh Ashwanth (You)</div>
                      <div className="text-[11px] text-slate-400">rejiesh@abcmfg.co.in</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      Admin & Auditor
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Full Permissions</span>
                  </div>
                </div>

                <div className="p-3.5 flex items-center justify-between bg-white text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                      PS
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Priya Sharma</div>
                      <div className="text-[11px] text-slate-400">priya@abcmfg.co.in</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                      Procurement Officer
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Manage Vendors & Reminders</span>
                  </div>
                </div>

                <div className="p-3.5 flex items-center justify-between bg-white text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                      MN
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">M. Natarajan</div>
                      <div className="text-[11px] text-slate-400">natarajan@abcmfg.co.in</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                      Quality Lead
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Verify Documents</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Security: Password, Sessions, Account */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Security</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Password management, active sessions, and workspace account controls
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900 max-w-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900 max-w-sm"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold block text-slate-900 mb-0.5">Sessions</span>
                  <span>Currently active on Windows (Chrome) • Tamil Nadu, India</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold block text-slate-900 mb-0.5">Account Status</span>
                  <span>ADYK ZUOG Workspace Active • Single Tenant Security Isolation</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button size="sm" onClick={handleSave}>
                  Update Password
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
