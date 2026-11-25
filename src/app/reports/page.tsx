'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  FileSpreadsheet,
  FileDown,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Clock,
  Printer,
  Sparkles,
  Share2,
} from 'lucide-react';

export default function ReportsPage() {
  const { kpiStats, reminders, showToast } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('q4_2026');

  // Dynamic report summaries derived from real Neon data
  const reportCards = React.useMemo(() => [
    {
      id: 'rep-vendor-compliance',
      title: 'Vendor Compliance',
      description:
        'Complete supplier audit status breakdown, GSTIN conformity, and ISO validity across all manufacturing tiers.',
      metrics: `${kpiStats.compliant} Compliant • ${kpiStats.expiringSoon} Expiring Soon • ${kpiStats.expired} Expired`,
      icon: Building2,
      lastGenerated: kpiStats.totalVendors > 0 ? 'Today, Live sync' : 'No records yet',
    },
    {
      id: 'rep-document-expiry',
      title: 'Document Expiry',
      description:
        '30/60/90-day forward schedule of commercial insurance policies, factory licenses, and statutory registrations.',
      metrics: `${kpiStats.expiringSoon} Certificates expiring within 30 days`,
      icon: Clock,
      lastGenerated: kpiStats.totalVendors > 0 ? 'Live sync' : 'No records yet',
    },
    {
      id: 'rep-missing-documents',
      title: 'Missing Documents',
      description:
        'List of vendors with incomplete document checklists and mandatory statutory certificates yet to be collected.',
      metrics: `${kpiStats.missingDocuments} Missing Documents across registered suppliers`,
      icon: AlertTriangle,
      lastGenerated: kpiStats.totalVendors > 0 ? 'Live sync' : 'No records yet',
    },
    {
      id: 'rep-renewal-activity',
      title: 'Renewal Activity',
      description:
        'Operational log of renewal requests dispatched, supplier upload events, and audit approvals.',
      metrics: `${reminders.length} Active Reminders scheduled`,
      icon: BarChart3,
      lastGenerated: reminders.length > 0 ? 'Live sync' : 'No records yet',
    },
  ], [kpiStats, reminders.length]);

  // 40. Realistic toast as specified in prompt:
  // "Report generation will be connected when the backend is enabled."
  const handleReportAction = React.useCallback((actionName: string, reportName: string) => {
    showToast(
      `${actionName}: ${reportName}`,
      'Report generation will be connected when the backend is enabled.',
      'info'
    );
  }, [showToast]);

  return (
    <AppShell
      pageTitle="Compliance Reports"
      pageSubtitle="Generate and export audit-ready compliance summaries for management and statutory auditors."
    >
      {/* 40. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B1E3B] tracking-tight">Compliance Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Understand audit readiness and statutory conformity across your supply chain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
          >
            <option value="q4_2026">Q4 2026 (Current Quarter)</option>
            <option value="q3_2026">Q3 2026 (Audit Completed)</option>
            <option value="fy_2026">FY 2026-27 (Full Year)</option>
          </select>
        </div>
      </div>

      {/* 40. CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 text-[#0B1E3B] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                      <p className="text-[11px] text-slate-400">Last prepared: {card.lastGenerated}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    Statutory
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {card.description}
                </p>

                <div className="mt-3 p-2.5 rounded bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                  {card.metrics}
                </div>
              </div>

              {/* 40. ACTIONS: Generate Report | Export PDF | Export CSV */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleReportAction('Generate Report', card.title)}
                >
                  Generate Report
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<FileDown className="w-3.5 h-3.5" />}
                  onClick={() => handleReportAction('Export PDF', card.title)}
                >
                  Export PDF
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                  onClick={() => handleReportAction('Export CSV', card.title)}
                >
                  Export CSV
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backend-Ready Phase Information Note */}
      <div className="mt-8 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700 block">Report Engine Staging:</span>
          <span>
            Report templates are structured for automated generation once connected to the backend reporting and PDF rendering microservices.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
