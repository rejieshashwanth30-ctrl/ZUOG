'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  FileText,
  Clock,
  Bell,
  Smartphone,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Menu,
  X,
  Building2,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#0B1E3B]/10 selection:text-[#0B1E3B]">
      {/* 15. GPU-accelerated scroll progress indicator (zero React re-renders on scroll) */}
      <ScrollProgressBar />

      {/* 4. MATURE B2B SAAS HEADER */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-xs border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* LEFT: ADYK ZUOG Logo (Prominent, height 40-48px on desktop, clearly readable) */}
          <div className="flex items-center">
            <BrandLogo variant="full" size="md" href="/" withTagline={false} />
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center gap-9 text-[13px] font-medium text-slate-600">
            <a href="#product" className="hover:text-[#0B1E3B] transition-colors">
              Product
            </a>
            <a href="#features" className="hover:text-[#0B1E3B] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#0B1E3B] transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-[#0B1E3B] transition-colors">
              Pricing
            </a>
          </nav>

          {/* RIGHT: Login & Get Started CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-5 py-4 space-y-3 animate-fade-in">
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-[#0B1E3B]"
            >
              Product
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-[#0B1E3B]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-[#0B1E3B]"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-[#0B1E3B]"
            >
              Pricing
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link href="/login" className="w-full">
                <Button variant="secondary" size="sm" fullWidth>
                  Login
                </Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button size="sm" fullWidth>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 9. HERO SECTION (Refined Typography & Balanced Hierarchy) */}
      <section className="pt-14 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 animate-fade-up">
          {/* Refined subtle eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-xs font-medium mb-6 border border-slate-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A878]" />
            Vendor compliance for Indian MSMEs &amp; manufacturing
          </div>

          {/* Balanced H1 with proper line-height (not overwhelming bold) */}
          <h1 className="heading-h1 max-w-2xl mx-auto">
            Vendor compliance, without the spreadsheet chaos.
          </h1>

          {/* Balanced supporting paragraph */}
          <p className="mt-5 text-body text-slate-600 max-w-[700px] mx-auto">
            ADYK ZUOG helps businesses manage vendor documents, track expiry dates, collect renewals and stay compliance-ready from one simple workspace.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" fullWidth>
                See How It Works
              </Button>
            </a>
          </div>

          {/* 10. Natural, smaller trust indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[12px] text-slate-500 font-normal">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#00A878] stroke-[2.5]" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#00A878] stroke-[2.5]" /> Simple setup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#00A878] stroke-[2.5]" /> Mobile vendor upload
            </span>
          </div>
        </div>

        {/* 11. PRODUCT PREVIEW: Responsive, compact product preview on mobile, full showcase on desktop */}
        <div id="product" className="relative mx-auto max-w-5xl animate-scale-in">
          <div className="rounded-xl bg-[#0B1E3B] p-1.5 sm:p-2.5 shadow-xl ring-1 ring-slate-900/10">
            <div className="rounded-lg bg-white border border-slate-200 overflow-hidden text-left">
              {/* Realistic Browser Window Top Chrome */}
              <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-300" />
                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 ml-1.5 sm:ml-2">
                    app.adykzuog.com<span className="hidden sm:inline">/dashboard</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    Live Operational Workspace
                  </span>
                  <span className="sm:hidden text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                </div>
              </div>

              {/* Responsive Dashboard Body */}
              <div className="p-3 sm:p-5 md:p-6 space-y-3 sm:space-y-4 md:space-y-5">
                {/* Dashboard title row */}
                <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">Vendor Compliance Engine</h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500">Automated multi-channel compliance &amp; document control</p>
                  </div>
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline" rightIcon={<ChevronRight className="w-3 h-3" />} className="h-7 px-2 text-[11px] sm:h-8 sm:px-3 sm:text-xs">
                      <span className="hidden sm:inline">Explore Live Workspace</span>
                      <span className="sm:hidden">Explore</span>
                    </Button>
                  </Link>
                </div>

                {/* 29. Compact Responsive Capability Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-slate-50/80 p-2 sm:p-3.5 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block">Audit Readiness</span>
                    <span className="text-base sm:text-xl font-bold text-slate-900 mt-0.5 sm:mt-1 block">Live Trail</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5">Automated logging</span>
                  </div>

                  <div className="bg-emerald-50/40 p-2 sm:p-3.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] sm:text-[11px] text-emerald-800 font-medium block">Verification</span>
                    <span className="text-base sm:text-xl font-bold text-emerald-700 mt-0.5 sm:mt-1 block">Multi-Tier</span>
                    <span className="text-[9px] sm:text-[10px] text-emerald-700 block mt-0.5">Verified certificates</span>
                  </div>

                  <div className="bg-amber-50/40 p-2 sm:p-3.5 rounded-lg border border-amber-100">
                    <span className="text-[10px] sm:text-[11px] text-amber-800 font-medium block">Expiry Engine</span>
                    <span className="text-base sm:text-xl font-bold text-amber-700 mt-0.5 sm:mt-1 block">T-30 to T-1</span>
                    <span className="text-[9px] sm:text-[10px] text-amber-700 block mt-0.5">Automated cycles</span>
                  </div>

                  <div className="bg-teal-50/40 p-2 sm:p-3.5 rounded-lg border border-teal-100">
                    <span className="text-[10px] sm:text-[11px] text-teal-800 font-medium block">Dispatch</span>
                    <span className="text-base sm:text-xl font-bold text-teal-700 mt-0.5 sm:mt-1 block">WhatsApp &amp; Email</span>
                    <span className="text-[9px] sm:text-[10px] text-teal-600 block mt-0.5">Direct vendor alert</span>
                  </div>
                </div>

                {/* Workflow Architecture Table */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                      Compliance Pipeline
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-teal-700 font-medium">Real-Time Operational Engine</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                      <div className="min-w-0 pr-2 sm:pr-3">
                        <div className="font-semibold text-slate-900 text-xs">Mobile Document Upload</div>
                        <div className="text-slate-500 text-[10px] sm:text-[11px]">Direct mobile camera &amp; gallery file submission</div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Secure Link
                        </span>
                        <Link href="/dashboard">
                          <span className="text-xs font-semibold text-[#0B1E3B] hover:text-[#00A878] hover:underline cursor-pointer">
                            View
                          </span>
                        </Link>
                      </div>
                    </div>

                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                      <div className="min-w-0 pr-2 sm:pr-3">
                        <div className="font-semibold text-slate-900 text-xs">Automated Expiry Alerts</div>
                        <div className="text-slate-500 text-[10px] sm:text-[11px]">30, 15, 7, 1 day &amp; expired triggers</div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Active
                        </span>
                        <Link href="/reminders">
                          <span className="text-xs font-semibold text-[#0B1E3B] hover:text-[#00A878] hover:underline cursor-pointer">
                            Rules
                          </span>
                        </Link>
                      </div>
                    </div>

                    <div className="hidden sm:flex px-4 py-2.5 items-center justify-between hover:bg-slate-50 text-xs">
                      <div className="min-w-0 pr-3">
                        <div className="font-semibold text-slate-900 text-xs">Database-Backed Multi-Tenancy</div>
                        <div className="text-slate-500 text-[11px]">Strict Neon PostgreSQL tenant isolation</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                          Isolated
                        </span>
                        <Link href="/compliance">
                          <span className="text-xs font-semibold text-[#0B1E3B] hover:text-[#00A878] hover:underline cursor-pointer">
                            Audit
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 16. FEATURE SECTION: Editorial Layout (Left: Heading, Right: Feature list with subtle hover) */}
      <section id="features" className="py-18 sm:py-24 bg-white border-y border-slate-200/80">
        <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Editorial Heading */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00A878]">
                Capabilities
              </span>
              <h2 className="heading-h2 text-[#0B1E3B]">
                Everything you need to stay compliance-ready.
              </h2>
              <p className="text-body text-slate-600 max-w-md">
                Built specifically around the operational realities of procurement and audit teams in Indian manufacturing. No heavy ERP installation required.
              </p>
              <div className="pt-2">
                <Link href="/signup">
                  <Button size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Clean Feature List (not floating cards) */}
            <div className="lg:col-span-7 divide-y divide-slate-100">
              {[
                {
                  icon: Building2,
                  title: 'Vendor Management',
                  description:
                    'Keep supplier information organized. Maintain contacts, GSTIN records, PAN documents, and category classifications in one structured registry.',
                },
                {
                  icon: FileText,
                  title: 'Document Control',
                  description:
                    'Collect and manage important vendor documents. Record document numbers, track validity periods, and maintain complete audit timestamps.',
                },
                {
                  icon: Clock,
                  title: 'Expiry Tracking',
                  description:
                    'Know what is expiring before it becomes a problem. Stay ahead of statutory license renewals, insurance maturities, and ISO audits.',
                },
                {
                  icon: Bell,
                  title: 'Renewal Reminders',
                  description:
                    'Reduce manual follow-ups. Schedule timely automated notices across WhatsApp and Email to both vendors and internal procurement teams.',
                },
                {
                  icon: Smartphone,
                  title: 'Vendor Upload Portal',
                  description:
                    'Let vendors submit documents directly from their phone. One-click secure upload links without complicated account creation.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Compliance Overview',
                  description:
                    'See the status of every vendor at a glance. Immediately identify compliant, expiring, and incomplete suppliers without opening spreadsheets.',
                },
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="py-6 first:pt-0 last:pb-0 px-4 -mx-4 rounded-lg hover:bg-slate-50/70 transition-colors duration-150 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#0B1E3B] flex items-center justify-center shrink-0 border border-slate-200/60 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 17. HOW IT WORKS: Horizontal timeline desktop, Vertical mobile */}
      <section id="how-it-works" className="py-18 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A878]">
              Workflow
            </span>
            <h2 className="heading-h2 text-[#0B1E3B] mt-2">
              How it works
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              A simple 6-step loop from supplier onboarding to audit readiness.
            </p>
          </div>

          {/* Desktop: Horizontal workflow */}
          <div className="hidden lg:grid grid-cols-6 gap-3.5 relative">
            {[
              { step: '01', title: 'ADD VENDOR', desc: 'Create supplier profile & required checklist' },
              { step: '02', title: 'REQUEST DOCUMENTS', desc: 'Dispatch secure mobile upload link' },
              { step: '03', title: 'VENDOR UPLOADS', desc: 'Supplier submits files directly from phone' },
              { step: '04', title: 'VERIFY', desc: 'Audit team approves or flags documents' },
              { step: '05', title: 'TRACK EXPIRY', desc: 'Continuous validity monitoring' },
              { step: '06', title: 'RENEW', desc: 'Automated renewal cycle before deadline' },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-[#00A878] block mb-2">
                    {item.step}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 tracking-wider mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                </div>
                {index < 5 && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4.5 h-4.5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: Vertical workflow */}
          <div className="lg:hidden space-y-3 max-w-md mx-auto">
            {[
              { step: '01', title: 'ADD VENDOR', desc: 'Create supplier profile & required checklist' },
              { step: '02', title: 'REQUEST DOCUMENTS', desc: 'Dispatch secure mobile upload link' },
              { step: '03', title: 'VENDOR UPLOADS', desc: 'Supplier submits files directly from phone' },
              { step: '04', title: 'VERIFY', desc: 'Audit team approves or flags documents' },
              { step: '05', title: 'TRACK EXPIRY', desc: 'Continuous validity monitoring' },
              { step: '06', title: 'RENEW', desc: 'Automated renewal cycle before deadline' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3.5 p-3.5 rounded-lg bg-white border border-slate-200">
                <div className="w-8 h-8 rounded bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-wider">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* 14. TRUST SECTION: Built for real business workflows */}
      <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="heading-h2 text-[#0B1E3B]">
              Built for real business workflows.
            </h2>
            <p className="mt-2 text-body text-slate-600 max-w-2xl mx-auto">
              Centralized records and direct supplier submission designed specifically for manufacturing supply operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <Check className="w-4 h-4 text-[#00A878] stroke-[2.5]" />
                Centralized vendor records
              </div>
              <p className="text-[12px] text-slate-500 leading-normal">
                Structured records replace scattered WhatsApp messages and spreadsheets.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <Check className="w-4 h-4 text-[#00A878] stroke-[2.5]" />
                Clear compliance status
              </div>
              <p className="text-[12px] text-slate-500 leading-normal">
                Audit readiness is visible immediately without manual compilation.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <Check className="w-4 h-4 text-[#00A878] stroke-[2.5]" />
                Document expiry visibility
              </div>
              <p className="text-[12px] text-slate-500 leading-normal">
                Deadlines trigger alerts 30, 15, and 7 days prior to lapse.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <Check className="w-4 h-4 text-[#00A878] stroke-[2.5]" />
                Less manual follow-up
              </div>
              <p className="text-[12px] text-slate-500 leading-normal">
                Direct renewal requests save hours calling suppliers for certificates.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-2xs sm:col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <Check className="w-4 h-4 text-[#00A878] stroke-[2.5]" />
                Mobile-friendly vendor submission
              </div>
              <p className="text-[12px] text-slate-500 leading-normal">
                Vendors open a clean link on their phone, take a photo or select PDF, and submit directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Clean & Realistic Commercial Tiers) */}
      <section id="pricing" className="py-18 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A878]">
              Pricing
            </span>
            <h2 className="heading-h2 text-[#0B1E3B] mt-2">
              Straightforward pricing for MSMEs
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Clear tiers structured for your supplier volume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Standard MSME */}
            <div className="p-6 rounded-lg bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Standard MSME</h3>
                <p className="text-xs text-slate-500 mt-1">For single workshop & machine units</p>
                <div className="mt-4 mb-6">
                  <span className="text-2xl font-bold text-slate-900">₹2,499</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Up to 50 active suppliers
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Mobile vendor upload portal
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Expiry notification tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Audit status dashboard
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/signup">
                  <Button variant="secondary" fullWidth size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            {/* Growing Industrial */}
            <div className="p-6 rounded-lg bg-white border-2 border-[#0B1E3B] shadow-sm flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 bg-[#00A878] text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wide">
                POPULAR
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B1E3B]">Growing Industrial</h3>
                <p className="text-xs text-slate-500 mt-1">For multi-line plants & precision fabricators</p>
                <div className="mt-4 mb-6">
                  <span className="text-2xl font-bold text-slate-900">₹5,999</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Up to 250 active suppliers
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> WhatsApp & Email renewal channels
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Multi-user audit team access
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Compliance reporting & export
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/signup">
                  <Button variant="primary" fullWidth size="sm">
                    Select Plan
                  </Button>
                </Link>
              </div>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-lg bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enterprise</h3>
                <p className="text-xs text-slate-500 mt-1">For multi-plant groups & corporate networks</p>
                <div className="mt-4 mb-6">
                  <span className="text-2xl font-bold text-slate-900">Custom</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Unlimited suppliers
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Custom compliance criteria
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00A878]" /> Dedicated operations support
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link href="/login">
                  <Button variant="secondary" fullWidth size="sm">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 60. LANDING FOOTER: Compact & professional on mobile, full structure on desktop */}
      <footer className="bg-[#0B1E3B] text-white py-4 sm:py-7 md:py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-5 md:gap-6 pb-3 sm:pb-5 md:pb-6 border-b border-slate-800">
            {/* Logo + Tagline */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <BrandLogo variant="dark-panel" size="sm" />
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-teal-400 uppercase font-sans">
                  COMPLIANCE, SIMPLIFIED.
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400">
                  Vendor Compliance &amp; Document Management
                </div>
              </div>
            </div>

            {/* Navigation Links - Single streamlined row on mobile with dot separators */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-300">
              <a href="#product" className="hover:text-white transition-colors">Product</a>
              <span className="text-slate-600 sm:hidden">•</span>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <span className="text-slate-600 sm:hidden">•</span>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <span className="text-slate-600 sm:hidden">•</span>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <span className="text-slate-600 sm:hidden">•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <span className="text-slate-600 sm:hidden">•</span>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>

            {/* Workspace Dashboard Link */}
            <div className="text-center md:text-right">
              <Link href="/dashboard" className="text-xs font-semibold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 transition-colors">
                Workspace Dashboard →
              </Link>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs text-slate-400 gap-1.5 sm:gap-4 text-center sm:text-left">
            <div>
              © 2026 ADYK ZUOG. All rights reserved.
            </div>

            {/* Attribution */}
            <div className="text-center sm:text-right">
              <span className="font-semibold text-slate-200">
                Build &amp; Develop : Rejiesh Ashwanth V
              </span>
              <span className="hidden sm:inline text-slate-500"> • </span>
              <span className="block sm:inline text-slate-400 text-[10px] sm:text-[11px]">
                ADYK Multi Venture Company
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
