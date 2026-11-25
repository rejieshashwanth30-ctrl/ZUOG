'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ComplianceBadge, DocumentBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  Clock,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Edit,
  ExternalLink,
  Plus,
  RefreshCw,
  FileCheck2,
  Upload,
} from 'lucide-react';
import { DocumentItem, VendorCategory } from '@/types';

export function VendorDetailClient({ vendorId }: { vendorId: string }) {
  const router = useRouter();

  const {
    vendors,
    documents,
    activities,
    setSelectedDocForPreview,
    setSelectedVendorForReminder,
    setUploadDocumentModalOpen,
    uploadRealDocument,
    verifyDocument,
    updateVendor,
    uploadDocument,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'activity'>('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeDocForReplace, setActiveDocForReplace] = useState<DocumentItem | null>(null);
  const replaceFileInputRef = React.useRef<HTMLInputElement>(null);

  // Find vendor by ID from active state
  const vendor = vendors.find((v) => v.id === vendorId);

  // Edit vendor local form state
  const [editName, setEditName] = useState(vendor?.name || '');
  const [editContact, setEditContact] = useState(vendor?.contactPerson || '');
  const [editPhone, setEditPhone] = useState(vendor?.phone || '');
  const [editEmail, setEditEmail] = useState(vendor?.email || '');
  const [editCategory, setEditCategory] = useState<VendorCategory>(vendor?.category || 'Raw Materials');

  if (!vendor) {
    return (
      <AppShell pageTitle="Vendor Not Found">
        <EmptyState
          icon={Building2}
          title="Vendor not found"
          description="The vendor you are looking for does not exist in your workspace."
          actionLabel="Return to Vendors"
          onAction={() => router.push('/vendors')}
        />
      </AppShell>
    );
  }

  // Get documents for this vendor memoized
  const vendorDocs = React.useMemo(() => {
    return documents.filter((d) => d.vendorId === vendor.id);
  }, [documents, vendor.id]);

  // Calculate status counts memoized
  const { verifiedCount, expiringCount, expiredCount, missingCount } = React.useMemo(() => {
    let ver = 0;
    let exp = 0;
    let expd = 0;
    for (let i = 0; i < vendorDocs.length; i++) {
      const s = vendorDocs[i].status;
      if (s === 'verified') ver++;
      else if (s === 'expiring') exp++;
      else if (s === 'expired') expd++;
    }
    return {
      verifiedCount: ver,
      expiringCount: exp,
      expiredCount: expd,
      missingCount: Math.max(0, vendor.totalRequiredCount - vendorDocs.length),
    };
  }, [vendorDocs, vendor.totalRequiredCount]);

  const handleRequestDocs = () => {
    const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/vendor-upload/${vendor.id}` : '';
    if (portalUrl && navigator.clipboard) {
      navigator.clipboard.writeText(portalUrl);
    }
    showToast(
      'Document Request Link Copied',
      `Direct upload link copied to clipboard. Ready to send to ${vendor.name} via WhatsApp or email.`
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateVendor(vendor.id, {
      name: editName,
      contactPerson: editContact,
      phone: editPhone,
      email: editEmail,
      category: editCategory,
    });
    setEditModalOpen(false);
    showToast('Vendor Updated', `${editName} details saved successfully.`);
  };

  const handleRealReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocForReplace) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendorId', vendor.id);
      formData.append('documentTypeName', activeDocForReplace.type);
      if (activeDocForReplace.documentNumber) {
        formData.append('documentNumber', activeDocForReplace.documentNumber);
      }
      await uploadRealDocument(formData);
      showToast('Replacement Uploaded', `${file.name} uploaded for ${activeDocForReplace.type}.`);
    } catch (err: any) {
      showToast('Upload Failed', err.message || 'Could not upload document file.', 'error');
    } finally {
      setActiveDocForReplace(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  return (
    <AppShell pageTitle={vendor.name} pageSubtitle={`${vendor.category} Supplier • ${vendor.city}, ${vendor.state}`}>
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
        <Link href="/vendors" className="hover:text-slate-900 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Vendors
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{vendor.name}</span>
      </div>

      {/* 31. VENDOR DETAIL HEADER:
          Header: ABC Engineering, Raw Material Supplier
          Actions: Request Documents, Edit Vendor
          Show: Phone, Email, Category, Added date, Compliance status */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-slate-200 shadow-2xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#0B1E3B]/10 text-[#0B1E3B] border border-slate-200 flex items-center justify-center font-bold text-base shrink-0">
              {vendor.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{vendor.name}</h2>
                <ComplianceBadge status={vendor.status} size="md" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {vendor.category} Supplier • Added on {vendor.createdAt}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
              onClick={handleRequestDocs}
            >
              Request Documents
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit className="w-3.5 h-3.5" />}
              onClick={() => {
                setEditName(vendor.name);
                setEditContact(vendor.contactPerson);
                setEditPhone(vendor.phone);
                setEditEmail(vendor.email);
                setEditCategory(vendor.category);
                setEditModalOpen(true);
              }}
            >
              Edit Vendor
            </Button>
            <Link href={`/vendor-upload/${vendor.id}`} target="_blank">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Portal View
              </Button>
            </Link>
          </div>
        </div>

        {/* Vendor Contact & Business Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Contact Person</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">{vendor.contactPerson}</span>
            <span className="text-slate-500 font-mono text-[11px]">{vendor.phone}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Work Email</span>
            <span className="font-medium text-slate-800 mt-0.5 block truncate">{vendor.email}</span>
            <span className="text-slate-400 text-[11px]">{vendor.category}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">GSTIN & PAN</span>
            <span className="font-mono font-semibold text-slate-800 mt-0.5 block">{vendor.gstin}</span>
            <span className="font-mono text-slate-500 text-[11px]">PAN: {vendor.pan}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Operating Address</span>
            <span className="font-medium text-slate-800 mt-0.5 block truncate">{vendor.address}</span>
            <span className="text-slate-500 text-[11px]">{vendor.city}, {vendor.state}</span>
          </div>
        </div>
      </div>

      {/* 32. VENDOR DETAIL TABS: Overview | Documents | Activity */}
      <div className="border-b border-slate-200 mb-6 flex gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#0B1E3B] text-[#0B1E3B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'documents'
              ? 'border-[#0B1E3B] text-[#0B1E3B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Documents</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px]">
            {vendorDocs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'activity'
              ? 'border-[#0B1E3B] text-[#0B1E3B]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Activity
        </button>
      </div>

      {/* 33. VENDOR OVERVIEW:
          Show compliance status: 8 Required, 7 Verified, 1 Expiring
          Attention: Insurance Certificate, Expires in 7 days, [Request Renewal] */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Required Documents</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {vendor.totalRequiredCount} Required
              </div>
              <span className="text-[11px] text-slate-400">Statutory checklist</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-2xs">
              <span className="text-xs text-emerald-800 font-medium">Verified & Valid</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{verifiedCount} Verified</div>
              <span className="text-[11px] text-slate-400">Current certificates</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-2xs">
              <span className="text-xs text-amber-800 font-medium">Expiring Soon</span>
              <div className="text-2xl font-bold text-amber-700 mt-1">{expiringCount} Expiring</div>
              <span className="text-[11px] text-amber-700">&lt;30 days validity</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-red-100 shadow-2xs">
              <span className="text-xs text-red-800 font-medium">Missing / Expired</span>
              <div className="text-2xl font-bold text-red-700 mt-1">
                {expiredCount + missingCount}
              </div>
              <span className="text-[11px] text-red-700">Immediate action</span>
            </div>
          </div>

          {/* Attention Banner */}
          {(expiringCount > 0 || expiredCount > 0 || missingCount > 0) && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Attention Required
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {expiringCount > 0
                      ? `Insurance Certificate expires in 7 days (${vendor.nextExpiryDate || 'Upcoming'}).`
                      : 'Statutory documents require verification or renewal request.'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() =>
                  setSelectedVendorForReminder({
                    vendorId: vendor.id,
                    vendorName: vendor.name,
                    documentType: 'Insurance Certificate',
                  })
                }
              >
                Request Renewal
              </Button>
            </div>
          )}

          {/* Document rows preview in overview */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Document Summary
              </h3>
              <button
                onClick={() => setActiveTab('documents')}
                className="text-xs font-semibold text-[#0B1E3B] hover:text-[#00A878] hover:underline"
              >
                View all documents →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {vendorDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 rounded px-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-semibold text-slate-900">{doc.type}</div>
                      <div className="text-[11px] text-slate-400">
                        {doc.expiryDate ? `Expires: ${doc.expiryDate}` : 'No expiry'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DocumentBadge status={doc.status} size="sm" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedDocForPreview(doc)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 34. VENDOR DOCUMENTS TAB:
          Show realistic document rows/cards:
          GST Certificate | Verified | No expiry
          Insurance Certificate | Expiring Soon | Expires 01 Dec 2026
          ISO Certificate | Verified | Expires 15 Jun 2027
          Actions: View, Download, Replace, Verify, Request Renewal */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <input
            ref={replaceFileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleRealReplaceFile}
            className="hidden"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compliance Documents</h3>
              <p className="text-xs text-slate-500">
                {vendorDocs.length} files on record for {vendor.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => setUploadDocumentModalOpen(true)}
              >
                Upload Document
              </Button>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
                onClick={handleRequestDocs}
              >
                Send Upload Link
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {vendorDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{doc.type}</h4>
                        <DocumentBadge status={doc.status} size="sm" />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-1">
                        <span>Ref: {doc.documentNumber || 'REG-2026-IND'}</span>
                        <span>•</span>
                        <span>
                          {doc.expiryDate ? `Expires: ${doc.expiryDate}` : 'No expiry'}
                        </span>
                        {doc.uploadedAt && (
                          <>
                            <span>•</span>
                            <span>Uploaded: {doc.uploadedAt}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 34. Actions: View, Download, Replace, Verify, Request Renewal */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedDocForPreview(doc)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        window.open(`/api/documents/${doc.id}/download`, '_blank')
                      }
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setActiveDocForReplace(doc);
                        replaceFileInputRef.current?.click();
                      }}
                    >
                      Replace
                    </Button>
                    {doc.status !== 'verified' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => verifyDocument(doc.id)}
                      >
                        Verify
                      </Button>
                    )}
                    {(doc.status === 'expiring' || doc.status === 'expired') && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          setSelectedVendorForReminder({
                            vendorId: vendor.id,
                            vendorName: vendor.name,
                            documentType: doc.type,
                          })
                        }
                      >
                        Request Renewal
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 32. TAB 3: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
            Audit Trail for {vendor.name}
          </h3>
          <div className="space-y-4">
            {activities
              .filter((a) => !a.vendorId || a.vendorId === vendor.id || a.vendorName === vendor.name)
              .map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#0B1E3B] mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">{act.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {act.relativeTime} by {act.user}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit ${vendor.name}`}
          subtitle="Update primary business contacts and details"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contact Person</label>
              <input
                type="text"
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}
