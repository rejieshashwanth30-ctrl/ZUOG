'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ComplianceBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Users,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ChevronRight,
  MoreVertical,
  Building2,
  Mail,
  Phone,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ComplianceStatus, VendorCategory, DocumentType } from '@/types';

const CATEGORIES: VendorCategory[] = [
  'Raw Materials',
  'Sheet Metal & Fabrication',
  'Precision Machining',
  'Packaging',
  'Electrical & Sensors',
  'Foundry & Castings',
  'Fasteners & Hardware',
  'Chemicals & Coatings',
  'Tooling & Dies',
];

const DOC_TYPES: DocumentType[] = [
  'GST Certificate',
  'PAN Card',
  'Udyam Registration',
  'Insurance Certificate',
  'ISO 9001',
  'Factory License',
  'Vendor Agreement',
  'Quality Certificate',
];

function VendorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get('status') as ComplianceStatus | null;

  const {
    vendors,
    setAddVendorModalOpen,
    deleteVendor,
    setSelectedVendorForReminder,
  } = useApp();

  // 26. VENDORS PAGE: Search bar & Filters: All, Compliant, Expiring, Expired, Incomplete; Additional: Category, Document Type
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [vendorToDelete, setVendorToDelete] = useState<{ id: string; name: string } | null>(null);

  // Memoized single-pass status counts
  const statusCounts = useMemo(() => {
    let compliant = 0;
    let expiring = 0;
    let expired = 0;
    let incomplete = 0;
    for (let i = 0; i < vendors.length; i++) {
      const s = vendors[i].status;
      if (s === 'compliant') compliant++;
      else if (s === 'expiring') expiring++;
      else if (s === 'expired') expired++;
      else if (s === 'incomplete') incomplete++;
    }
    return { all: vendors.length, compliant, expiring, expired, incomplete };
  }, [vendors]);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      // Status filter
      if (selectedStatus !== 'all' && v.status !== selectedStatus) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && v.category !== selectedCategory) {
        return false;
      }
      // Document type filter
      if (selectedDocType !== 'all') {
        if (!v.requiredDocumentTypes.includes(selectedDocType as DocumentType)) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.name.toLowerCase().includes(q) ||
          v.contactPerson.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.gstin.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vendors, selectedStatus, selectedCategory, selectedDocType, searchQuery]);

  return (
    <AppShell
      pageTitle="Vendors"
      pageSubtitle="Manage suppliers and their compliance status."
    >
      {/* 26. Title & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B1E3B] tracking-tight">Vendors</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage suppliers and their compliance status. ({filteredVendors.length} active records)
          </p>
        </div>

        <Button
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setAddVendorModalOpen(true)}
        >
          + Add Vendor
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs mb-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors by company, contact person, city, or GSTIN..."
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

          {/* Category Filter */}
          <div className="sm:w-52">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-700"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type Filter */}
          <div className="sm:w-52">
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-700"
            >
              <option value="all">All Document Types</option>
              {DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 26. Status Filters: All, Compliant, Expiring, Expired, Incomplete */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {[
            { id: 'all', label: 'All', count: statusCounts.all },
            { id: 'compliant', label: 'Compliant', count: statusCounts.compliant },
            { id: 'expiring', label: 'Expiring Soon', count: statusCounts.expiring },
            { id: 'expired', label: 'Expired', count: statusCounts.expired },
            { id: 'incomplete', label: 'Incomplete', count: statusCounts.incomplete },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedStatus(pill.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                selectedStatus === pill.id
                  ? 'bg-[#0B1E3B] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {pill.label} ({pill.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main Vendor Content View */}
      {filteredVendors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No vendors yet"
          description="Add your first vendor to start building your compliance workspace."
          actionLabel="+ Add Vendor"
          onAction={() => setAddVendorModalOpen(true)}
          secondaryActionLabel="Reset Filters"
          onSecondaryAction={() => {
            setSearchQuery('');
            setSelectedStatus('all');
            setSelectedCategory('all');
            setSelectedDocType('all');
          }}
        />
      ) : (
        <>
          {/* 27. DESKTOP VENDOR TABLE:
              Vendor | Contact | Category | Documents | Compliance | Next Expiry | Updated | Action */}
          <div className="hidden lg:block bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Vendor</th>
                    <th className="py-2.5 px-4">Contact</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Documents</th>
                    <th className="py-2.5 px-4">Compliance</th>
                    <th className="py-2.5 px-4">Next Expiry</th>
                    <th className="py-2.5 px-4">Updated</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) return;
                        router.push(`/vendors/${vendor.id}`);
                      }}
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-[#0B1E3B]/5 text-[#0B1E3B] border border-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {vendor.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-[#00A878]">
                              {vendor.name}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {vendor.city}, {vendor.state}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-slate-800">{vendor.contactPerson}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{vendor.phone}</div>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-600">{vendor.category}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-slate-900">
                          {vendor.uploadedDocumentsCount} / {vendor.totalRequiredCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <ComplianceBadge status={vendor.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 font-medium">
                        {vendor.nextExpiryDate ? vendor.nextExpiryDate : 'No expiry date'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">{vendor.lastUpdated}</td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/vendors/${vendor.id}`}>
                            <Button size="sm" variant="secondary">
                              View
                            </Button>
                          </Link>
                          <button
                            title="Delete vendor"
                            onClick={(e) => {
                              e.stopPropagation();
                              setVendorToDelete({ id: vendor.id, name: vendor.name });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 29. MOBILE VENDOR VIEW:
              Do NOT squeeze the desktop table into mobile.
              Use cards:
              ABC Engineering
              Raw Materials
              8 / 8 documents
              ✓ Compliant
              Next expiry: 12 Dec 2026
              View Vendor → */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredVendors.map((vendor) => (
              <div
                key={`mobile-${vendor.id}`}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#0B1E3B]/10 text-[#0B1E3B] border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                      {vendor.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {vendor.name}
                      </h3>
                      <p className="text-xs text-slate-500">{vendor.category}</p>
                    </div>
                  </div>
                  <ComplianceBadge status={vendor.status} size="sm" />
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Documents:</span>
                    <span className="font-semibold text-slate-800">
                      {vendor.uploadedDocumentsCount} / {vendor.totalRequiredCount} documents
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next expiry:</span>
                    <span className="font-medium text-slate-800">
                      {vendor.nextExpiryDate || 'No active expiry'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setVendorToDelete({ id: vendor.id, name: vendor.name })}
                    className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                  <Link href={`/vendors/${vendor.id}`}>
                    <Button
                      size="sm"
                      variant="primary"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      View Vendor →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!vendorToDelete}
        title="Delete Vendor?"
        message={`This will remove ${vendorToDelete?.name} and all associated document verification records from your workspace. This action cannot be undone.`}
        confirmLabel="Delete Vendor"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={async () => {
          if (vendorToDelete) {
            await deleteVendor(vendorToDelete.id);
            setVendorToDelete(null);
          }
        }}
        onCancel={() => setVendorToDelete(null)}
      />
    </AppShell>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading vendors...</div>}>
      <VendorsContent />
    </Suspense>
  );
}
