'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Camera,
  Check,
  Building2,
  Lock,
} from 'lucide-react';
import { DocumentType } from '@/types';

interface UploadItemState {
  type: DocumentType;
  required: boolean;
  status: 'verified' | 'uploaded' | 'missing';
  fileName?: string;
  fileSize?: string;
  progress?: number;
  isUploading?: boolean;
}

export function VendorUploadClient({ token }: { token: string }) {
  const { vendors, documents, uploadRealDocument, showToast } = useApp();

  // Find vendor by token or ID
  const vendor = useMemo(() => {
    return vendors.find((v) => v.id === token || v.uploadToken === token);
  }, [vendors, token]);

  const vendorName = vendor?.name || 'Supplier Portal';
  const requestedBy = 'ADYK ZUOG Compliance Desk';

  // Initialize upload state based on vendor's requiredDocumentTypes and existing documents
  const initialDocumentsState = useMemo(() => {
    if (!vendor) return [];

    const reqTypes: DocumentType[] =
      vendor.requiredDocumentTypes && vendor.requiredDocumentTypes.length > 0
        ? vendor.requiredDocumentTypes
        : ['GST Certificate', 'PAN Card', 'Udyam Registration', 'Insurance Certificate'];

    return reqTypes.map((type): UploadItemState => {
      const existingDoc = documents.find(
        (d) => d.vendorId === vendor.id && d.type === type
      );
      if (existingDoc) {
        return {
          type,
          required: true,
          status: existingDoc.status === 'verified' ? 'verified' : 'uploaded',
          fileName: existingDoc.fileName,
          fileSize: existingDoc.fileSize,
        };
      }
      return {
        type,
        required: true,
        status: 'missing',
      };
    });
  }, [vendor, documents]);

  const [documentsState, setDocumentsState] = useState<UploadItemState[]>(initialDocumentsState);

  // Sync state if documents change
  React.useEffect(() => {
    setDocumentsState(initialDocumentsState);
  }, [initialDocumentsState]);

  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // File upload handler
  const handleFileSelect = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendor) return;

    const docType = documentsState[index].type;
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setDocumentsState((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        fileName: file.name,
        fileSize: formattedSize,
        isUploading: true,
        progress: 45,
      };
      return copy;
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendorId', vendor.id);
      formData.append('documentTypeName', docType);

      await uploadRealDocument(formData);

      setDocumentsState((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          isUploading: false,
          progress: 100,
          status: 'uploaded',
        };
        return copy;
      });

      showToast('Uploaded successfully', `${docType} submitted to secure storage. Pending compliance review.`);
    } catch (err: any) {
      setDocumentsState((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          isUploading: false,
          progress: 0,
        };
        return copy;
      });
      showToast('Upload Failed', err.message || 'Could not upload document.', 'error');
    }
  };

  const handleSubmitAll = () => {
    setIsSubmittingAll(true);
    setTimeout(() => {
      setIsSubmittingAll(false);
      setIsSubmittedSuccess(true);
    }, 800);
  };

  // If vendor link is not found
  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-slate-900">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Upload Portal Link Expired or Not Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The supplier verification link you followed is invalid or has expired. Please contact your buyer or enterprise compliance officer to request a fresh upload link.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button size="sm" variant="secondary">
                Go to Sign In
              </Button>
            </Link>
          </div>
          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400">
            <div>Build &amp; Develop : Rejiesh Ashwanth V</div>
            <div>ADYK Multi Venture Company • ADYK ZUOG</div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmittedSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-slate-900">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 shadow-lg text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Documents Submitted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thank you, <span className="font-semibold text-slate-800">{vendorName}</span>. Your compliance documents were received and forwarded to <span className="font-semibold text-slate-800">{requestedBy}</span> for verification.
          </p>
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-500 font-mono">
            Submission Reference: ZUOG-REF-{vendor.id.slice(0, 8).toUpperCase()}
          </div>
          <p className="text-[11px] text-slate-400">
            You may now safely close this browser window on your phone.
          </p>
          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400">
            <div>Build &amp; Develop : Rejiesh Ashwanth V</div>
            <div>ADYK Multi Venture Company • ADYK ZUOG</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16">
      {/* Mobile-First Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <BrandLogo variant="full" size="md" />
          <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
            Secure Upload
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* Document Request Banner */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="text-[11px] font-bold text-[#00A878] uppercase tracking-wider">
            Document Request
          </div>
          <h1 className="text-lg font-bold text-slate-900 leading-snug">
            {requestedBy}
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please upload the statutory compliance documents requested for your supplier account.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
            <span>Vendor: <strong className="text-slate-700">{vendorName}</strong></span>
            <span>Accepted: PDF, JPG, PNG</span>
          </div>
        </div>

        {/* REQUIRED DOCUMENTS LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Required Documents
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              {documentsState.filter((d) => d.status !== 'missing').length} of {documentsState.length} ready
            </span>
          </div>

          {documentsState.map((item, index) => (
            <div
              key={item.type}
              className={`p-4 rounded-xl border transition-all bg-white ${
                item.status === 'verified'
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : item.status === 'uploaded'
                  ? 'border-teal-200 bg-teal-50/20'
                  : 'border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      item.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'uploaded'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status === 'verified' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    ) : item.status === 'uploaded' ? (
                      <Check className="w-5 h-5 text-teal-700" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.type}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.status === 'verified'
                        ? 'Verified'
                        : item.status === 'uploaded'
                        ? '✓ Uploaded successfully — Pending review'
                        : 'Please upload document'}
                    </p>
                  </div>
                </div>

                {item.status === 'verified' && (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified
                  </span>
                )}
                {item.status === 'uploaded' && (
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Uploaded
                  </span>
                )}
              </div>

              {/* Upload Progress Bar */}
              {item.isUploading && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Uploading...</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#00A878] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Action Button */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {item.status === 'verified' ? (
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                    {item.fileName}
                  </span>
                ) : item.status === 'uploaded' ? (
                  <span className="text-[11px] text-teal-900 font-mono truncate max-w-[180px]">
                    {item.fileName} ({item.fileSize})
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">PDF, JPG, PNG</span>
                )}

                {item.status !== 'verified' && (
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0B1E3B] hover:bg-[#07152B] active:bg-[#050E1D] text-white text-xs font-semibold shadow-xs cursor-pointer select-none">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{item.status === 'uploaded' ? 'Replace' : 'Upload Document'}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileSelect(index, e)}
                    />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA: Submit Documents */}
        <div className="pt-2">
          <Button
            size="lg"
            fullWidth
            isLoading={isSubmittingAll}
            onClick={handleSubmitAll}
          >
            Submit Documents
          </Button>
          <p className="text-[11px] text-slate-400 text-center mt-3">
            Your certificates will be encrypted and submitted directly to your client.
          </p>
        </div>

        <div className="pt-6 text-center text-[10px] text-slate-400 border-t border-slate-200">
          <div>Build &amp; Develop : Rejiesh Ashwanth V</div>
          <div>ADYK Multi Venture Company</div>
        </div>
      </main>
    </div>
  );
}
