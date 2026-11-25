'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck2,
  Calendar,
  Building2,
  File,
  Image as ImageIcon,
} from 'lucide-react';
import { DocumentType } from '@/types';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const DEFAULT_DOC_TYPES: DocumentType[] = [
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

interface UploadDocumentModalProps {
  initialVendorId?: string;
  initialDocType?: DocumentType;
}

export function UploadDocumentModal({
  initialVendorId,
  initialDocType,
}: UploadDocumentModalProps) {
  const {
    vendors,
    uploadDocumentModalOpen,
    setUploadDocumentModalOpen,
    uploadRealDocument,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    initialVendorId || (vendors[0]?.id ?? '')
  );
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(
    initialDocType || 'GST Certificate'
  );
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage('');

    // Check size limit (25 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File size exceeds 25 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller document.`
      );
      setSelectedFile(null);
      return;
    }

    // Check MIME type or extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAllowedType =
      ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext);

    if (!isAllowedType) {
      setErrorMessage(
        'Unsupported file format. Please upload a PDF document or JPG, PNG, WEBP image.'
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  }, []);

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentNumber('');
    setExpiryDate('');
    setNotes('');
    setErrorMessage('');
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    setUploadDocumentModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please choose a document file to upload.');
      return;
    }

    if (!selectedVendorId) {
      setErrorMessage('Please select a supplier for this certificate.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      // Simulate smooth progress for UX feedback
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 20 : prev));
      }, 150);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('vendorId', selectedVendorId);
      formData.append('documentTypeName', selectedDocType);
      if (documentNumber.trim()) {
        formData.append('documentNumber', documentNumber.trim());
      }
      if (expiryDate.trim()) {
        formData.append('expiryDate', expiryDate.trim());
      }
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      await uploadRealDocument(formData);
      clearInterval(progressTimer);
      setUploadProgress(100);

      setTimeout(() => {
        handleClose();
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Document upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!uploadDocumentModalOpen) return null;

  return (
    <Modal
      isOpen={uploadDocumentModalOpen}
      onClose={handleClose}
      title="Upload Compliance Document"
      subtitle="Select a statutory certificate from your device to record in your workspace."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
          id="real-document-file-input"
        />

        {/* 1. Drag & Drop / File Picker Area */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#00A878] bg-teal-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-[#00A878] hover:bg-slate-50/70 bg-slate-50/30'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-teal-50 text-[#00A878] flex items-center justify-center mx-auto mb-3 border border-teal-100 shadow-2xs">
              <Upload className="w-6 h-6" />
            </div>

            <h4 className="text-sm font-semibold text-slate-800">
              <span className="text-[#00A878] font-bold">Choose file</span> or drag and drop
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              PDF documents or JPG, PNG, WEBP images (up to 25 MB)
            </p>
            <p className="text-[11px] text-slate-400 mt-2 sm:hidden">
              Tap here to browse device files or capture with camera
            </p>
          </div>
        ) : (
          /* File Selected Info Card */
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded bg-teal-100/60 text-[#00A878] flex items-center justify-center shrink-0">
                {selectedFile.type === 'application/pdf' ? (
                  <FileText className="w-5 h-5 text-red-600" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-teal-700" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Document'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5 animate-in fade-in">
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Uploading to secure storage...</span>
              <span className="font-mono font-semibold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#00A878] h-full transition-all duration-200 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 2. Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Vendor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Supplier / Vendor *
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              disabled={Boolean(initialVendorId) || isUploading}
              required
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              {vendors.length === 0 ? (
                <option value="">No vendors found — register vendor first</option>
              ) : (
                vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Document Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Document Type *
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              disabled={isUploading}
              required
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-800"
            >
              {DEFAULT_DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Document / Policy Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Certificate / Policy Ref #
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              disabled={isUploading}
              placeholder="e.g. 27AABCU9603R1ZM or ISO-2026"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-800 font-mono placeholder:font-sans placeholder:text-slate-400"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Expiry Date (if applicable)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={isUploading}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Internal Compliance Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isUploading}
            rows={2}
            placeholder="e.g. Submitted during annual audit review; stamped copy verified."
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-800 placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isUploading}
            disabled={!selectedFile || isUploading}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
