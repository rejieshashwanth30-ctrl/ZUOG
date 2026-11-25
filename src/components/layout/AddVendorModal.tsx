'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { DocumentType, VendorCategory } from '@/types';
import { Building2, Phone, Mail, MapPin, FileCheck } from 'lucide-react';

const CATEGORIES: VendorCategory[] = [
  'Raw Materials',
  'Sheet Metal & Fabrication',
  'Precision Machining',
  'Packaging',
  'Electrical & Sensors',
  'Foundry & Castings',
  'Fasteners & Hardware',
  'Chemicals & Coatings',
  'Tooling & Dies',
];

const AVAILABLE_DOCS: DocumentType[] = [
  'GST Certificate',
  'PAN Card',
  'Udyam Registration',
  'Insurance Certificate',
  'ISO 9001',
  'Factory License',
  'Vendor Agreement',
  'Quality Certificate',
];

export function AddVendorModal() {
  const { addVendorModalOpen, setAddVendorModalOpen, addVendor } = useApp();

  if (!addVendorModalOpen) return null;

  // 30. ADD VENDOR Fields
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Raw Materials');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  
  // Optional:
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  
  // Required documents
  const [selectedDocs, setSelectedDocs] = useState<DocumentType[]>([
    'GST Certificate',
    'PAN Card',
    'Udyam Registration',
    'Insurance Certificate',
    'ISO 9001',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDoc = (doc: DocumentType) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const resetForm = () => {
    setName('');
    setContactPerson('');
    setPhone('+91 ');
    setEmail('');
    setCategory('Raw Materials');
    setAddress('');
    setCity('');
    setState('Tamil Nadu');
    setGstin('');
    setPan('');
    setSelectedDocs([
      'GST Certificate',
      'PAN Card',
      'Udyam Registration',
      'Insurance Certificate',
      'ISO 9001',
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactPerson.trim()) return;

    setIsSubmitting(true);
    try {
      await addVendor({
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim() || '+91 98400 00000',
        email: email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@vendor.com`,
        category,
        address: address.trim() || 'Industrial Estate',
        city: city.trim() || 'Coimbatore',
        state: state.trim() || 'Tamil Nadu',
        gstin: gstin.trim().toUpperCase() || '33AAACB0000A1Z5',
        pan: pan.trim().toUpperCase() || 'AAACB0000A',
        status: 'incomplete',
        requiredDocumentTypes: selectedDocs,
        uploadedDocumentsCount: 0,
        totalRequiredCount: selectedDocs.length,
        nextExpiryDate: null,
      });

      resetForm();
      setAddVendorModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={addVendorModalOpen}
      onClose={() => setAddVendorModalOpen(false)}
      title="Add Vendor"
      subtitle="Register supplier organization and configure statutory compliance checklist."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Basic Vendor Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Industrial Castings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Krishnan"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98400 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Work Email
            </label>
            <input
              type="email"
              placeholder="sales@supplier.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VendorCategory)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-700"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Factory / Office Address
          </label>
          <input
            type="text"
            placeholder="Plot number, industrial estate, city, state"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900"
          />
        </div>

        {/* Optional GSTIN / PAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              GSTIN <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 33AABCA1234F1Z5"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              PAN <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AABCA1234F"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] bg-white text-slate-900 font-mono uppercase"
            />
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Required Compliance Documents ({selectedDocs.length} selected)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-white">
            {AVAILABLE_DOCS.map((doc) => {
              const isChecked = selectedDocs.includes(doc);
              return (
                <label
                  key={doc}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer select-none transition-colors ${
                    isChecked ? 'bg-teal-50/50 text-teal-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDoc(doc)}
                    className="rounded border-slate-300 text-[#00A878] focus:ring-[#00A878]"
                  />
                  <span className="text-xs">{doc}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAddVendorModalOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Add Vendor
          </Button>
        </div>
      </form>
    </Modal>
  );
}
