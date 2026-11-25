'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ComplianceBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  FileQuestion,
  Search,
  Download,
  Building2,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ComplianceStatus } from '@/types';

export default function CompliancePage() {
  const { kpiStats, vendors, documents, setSelectedVendorForReminder, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Compute vendor-level missing, expiring, and expired counts memoized
  const vendorComplianceList = React.useMemo(() => {
    return vendors.map((vendor) => {
      const docs = documents.filter((d) => d.vendorId === vendor.id);
      let expiringDocs = 0;
      let expiredDocs = 0;
      for (let i = 0; i < docs.length; i++) {
        if (docs[i].status === 'expiring') expiringDocs++;
        else if (docs[i].status === 'expired') expiredDocs++;
      }
      const missingDocs = Math.max(0, vendor.totalRequiredCount - docs.length);

      return {
        ...vendor,
        expiringCount: expiringDocs,
        expiredCount: expiredDocs,
        missingCount: missingDocs,
        lastReview: vendor.lastUpdated,
      };
    });
  }, [vendors, documents]);

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vendorComplianceList.filter((item) => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (q) {
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vendorComplianceList, filterStatus, searchQuery]);

  return (
    <AppShell
      pageTitle="Compliance"
      pageSubtitle="Understand your vendor readiness at a glance."
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B1E3B] tracking-tight">Compliance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Understand your vendor readiness at a glance.
          </p>
        </div>

        <Link href="/reports">
          <Button size="sm" variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
            Download Audit Report
          </Button>
        </Link>
      </div>

      {/* 37. TOP SUMMARY: Dynamic from Neon Database */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div
          onClick={() => setFilterStatus(filterStatus === 'compliant' ? 'all' : 'compliant')}
          className={`bg-white p-4 rounded-lg border transition-all cursor-pointer shadow-2xs ${
            filterStatus === 'compliant'
              ? 'ring-2 ring-emerald-500 border-emerald-500'
              : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Compliant</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A878]" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{kpiStats.compliant}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Compliant</span>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'expiring' ? 'all' : 'expiring')}
          className={`bg-white p-4 rounded-lg border transition-all cursor-pointer shadow-2xs ${
            filterStatus === 'expiring'
              ? 'ring-2 ring-amber-500 border-amber-500'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Expiring Soon</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{kpiStats.expiringSoon}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Expiring Soon</span>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'expired' ? 'all' : 'expired')}
          className={`bg-white p-4 rounded-lg border transition-all cursor-pointer shadow-2xs ${
            filterStatus === 'expired'
              ? 'ring-2 ring-red-500 border-red-500'
              : 'border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-800">Expired</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-700 mt-2">{kpiStats.expired}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Expired</span>
        </div>

        <div
          onClick={() => setFilterStatus(filterStatus === 'incomplete' ? 'all' : 'incomplete')}
          className={`bg-white p-4 rounded-lg border transition-all cursor-pointer shadow-2xs ${
            filterStatus === 'incomplete'
              ? 'ring-2 ring-slate-500 border-slate-500'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Incomplete</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{kpiStats.missingDocuments}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Incomplete</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter suppliers by name or category..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-slate-50/50 focus:bg-white text-slate-900"
          />
        </div>

        {filterStatus !== 'all' && (
          <button
            onClick={() => setFilterStatus('all')}
            className="text-xs font-medium text-[#00A878] hover:underline cursor-pointer"
          >
            Show All ({vendorComplianceList.length})
          </button>
        )}
      </div>

      {/* 37. MAIN TABLE OR EMPTY STATE */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={vendors.length === 0 ? "No compliance data yet" : "No matching vendors"}
          description={
            vendors.length === 0
              ? "Add your first vendor to start tracking statutory documents and renewals."
              : "No vendors match the active filter criteria."
          }
          actionLabel={vendors.length === 0 ? "+ Add Vendor" : "Reset Filter"}
          onAction={
            vendors.length === 0
              ? () => {
                  window.location.href = '/vendors';
                }
              : () => {
                  setFilterStatus('all');
                  setSearchQuery('');
                }
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Vendor</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Missing</th>
                  <th className="py-2.5 px-4">Expiring</th>
                  <th className="py-2.5 px-4">Expired</th>
                  <th className="py-2.5 px-4">Last Review</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/vendors/${item.id}`}
                        className="font-semibold text-slate-900 hover:text-[#00A878]"
                      >
                        {item.name}
                      </Link>
                      <div className="text-[11px] text-slate-400">{item.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <ComplianceBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      {item.missingCount > 0 ? (
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {item.missingCount} missing
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.expiringCount > 0 ? (
                        <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          {item.expiringCount} expiring
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.expiredCount > 0 ? (
                        <span className="font-semibold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
                          {item.expiredCount} expired
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{item.lastReview}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/vendors/${item.id}`}>
                        <Button size="sm" variant="secondary">
                          Audit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
