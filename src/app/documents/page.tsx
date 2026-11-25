'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { DocumentBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  RefreshCw,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { DocumentStatus } from '@/types';

const AVAILABLE_DOC_TYPES = [
  'GST Certificate',
  'PAN Card',
  'Udyam Registration',
  'Insurance Certificate',
  'ISO 9001',
  'Factory License',
  'Trade License',
  'Vendor Agreement',
  'Quality Certificate',
];

export default function DocumentsPage() {
  const {
    documents,
    verifyDocument,
    setSelectedDocForPreview,
    setSelectedVendorForReminder,
    setUploadDocumentModalOpen,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  // 36. Filters: All, Verified, Pending, Expiring, Expired, Missing
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      if (typeFilter !== 'all' && doc.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          doc.type.toLowerCase().includes(q) ||
          doc.vendorName.toLowerCase().includes(q) ||
          (doc.documentNumber && doc.documentNumber.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [documents, statusFilter, typeFilter, searchQuery]);

  return (
    <AppShell
      pageTitle="Documents"
      pageSubtitle="Global document management and verification repository."
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B1E3B] tracking-tight">Documents</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage statutory certificates, expiry validity, and audit approvals. ({filteredDocs.length} records)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setUploadDocumentModalOpen(true)}
          >
            Upload Document
          </Button>
          <Link href="/reports">
            <Button size="sm" variant="secondary">
              Export Audit Log
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs mb-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by certificate name, vendor, or policy number..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-slate-50/50 focus:bg-white text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="sm:w-56">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-700"
            >
              <option value="all">All Document Types</option>
              {AVAILABLE_DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 36. Status Filter Pills: All, Verified, Pending, Expiring, Expired, Missing */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {[
            { id: 'all', label: 'All', count: documents.length },
            {
              id: 'verified',
              label: 'Verified',
              count: documents.filter((d) => d.status === 'verified').length,
            },
            {
              id: 'pending',
              label: 'Pending',
              count: documents.filter((d) => d.status === 'pending').length,
            },
            {
              id: 'expiring',
              label: 'Expiring',
              count: documents.filter((d) => d.status === 'expiring').length,
            },
            {
              id: 'expired',
              label: 'Expired',
              count: documents.filter((d) => d.status === 'expired').length,
            },
            {
              id: 'missing',
              label: 'Missing',
              count: documents.filter((d) => d.status === 'missing').length,
            },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-[#0B1E3B] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {pill.label} ({pill.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main Documents Table or Empty State */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={documents.length === 0 ? "No documents yet" : "No matching documents"}
          description={
            documents.length === 0
              ? "When vendors submit statutory certificates or you upload documents, they will appear here."
              : "No documents match your active search or filter criteria."
          }
          actionLabel={documents.length === 0 ? "+ Upload Document" : "Reset Filters"}
          onAction={
            documents.length === 0
              ? () => {
                  setUploadDocumentModalOpen(true);
                }
              : () => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }
          }
        />
      ) : (
        /* 36. COLUMNS: Vendor | Document | Status | Expiry | Verification | Updated | Action */
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Vendor</th>
                  <th className="py-2.5 px-4">Document</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Expiry</th>
                  <th className="py-2.5 px-4">Verification</th>
                  <th className="py-2.5 px-4">Updated</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedDocForPreview(doc)}
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/vendors/${doc.vendorId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-slate-900 hover:text-[#00A878]"
                      >
                        {doc.vendorName}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{doc.type}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {doc.documentNumber || 'REG-PENDING'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <DocumentBadge status={doc.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {doc.expiryDate ? doc.expiryDate : 'No expiry'}
                    </td>
                    <td className="py-3 px-4">
                      {doc.status === 'verified' ? (
                        <span className="text-[11px] text-emerald-800 font-medium">
                          ✓ Verified {doc.verifiedBy ? `(${doc.verifiedBy})` : ''}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{doc.uploadedAt || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedDocForPreview(doc)}
                        >
                          View
                        </Button>
                        {doc.status !== 'verified' && doc.status !== 'missing' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={async () => {
                              await verifyDocument(doc.id, 'Rejiesh Ashwanth');
                              showToast('Verified', `${doc.type} marked as verified.`);
                            }}
                          >
                            Verify
                          </Button>
                        )}
                        {(doc.status === 'expiring' || doc.status === 'expired' || doc.status === 'missing') && (
                          <Button
                            size="sm"
                            variant="teal"
                            onClick={() =>
                              setSelectedVendorForReminder({
                                vendorId: doc.vendorId,
                                vendorName: doc.vendorName,
                                documentType: doc.type,
                              })
                            }
                          >
                            Renew
                          </Button>
                        )}
                      </div>
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
