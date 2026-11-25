'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldCheck,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  Plus,
  Search,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  LogOut,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';
import { GlobalSearchModal } from './GlobalSearchModal';
import { AddVendorModal } from './AddVendorModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { UploadDocumentModal } from './UploadDocumentModal';
import { CreateReminderModal } from './CreateReminderModal';
import { ToastContainer } from '../ui/Toast';

interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vendors', href: '/vendors', icon: Users },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
  { name: 'Reminders', href: '/reminders', icon: Bell },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export function AppShell({ children, pageTitle, pageSubtitle }: AppShellProps) {
  const pathname = usePathname();
  const {
    currentUser,
    currentWorkspace,
    signOut,
    globalSearchOpen,
    setGlobalSearchOpen,
    addVendorModalOpen,
    setAddVendorModalOpen,
    uploadDocumentModalOpen,
    setUploadDocumentModalOpen,
    selectedDocForPreview,
    selectedVendorForReminder,
    notifications,
    kpiStats,
    showToast,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const displayName = currentUser?.name || 'Rejiesh Ashwanth V';
  const workspaceName = currentWorkspace?.companyName || currentWorkspace?.name || 'ABC Manufacturing';
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'RA';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      {/* Modals & Portals - strictly mounted on demand */}
      {globalSearchOpen && <GlobalSearchModal />}
      {addVendorModalOpen && <AddVendorModal />}
      {uploadDocumentModalOpen && <UploadDocumentModal />}
      {selectedDocForPreview && <DocumentPreviewModal />}
      {selectedVendorForReminder && <CreateReminderModal />}
      <ToastContainer />

      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">ADYK ZUOG Support</h3>
                  <p className="text-xs text-slate-500">Compliance & Operational Assistance</p>
                </div>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="py-4 space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Standard Operational Flow:</span>
                <p>1. Add Vendor profile & specify mandatory statutory documents.</p>
                <p>2. Send secure mobile upload link directly to supplier.</p>
                <p>3. Review & verify documents (GSTIN, ISO, Insurance, Udyam).</p>
                <p>4. Automated 30/15/7 day expiry tracking alerts via WhatsApp & Email.</p>
              </div>

              <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-100 text-teal-900">
                <span className="font-semibold block mb-0.5">Commercial MSME Assistance</span>
                <p className="text-[11px] text-teal-800">
                  Contact operations desk: <span className="font-mono">support@adykzuog.com</span>
                </p>
                <p className="text-[10px] text-teal-700 mt-1">
                  Build & Develop : Rejiesh Ashwanth V • ADYK Multi Venture Company
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setHelpModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200/90 z-30 shadow-xs">
        {/* Brand Logo Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <BrandLogo variant="full" size="md" href="/dashboard" withTagline={false} />
        </div>

        {/* Quick Add Vendor Button */}
        <div className="px-4 pt-4 pb-2">
          <Button
            size="sm"
            fullWidth
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setAddVendorModalOpen(true)}
          >
            + Add Vendor
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-100/90 text-[#0B1E3B] font-semibold border-l-2 border-[#00A878] pl-2.5 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 pl-3 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#00A878]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.name === 'Reminders' && kpiStats.expiringSoon > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full ${
                      isActive ? 'bg-amber-100 text-amber-900' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {kpiStats.expiringSoon}
                  </span>
                )}
                {item.name === 'Compliance' && kpiStats.expired > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full ${
                      isActive ? 'bg-red-100 text-red-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {kpiStats.expired}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 pb-2">
            <div className="border-t border-slate-100 mx-2" />
          </div>

          <Link
            href="/settings"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              pathname.startsWith('/settings')
                ? 'bg-slate-100/90 text-[#0B1E3B] font-semibold border-l-2 border-[#00A878] pl-2.5 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 pl-3 border-l-2 border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </Link>

          <button
            onClick={() => setHelpModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all text-left cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help & Guides</span>
          </button>

          <Link
            href="/vendor-upload/demo-token-abc"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-teal-800 hover:bg-teal-50 transition-all border border-teal-100/80 mt-2 bg-teal-50/40"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
              <span>Vendor Upload Portal</span>
            </div>
            <span className="text-[9px] bg-teal-100 text-teal-800 px-1 py-0.5 rounded font-semibold uppercase">Mobile</span>
          </Link>
        </nav>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100/80 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-[#0B1E3B] text-[#00A878] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {userInitials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">{displayName}</div>
                <div className="text-[11px] text-slate-500 truncate">{workspaceName}</div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          {/* Subtle Brand & Developer Attribution */}
          <div className="mt-2 pt-2 border-t border-slate-200/60 px-1">
            <div className="text-[10px] text-slate-500 font-medium leading-tight">
              Build & Develop : Rejiesh Ashwanth V
            </div>
            <div className="text-[9px] text-slate-400 font-normal leading-tight">
              ADYK Multi Venture Company
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Left: Mobile hamburger & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight leading-tight">
                {pageTitle || 'Vendor Compliance'}
              </h1>
              {pageSubtitle && (
                <p className="hidden sm:block text-[11px] text-slate-500 leading-tight">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Search, Notifications, User */}
          <div className="flex items-center gap-2.5">
            {/* Search Bar Trigger */}
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search vendors, documents...</span>
              <span className="sm:hidden">Search</span>
              <kbd className="hidden sm:inline-flex items-center text-[10px] bg-white border border-slate-200 px-1 rounded text-slate-400 font-mono">
                Ctrl+K
              </kbd>
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">Notifications</span>
                      <span className="text-[11px] text-slate-400">
                        {unreadNotifications} new
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                n.type === 'warning'
                                  ? 'bg-amber-500'
                                  : n.type === 'alert'
                                  ? 'bg-red-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-900 leading-tight">
                                {n.title}
                              </p>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                {n.description}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {n.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Header + Add Vendor (Visible on desktop & tablet) */}
            <div className="hidden sm:block">
              <Button
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setAddVendorModalOpen(true)}
              >
                Add Vendor
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85%] bg-white h-full flex flex-col z-10 shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <BrandLogo variant="full" size="md" href="/dashboard" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <Button
                size="sm"
                fullWidth
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAddVendorModalOpen(true);
                }}
              >
                + Add Vendor
              </Button>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-slate-100/90 text-[#0B1E3B] font-semibold border-l-2 border-[#00A878] pl-2.5 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 pl-3 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#00A878]' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-slate-100 my-2" />

              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-slate-600"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </Link>
              <Link
                href="/vendor-upload/demo-token-abc"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-teal-800 bg-teal-50/50"
              >
                <ExternalLink className="w-4 h-4 text-teal-600" />
                <span>Vendor Upload Portal</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">{displayName}</div>
                  <div className="text-[11px] text-slate-500">{workspaceName}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="text-xs text-red-600 font-medium cursor-pointer"
                >
                  Sign out
                </button>
              </div>
              <div className="mt-2 text-[9px] text-slate-400">
                Build & Develop : Rejiesh Ashwanth V
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar for quick access */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            pathname === '/dashboard' ? 'text-[#0B1E3B] font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          Dashboard
        </Link>
        <Link
          href="/vendors"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            pathname.startsWith('/vendors') ? 'text-[#0B1E3B] font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          Vendors
        </Link>
        <button
          onClick={() => setAddVendorModalOpen(true)}
          className="flex flex-col items-center justify-center w-10 h-10 -mt-4 bg-[#0B1E3B] text-[#00A878] rounded-full shadow-md active:scale-95 transition-transform"
          aria-label="Add Vendor"
        >
          <Plus className="w-5 h-5" />
        </button>
        <Link
          href="/documents"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            pathname.startsWith('/documents') ? 'text-[#0B1E3B] font-bold' : 'text-slate-500'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          Docs
        </Link>
        <Link
          href="/compliance"
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            pathname.startsWith('/compliance') ? 'text-[#0B1E3B] font-bold' : 'text-slate-500'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          Compliance
        </Link>
      </div>
    </div>
  );
}
