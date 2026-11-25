'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ComplianceBadge } from '@/components/ui/Badge';
import { AiCompliancePanel } from '@/components/compliance/AiCompliancePanel';
import {
  Users,
  ShieldCheck,
  Clock,
  AlertCircle,
  FileQuestion,
  Plus,
  ChevronRight,
  Calendar,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    kpiStats,
    vendors,
    documents,
    activities,
    setAddVendorModalOpen,
    setSelectedDocForPreview,
    setSelectedVendorForReminder,
  } = useApp();

  const handleReviewDoc = React.useCallback(
    (docId?: string, vendorId?: string) => {
      if (docId) {
        const doc = documents.find((d) => d.id === docId);
        if (doc) {
          setSelectedDocForPreview(doc);
          return;
        }
      }
      if (vendorId) {
        const fallbackDoc = documents.find((d) => d.vendorId === vendorId);
        if (fallbackDoc) setSelectedDocForPreview(fallbackDoc);
      }
    },
    [documents, setSelectedDocForPreview]
  );

  // Dynamic attention items derived from real vendors & documents
  const attentionItems = React.useMemo(() => {
    const items: Array<{
      id: string;
      vendor: string;
      vendorId: string;
      document: string;
      issue: string;
      due: string;
      badgeStatus: 'expiring' | 'expired' | 'incomplete';
      docId?: string;
    }> = [];

    vendors.forEach((v) => {
      if (v.status === 'expired') {
        const expiredDoc = documents.find((d) => d.vendorId === v.id && d.status === 'expired');
        items.push({
          id: `att-exp-${v.id}`,
          vendor: v.name,
          vendorId: v.id,
          document: expiredDoc?.type || 'Statutory Certificate',
          issue: 'Expired certificate',
          due: 'Immediate',
          badgeStatus: 'expired',
          docId: expiredDoc?.id,
        });
      } else if (v.status === 'expiring') {
        const expiringDoc = documents.find((d) => d.vendorId === v.id && d.status === 'expiring');
        items.push({
          id: `att-due-${v.id}`,
          vendor: v.name,
          vendorId: v.id,
          document: expiringDoc?.type || 'Statutory Certificate',
          issue: 'Renewal pending',
          due: expiringDoc?.expiryDate || 'Due soon',
          badgeStatus: 'expiring',
          docId: expiringDoc?.id,
        });
      } else if (v.status === 'incomplete') {
        items.push({
          id: `att-inc-${v.id}`,
          vendor: v.name,
          vendorId: v.id,
          document: 'Mandatory Documents',
          issue: 'Certificate missing',
          due: '—',
          badgeStatus: 'incomplete',
        });
      }
    });

    return items;
  }, [vendors, documents]);

  // Dynamic upcoming expiries (next 30 days) computed on client to avoid prerender time shifts
  const [upcomingExpiries, setUpcomingExpiries] = React.useState<
    Array<{ date: string; doc: string; vendor: string; vendorId: string }>
  >([]);

  React.useEffect(() => {
    const now = new Date();
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(now.getDate() + 30);

    const items = documents
      .filter((d) => {
        if (!d.expiryDate) return false;
        const exp = new Date(d.expiryDate);
        return exp >= now && exp <= thirtyDaysAhead;
      })
      .map((d) => ({
        date: d.expiryDate
          ? new Date(d.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
          : '—',
        doc: d.type,
        vendor: d.vendorName,
        vendorId: d.vendorId,
      }));

    setUpcomingExpiries(items);
  }, [documents]);

  // Dynamic compliance overview calculations
  const { total, compliantCount, expiringCount, expiredCount, missingCount, compliantPercent, expiringPercent, expiredPercent } = React.useMemo(() => {
    const tot = kpiStats.totalVendors;
    const comp = kpiStats.compliant;
    const exp = kpiStats.expiringSoon;
    const expd = kpiStats.expired;
    const miss = kpiStats.missingDocuments;

    return {
      total: tot,
      compliantCount: comp,
      expiringCount: exp,
      expiredCount: expd,
      missingCount: miss,
      compliantPercent: tot > 0 ? Math.round((comp / tot) * 100) : 0,
      expiringPercent: tot > 0 ? Math.round((exp / tot) * 100) : 0,
      expiredPercent: tot > 0 ? Math.round((expd / tot) * 100) : 0,
    };
  }, [kpiStats]);

  return (
    <AppShell pageTitle="Dashboard" pageSubtitle="Real-time statutory vendor compliance monitoring">
      {/* DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1E3B] tracking-tight">
            Compliance Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance status calculated from your workspace database records.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setAddVendorModalOpen(true)}
          >
            + Add Vendor
          </Button>
        </div>
      </div>

      {/* DASHBOARD KPI CARDS (Real dynamic numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        {/* Total Vendors */}
        <Link
          href="/vendors"
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Vendors</span>
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{total}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Active suppliers</div>
          </div>
        </Link>

        {/* Compliant */}
        <Link
          href="/vendors?status=compliant"
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Compliant</span>
            <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700 tracking-tight">{compliantCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">All documents valid</div>
          </div>
        </Link>

        {/* Expiring Soon */}
        <Link
          href="/vendors?status=expiring"
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-amber-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Expiring Soon</span>
            <div className="w-7 h-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-700 tracking-tight">{expiringCount}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">Due in &lt;30 days</div>
          </div>
        </Link>

        {/* Expired */}
        <Link
          href="/vendors?status=expired"
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-red-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-800">Expired</span>
            <div className="w-7 h-7 rounded bg-red-50 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-700 tracking-tight">{expiredCount}</div>
            <div className="text-[11px] text-red-700 font-medium mt-0.5">Critical renewal needed</div>
          </div>
        </Link>

        {/* Missing Documents */}
        <Link
          href="/vendors?status=incomplete"
          className="col-span-2 sm:col-span-1 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Missing Documents</span>
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-500 flex items-center justify-center">
              <FileQuestion className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-800 tracking-tight">{missingCount}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Pending collection</div>
          </div>
        </Link>
      </div>

      {/* AI COMPLIANCE INTELLIGENCE & ASK ZUOG */}
      <div className="mb-6">
        <AiCompliancePanel />
      </div>

      {/* ATTENTION REQUIRED & COMPLIANCE OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column (8 cols): Attention Required Table */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Attention Required
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Suppliers requiring immediate certificate renewal or document upload
                </p>
              </div>
              <Link
                href="/compliance"
                className="text-xs font-semibold text-[#0B1E3B] hover:text-[#00A878] flex items-center gap-1"
              >
                View all compliance <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {attentionItems.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">No attention required</p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                  {vendors.length === 0
                    ? 'Add your first supplier to begin automated compliance monitoring.'
                    : 'All registered suppliers are currently compliant with statutory standards.'}
                </p>
                {vendors.length === 0 && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setAddVendorModalOpen(true)}
                    >
                      Add Vendor
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-5">Vendor</th>
                      <th className="py-2.5 px-4">Document</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Due</th>
                      <th className="py-2.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attentionItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-5">
                          <Link
                            href={`/vendors/${item.vendorId}`}
                            className="font-semibold text-slate-900 hover:text-[#00A878]"
                          >
                            {item.vendor}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{item.document}</td>
                        <td className="py-3 px-4">
                          <ComplianceBadge status={item.badgeStatus} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{item.due}</td>
                        <td className="py-3 px-5 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleReviewDoc(item.docId, item.vendorId)}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Critical supplier action items</span>
            <Link href="/reminders" className="text-[#0B1E3B] font-semibold hover:underline">
              Reminders Schedule →
            </Link>
          </div>
        </div>

        {/* Right Column (4 cols): COMPLIANCE OVERVIEW */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Compliance Overview
              </h3>
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {compliantPercent}% Compliant
              </span>
            </div>

            {/* Clean subtle donut visualization */}
            <div className="py-5 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="10"
                  />
                  {total > 0 && (
                    <>
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#00A878"
                        strokeWidth="10"
                        strokeDasharray={`${compliantPercent * 2.51} 251.2`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#D97706"
                        strokeWidth="10"
                        strokeDasharray={`${expiringPercent * 2.51} 251.2`}
                        strokeDashoffset={`-${compliantPercent * 2.51}`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#DC2626"
                        strokeWidth="10"
                        strokeDasharray={`${expiredPercent * 2.51} 251.2`}
                        strokeDashoffset={`-${(compliantPercent + expiringPercent) * 2.51}`}
                      />
                    </>
                  )}
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-[#0B1E3B] leading-none">
                    {compliantCount}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                    Compliant
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Breakdown */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A878]" />
                  Compliant
                </span>
                <span className="font-bold text-slate-900">{compliantCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Expiring Soon
                </span>
                <span className="font-bold text-slate-900">{expiringCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  Expired
                </span>
                <span className="font-bold text-slate-900">{expiredCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Incomplete
                </span>
                <span className="font-bold text-slate-900">{missingCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100">
            <Link href="/compliance">
              <Button variant="outline" size="sm" fullWidth>
                View Full Compliance Matrix
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* UPCOMING EXPIRIES & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next 30 Days Expiries (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0B1E3B]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Upcoming Expiries (Next 30 Days)
              </h3>
            </div>
            <Link href="/reminders" className="text-xs font-semibold text-[#0B1E3B] hover:underline">
              Reminders
            </Link>
          </div>

          {upcomingExpiries.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <Clock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">No upcoming expiries</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No certificate renewals are due in the next 30 days.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExpiries.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 text-center py-1 px-1.5 rounded bg-white border border-slate-200 shrink-0">
                      <span className="block text-[11px] font-bold text-slate-800 leading-tight">
                        {item.date}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {item.doc} — {item.vendor}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Scheduled renewal notification
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-[#0B1E3B] hover:bg-slate-200"
                      onClick={() =>
                        setSelectedVendorForReminder({
                          vendorId: item.vendorId,
                          vendorName: item.vendor,
                          documentType: item.doc,
                        })
                      }
                    >
                      Notify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0B1E3B]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Activity
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Real-time audit log</span>
          </div>

          {activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <Activity className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">No recent activity</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Audit records for document uploads, approvals, and reminders will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      act.type === 'verification'
                        ? 'bg-[#00A878]'
                        : act.type === 'upload'
                        ? 'bg-[#0B1E3B]'
                        : 'bg-amber-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 leading-snug">{act.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-500">{act.relativeTime}</span>
                      <span>•</span>
                      <span>{act.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
