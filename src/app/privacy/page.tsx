import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <BrandLogo variant="full" size="md" href="/" />
          <Link href="/">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 space-y-6 text-sm text-slate-600 leading-relaxed">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mt-1">Effective Date: November 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">1. Data Privacy & Confidentiality</h2>
            <p>
              ADYK ZUOG is committed to safeguarding vendor certificates and organizational records. We adhere to stringent confidentiality standards for Indian MSMEs and manufacturing supply networks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">2. Document Storage & Security</h2>
            <p>
              Statutory documents uploaded via the vendor self-service portal or administrative dashboard are stored securely with strict role-based access control. No document data is sold or shared with unauthorized third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">3. Vendor Portal Privacy</h2>
            <p>
              Suppliers accessing one-time document upload links are authenticated via secure tokenized links. Vendor phone numbers and email addresses are utilized solely for statutory compliance reminders and verification notifications.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 text-xs text-slate-400">
            <div>ADYK ZUOG • COMPLIANCE, SIMPLIFIED.</div>
            <div>Build &amp; Develop : Rejiesh Ashwanth V • ADYK Multi Venture Company</div>
          </div>
        </div>
      </div>
    </div>
  );
}
