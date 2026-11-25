'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useApp } from '@/context/AppContext';
import {
  Building2,
  Users,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { DocumentType, VendorCategory } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const { addVendor, showToast } = useApp();
  const [currentStep, setCurrentStep] = useState(1);

  // 17. ONBOARDING:
  // Step 1: Business Details
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [gstin, setGstin] = useState('');

  // Step 2: Add First Vendor
  const [vendorName, setVendorName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorCategory, setVendorCategory] = useState<VendorCategory>('Raw Materials');

  // Step 3: Select Required Documents
  const [requiredDocs, setRequiredDocs] = useState<DocumentType[]>([
    'GST Certificate',
    'PAN Card',
    'Udyam Registration',
    'Insurance Certificate',
    'ISO 9001',
  ]);

  const [isFinishing, setIsFinishing] = useState(false);

  const toggleDoc = (doc: DocumentType) => {
    setRequiredDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      try {
        await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: companyName.trim(),
            gstin: gstin.trim(),
            city: location.split(',')[0]?.trim(),
            state: location.split(',')[1]?.trim(),
          }),
        });
      } catch {
        // Fallback
      }

      await addVendor({
        name: vendorName.trim(),
        contactPerson: contactPerson.trim(),
        phone: vendorPhone.trim(),
        email: vendorEmail.trim(),
        category: vendorCategory,
        address: 'Phase III, Industrial Estate',
        city: location.split(',')[0]?.trim() || 'Coimbatore',
        state: location.split(',')[1]?.trim() || 'Tamil Nadu',
        gstin: '33AABCA8899K1Z2',
        pan: 'AABCA8899K',
        status: 'incomplete',
        requiredDocumentTypes: requiredDocs,
        uploadedDocumentsCount: 0,
        totalRequiredCount: requiredDocs.length,
        nextExpiryDate: null,
      });

      showToast('Workspace Ready!', 'Your first supplier was registered. Welcome to your dashboard.');
      router.push('/dashboard');
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-8 px-4 sm:px-6 text-slate-900">
      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-200">
        <BrandLogo variant="full" size="md" href="/" />

        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
              currentStep >= 1 ? 'bg-[#0B1E3B] text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
            }`}
          >
            1
          </div>
          <div className={`w-8 h-0.5 rounded-full ${currentStep >= 2 ? 'bg-[#0B1E3B]' : 'bg-slate-200'}`} />
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
              currentStep >= 2 ? 'bg-[#0B1E3B] text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
            }`}
          >
            2
          </div>
          <div className={`w-8 h-0.5 rounded-full ${currentStep >= 3 ? 'bg-[#00A878]' : 'bg-slate-200'}`} />
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
              currentStep === 3 ? 'bg-[#00A878] text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
            }`}
          >
            3
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8">
        {/* Step 1: Business Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
                <Building2 className="w-3.5 h-3.5 text-[#0B1E3B]" /> Step 1 of 3: Business Details
              </div>
              <h2 className="text-xl font-bold text-slate-900">Confirm Your Organization Profile</h2>
              <p className="text-xs text-slate-500 mt-1">
                These details identify your manufacturing unit on compliance requests and renewal notices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Company / Factory Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Precision Engineering Pvt Ltd"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Industry / Manufacturing Domain
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Precision CNC Machining & Fabrication"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 33AABCA0000A1Z5"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setCurrentStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Step 2
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Add First Vendor */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
                <Users className="w-3.5 h-3.5 text-[#0B1E3B]" /> Step 2 of 3: Add First Vendor
              </div>
              <h2 className="text-xl font-bold text-slate-900">Add Your First Supplier</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter details for a supplier whose compliance you want to track.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Vendor / Supplier Company Name
                </label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Apex Precision Forgings"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Sundar Raman"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Supplier Category
                  </label>
                  <select
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value as VendorCategory)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Sheet Metal & Fabrication">Sheet Metal & Fabrication</option>
                    <option value="Precision Machining">Precision Machining</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Electrical & Sensors">Electrical & Sensors</option>
                    <option value="Foundry & Castings">Foundry & Castings</option>
                    <option value="Fasteners & Hardware">Fasteners & Hardware</option>
                    <option value="Tooling & Dies">Tooling & Dies</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Vendor Phone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    required
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    placeholder="+91 98400 00000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Vendor Email
                  </label>
                  <input
                    type="email"
                    required
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="contact@supplier.com"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" onClick={() => setCurrentStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue to Step 3
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Select Required Documents */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-800 text-xs font-semibold mb-2">
                <FileCheck className="w-3.5 h-3.5 text-[#00A878]" /> Step 3 of 3: Select Required Documents
              </div>
              <h2 className="text-xl font-bold text-slate-900">Define Required Compliance Documents</h2>
              <p className="text-xs text-slate-500 mt-1">
                Select the statutory documents required from {vendorName}.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-3">
              {[
                { type: 'GST Certificate', desc: 'Valid GSTIN registration certificate', def: true },
                { type: 'PAN Card', desc: 'Permanent Account Number verification', def: true },
                { type: 'Udyam Registration', desc: 'MSME registration certificate', def: true },
                { type: 'Insurance Certificate', desc: 'Commercial liability or transit insurance policy', def: true },
                { type: 'ISO 9001', desc: 'Quality management system certification', def: true },
                { type: 'Factory License', desc: 'Statutory factory inspection & license copy', def: false },
                { type: 'Trade License', desc: 'Municipal authority operational license', def: false },
                { type: 'Vendor Agreement', desc: 'Signed supply master agreement & NDA', def: false },
                { type: 'Quality Certificate', desc: 'Raw material test report or calibration cert', def: false },
              ].map((doc) => {
                const isSelected = requiredDocs.includes(doc.type as DocumentType);
                return (
                  <label
                    key={doc.type}
                    onClick={() => toggleDoc(doc.type as DocumentType)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'border-[#00A878] bg-teal-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-300 text-[#00A878] focus:ring-[#00A878]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{doc.type}</span>
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-[#00A878] flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="secondary" onClick={() => setCurrentStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                variant="teal"
                onClick={handleFinish}
                isLoading={isFinishing}
                rightIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Complete Onboarding &amp; Enter Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Attribution */}
      <div className="max-w-2xl w-full mx-auto pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <div>ADYK ZUOG • COMPLIANCE, SIMPLIFIED.</div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          Build &amp; Develop : Rejiesh Ashwanth V • ADYK Multi Venture Company
        </div>
      </div>
    </div>
  );
}
