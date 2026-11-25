import React from 'react';
import { ComplianceStatus, DocumentStatus } from '@/types';
import { ShieldCheck, Clock, AlertCircle, FileQuestion, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function ComplianceBadge({ status, size = 'sm', showIcon = true }: ComplianceBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'compliant':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}
        >
          {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
          Compliant
        </span>
      );
    case 'expiring':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses}`}
        >
          {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
          Expiring Soon
        </span>
      );
    case 'expired':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-medium bg-red-50 text-red-800 border border-red-200/80 ${sizeClasses}`}
        >
          {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
          Expired
        </span>
      );
    case 'incomplete':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />}
          Incomplete
        </span>
      );
    case 'review':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded font-medium bg-sky-50 text-sky-800 border border-sky-200/80 ${sizeClasses}`}
        >
          {showIcon && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />}
          Under Review
        </span>
      );
    default:
      return null;
  }
}

interface DocumentBadgeProps {
  status: DocumentStatus;
  size?: 'sm' | 'md';
}

export function DocumentBadge({ status, size = 'sm' }: DocumentBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  switch (status) {
    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          Verified
        </span>
      );
    case 'pending':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-medium bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}
        >
          <Clock className="w-3 h-3 text-sky-600 shrink-0" />
          Pending Review
        </span>
      );
    case 'expiring':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-medium bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
          Expiring Soon
        </span>
      );
    case 'expired':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-medium bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}
        >
          <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
          Expired
        </span>
      );
    case 'missing':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}
        >
          <FileQuestion className="w-3 h-3 text-slate-400 shrink-0" />
          Missing
        </span>
      );
    case 'rejected':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded font-medium bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}
        >
          <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
          Rejected
        </span>
      );
    default:
      return null;
  }
}
