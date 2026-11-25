import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TermsPage() {
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
            <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
            <p className="text-xs text-slate-400 mt-1">Effective Date: November 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the ADYK ZUOG platform, you agree to be bound by these Terms of Service. ADYK ZUOG is a business-to-business vendor compliance and document management software product developed by ADYK Multi Venture Company.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">2. Customer Responsibilities</h2>
            <p>
              Users are responsible for ensuring that all vendor documents uploaded (including GSTIN records, PAN certifications, insurance policies, and ISO accreditations) are legitimate and submitted in accordance with applicable Indian laws and regulatory frameworks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900">3. Platform Availability & Support</h2>
            <p>
              ADYK ZUOG maintains high availability for production manufacturing operations. Technical assistance and compliance schema setups are managed directly by the product engineering team.
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
