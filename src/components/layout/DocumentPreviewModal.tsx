'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DocumentBadge } from '../ui/Badge';
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  Building2,
  FileCheck2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export function DocumentPreviewModal() {
  const {
    selectedDocForPreview,
    setSelectedDocForPreview,
    verifyDocument,
    rejectDocument,
    uploadRealDocument,
    deleteDocument,
    showToast,
    setSelectedVendorForReminder,
  } = useApp();

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  if (!selectedDocForPreview) return null;

  const doc = selectedDocForPreview;

  const isPdf =
    doc.mimeType === 'application/pdf' ||
    doc.fileName?.toLowerCase().endsWith('.pdf');

  const isImage =
    doc.mimeType?.startsWith('image/') ||
    Boolean(doc.fileName?.match(/\.(jpg|jpeg|png|webp)$/i));

  const previewUrl = doc.fileUrl || `/api/documents/${doc.id}/preview`;

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await verifyDocument(doc.id, 'Rejiesh Ashwanth');
      setSelectedDocForPreview(null);
      showToast('Document Verified', `${doc.type} for ${doc.vendorName} is now marked as Verified.`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    await rejectDocument(doc.id, rejectReason.trim());
    setShowRejectInput(false);
    setRejectReason('');
    setSelectedDocForPreview(null);
    showToast('Document Rejected', `Rejection recorded. Notification dispatched to vendor.`, 'error');
  };

  const handleDownload = () => {
    window.open(`/api/documents/${doc.id}/download`, '_blank');
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendorId', doc.vendorId);
      formData.append('documentTypeName', doc.type);
      if (doc.documentNumber) {
        formData.append('documentNumber', doc.documentNumber);
      }
      if (doc.expiryDate) {
        formData.append('expiryDate', doc.expiryDate);
      }

      await uploadRealDocument(formData);
      setSelectedDocForPreview(null);
      showToast('Replacement Uploaded', `New certificate uploaded for ${doc.type}.`);
    } catch (err: any) {
      showToast('Upload Failed', err.message || 'Failed to upload replacement file.', 'error');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDocument(doc.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRequestRenewal = () => {
    const vendorId = doc.vendorId;
    const vendorName = doc.vendorName;
    const docType = doc.type;
    setSelectedDocForPreview(null);
    setSelectedVendorForReminder({
      vendorId,
      vendorName,
      documentType: docType,
    });
  };

  return (
    <Modal
      isOpen={!!selectedDocForPreview}
      onClose={() => {
        setSelectedDocForPreview(null);
        setShowRejectInput(false);
        setShowDeleteConfirm(false);
        setPreviewError(false);
      }}
      title={doc.type}
      subtitle={`Submitted by ${doc.vendorName}`}
      maxWidth="3xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Real Document In-Browser Preview */}
        <div className="lg:col-span-7 bg-slate-100 rounded-lg p-3 sm:p-4 border border-slate-200 flex flex-col items-center justify-center min-h-[380px]">
          {previewError ? (
            /* Fallback if preview fails or unsupported */
            <div className="w-full bg-white rounded-lg border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[340px]">
              <FileText className="w-12 h-12 text-slate-400 mb-3" />
              <h4 className="text-sm font-semibold text-slate-800">Preview not directly viewable</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {doc.fileName || `${doc.type}.pdf`}
              </p>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
              >
                Download Document
              </Button>
            </div>
          ) : isPdf ? (
            /* PDF In-browser Iframe Viewer */
            <div className="w-full h-[460px] bg-white rounded-md overflow-hidden border border-slate-200 flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[220px] font-mono text-[11px]">{doc.fileName || `${doc.type}.pdf`}</span>
                <button
                  onClick={handleDownload}
                  className="text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3 h-3" /> Open / Download
                </button>
              </div>
              <iframe
                src={previewUrl}
                title={doc.type}
                className="w-full flex-1 border-none"
                onError={() => setPreviewError(true)}
              />
            </div>
          ) : isImage ? (
            /* Image Viewer (JPG, PNG, WEBP) */
            <div className="w-full flex flex-col items-center justify-center bg-white rounded-md p-2 border border-slate-200 min-h-[380px] max-h-[460px] overflow-hidden">
              <img
                src={previewUrl}
                alt={doc.type}
                className="max-h-[440px] max-w-full object-contain rounded"
                onError={() => setPreviewError(true)}
              />
            </div>
          ) : (
            /* Fallback generic document viewer */
            <div className="w-full bg-white rounded-lg border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[340px]">
              <FileText className="w-12 h-12 text-[#00A878] mb-3" />
              <h4 className="text-sm font-semibold text-slate-800">{doc.type}</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {doc.fileName || `${doc.type}.pdf`} • {doc.fileSize || 'Standard Certificate'}
              </p>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
              >
                Download Document
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Actions */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">{doc.type}</h3>
            <p className="text-xs text-slate-500">Document Compliance Status</p>
            <div className="mt-1.5">
              <DocumentBadge status={doc.status} size="md" />
            </div>
          </div>

          <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Supplier</span>
              <span className="font-semibold text-slate-900 text-xs">{doc.vendorName}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Certificate #</span>
                <span className="text-slate-800 text-xs font-mono">
                  {doc.documentNumber || 'REG-PENDING'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Expires</span>
                <span className="text-slate-800 text-xs font-medium">
                  {doc.expiryDate ? doc.expiryDate : 'No expiry'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Uploaded</span>
                <span className="text-slate-800 text-xs">{doc.uploadedAt || 'Recently'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Verification</span>
                <span className="text-slate-800 text-xs">
                  {doc.status === 'verified'
                    ? `Verified (${doc.verifiedBy || 'Auditor'})`
                    : 'Pending verification'}
                </span>
              </div>
            </div>

            {doc.rejectionReason && (
              <div className="p-2 rounded bg-red-50 border border-red-200 text-red-800 text-xs">
                <span className="font-semibold block text-[10px]">Rejection Reason:</span>
                {doc.rejectionReason}
              </div>
            )}
          </div>

          {/* Actions: Download, Replace, Verify, Request Renewal, Delete */}
          <div className="space-y-2 pt-1">
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownload}
            >
              Download
            </Button>

            {/* Replace file input */}
            <label className="w-full inline-flex items-center justify-center font-medium rounded-lg transition-all text-xs px-3 py-1.5 gap-1.5 h-8 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Replace Document</span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleReplace}
              />
            </label>

            {doc.status !== 'verified' && (
              <Button
                variant="primary"
                fullWidth
                size="sm"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={handleVerify}
                isLoading={isVerifying}
              >
                Verify
              </Button>
            )}

            {(doc.status === 'expiring' || doc.status === 'expired') && (
              <Button
                variant="teal"
                fullWidth
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleRequestRenewal}
              >
                Request Renewal
              </Button>
            )}

            {!showRejectInput && doc.status !== 'rejected' && (
              <Button
                variant="ghost"
                fullWidth
                size="sm"
                className="text-amber-800 hover:text-amber-900 hover:bg-amber-50"
                onClick={() => setShowRejectInput(true)}
              >
                Reject Document...
              </Button>
            )}

            {showRejectInput && (
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg space-y-2 animate-in fade-in">
                <label className="text-[11px] font-semibold text-red-900 block">
                  Rejection Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incomplete scan, missing signature or stamp"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-red-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    fullWidth
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowRejectInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Secure Deletion Option */}
            {showDeleteConfirm ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2 animate-in fade-in">
                <div className="text-xs font-semibold text-red-900">
                  Delete this document permanently?
                </div>
                <p className="text-[11px] text-red-700">
                  This permanently removes the record from Neon database and purges the file from private object storage.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="danger"
                    fullWidth
                    isLoading={isDeleting}
                    onClick={handleDelete}
                  >
                    Confirm Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                fullWidth
                size="sm"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Document...
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

