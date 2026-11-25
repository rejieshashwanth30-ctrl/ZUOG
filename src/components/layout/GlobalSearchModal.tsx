'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Search, Building2, FileText, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { ComplianceBadge, DocumentBadge } from '../ui/Badge';

export function GlobalSearchModal() {
  const { globalSearchOpen, setGlobalSearchOpen, vendors, documents } = useApp();
  const [query, setQuery] = useState('');
  const router = useRouter();

  if (!globalSearchOpen) return null;

  // 54. SEARCH: Global search should support: Vendors, Documents, Compliance issues
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return {
        vendors: vendors.slice(0, 3),
        documents: documents.slice(0, 3),
        complianceIssues: vendors.filter((v) => v.status === 'expiring' || v.status === 'expired').slice(0, 3),
      };
    }

    const q = query.toLowerCase();
    const matchedVendors = vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.gstin.toLowerCase().includes(q)
    );

    const matchedDocs = documents.filter(
      (d) =>
        d.type.toLowerCase().includes(q) ||
        d.vendorName.toLowerCase().includes(q) ||
        (d.documentNumber && d.documentNumber.toLowerCase().includes(q))
    );

    const matchedIssues = vendors.filter(
      (v) =>
        (v.status === 'expiring' || v.status === 'expired' || v.status === 'incomplete') &&
        (v.name.toLowerCase().includes(q) || v.category.toLowerCase().includes(q))
    );

    return {
      vendors: matchedVendors.slice(0, 5),
      documents: matchedDocs.slice(0, 5),
      complianceIssues: matchedIssues.slice(0, 5),
    };
  }, [query, vendors, documents]);

  if (!globalSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={() => setGlobalSearchOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 transform transition-all animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendors, documents, compliance issues..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 text-xs"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="sm:hidden text-slate-400 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[65vh] overflow-y-auto p-3 space-y-4">
          {/* Vendors group */}
          {filteredResults.vendors.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                Vendors
              </div>
              <div className="mt-1 space-y-1">
                {filteredResults.vendors.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setGlobalSearchOpen(false);
                      router.push(`/vendors/${v.id}`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#0B1E3B]/10 text-[#0B1E3B] flex items-center justify-center font-bold text-xs">
                        {v.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{v.name}</div>
                        <div className="text-xs text-slate-400">
                          {v.city}, {v.category} • GSTIN: {v.gstin}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ComplianceBadge status={v.status} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents group */}
          {filteredResults.documents.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                Documents
              </div>
              <div className="mt-1 space-y-1">
                {filteredResults.documents.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setGlobalSearchOpen(false);
                      router.push(`/documents`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{d.type}</div>
                        <div className="text-xs text-slate-400">
                          {d.vendorName} {d.expiryDate ? `• Expires ${d.expiryDate}` : ''}
                        </div>
                      </div>
                    </div>
                    <DocumentBadge status={d.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance issues group */}
          {filteredResults.complianceIssues.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                Compliance Alerts
              </div>
              <div className="mt-1 space-y-1">
                {filteredResults.complianceIssues.map((v) => (
                  <div
                    key={`issue-${v.id}`}
                    onClick={() => {
                      setGlobalSearchOpen(false);
                      router.push(`/compliance`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50/40 border border-transparent hover:border-red-200 cursor-pointer transition-all"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{v.name}</div>
                      <div className="text-xs text-slate-500">
                        {v.status === 'expiring'
                          ? `Renewal due soon (${v.nextExpiryDate})`
                          : v.status === 'expired'
                          ? 'Certificate expired — follow-up required'
                          : 'Mandatory compliance certificates missing'}
                      </div>
                    </div>
                    <ComplianceBadge status={v.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredResults.vendors.length === 0 &&
            filteredResults.documents.length === 0 &&
            filteredResults.complianceIssues.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                No matching vendors, documents, or compliance issues found.
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or touch</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
