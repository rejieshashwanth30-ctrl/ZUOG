'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import {
  ShieldCheck,
  CheckCircle2,
  User,
  Building,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Check,
  Shield,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase/client';
import { apiFetch } from '@/lib/api/apiClient';

export default function SignupPage() {
  const router = useRouter();
  const { showToast, refreshData } = useApp();

  // 16. SIGNUP PAGE Fields: Full Name, Company Name, Work Email, Phone Number, Password
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEmailConfirmationPending, setIsEmailConfirmationPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. Sign up user in Supabase Auth
      let { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      // If user is already registered in Supabase Auth, attempt sign-in with provided password
      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (!signInError && signInData.session) {
            authData = signInData;
          } else {
            setErrorMsg('An account with this email already exists. Please sign in with your password.');
            showToast('Account Exists', 'Please sign in with your email and password.', 'warning');
            setIsLoading(false);
            return;
          }
        } else {
          setErrorMsg(authError.message);
          showToast('Registration Error', authError.message, 'error');
          setIsLoading(false);
          return;
        }
      }

      // 2. Handle email confirmation if required by project configuration
      if (!authData.session && authData.user) {
        setIsEmailConfirmationPending(true);
        setIsLoading(false);
        return;
      }

      // 3. Ensure active session in browser client
      if (authData.session) {
        await supabase.auth.setSession({
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        });
      }

      // 4. Synchronize user and create organization workspace in Neon PostgreSQL
      // Use centralized apiFetch with explicit Bearer token and credentials: 'include'
      const token = authData.session?.access_token;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await apiFetch('/api/workspaces', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          companyName: companyName.trim(),
          companyEmail: email.trim(),
          companyPhone: phone.trim(),
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const detailedMsg = errJson.details
          ? `${errJson.error || 'Failed to create workspace in Neon.'} (${errJson.details})`
          : (errJson.error || 'Failed to initialize organization workspace in Neon.');
        throw new Error(detailedMsg);
      }

      showToast('Workspace Created', `Welcome to ADYK ZUOG, ${fullName}! Setting up your workspace.`);
      await refreshData();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[SignupPage] Error during registration:', err);
      setErrorMsg(err.message || 'Failed to complete workspace registration.');
      showToast('Setup Failed', err.message || 'Could not create workspace.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row text-slate-900">
      {/* 16. LEFT BRAND PANEL (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1E3B] p-12 xl:p-16 text-white flex-col justify-between relative overflow-hidden">
        {/* Subtle slow-moving gradient depth */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 15% 25%, #00a878 0%, transparent 45%), radial-gradient(ellipse at 85% 75%, #1e3a8a 0%, transparent 50%)',
          }}
        />

        {/* Top: Brand Logo on White Card with comfortable breathing room */}
        <div className="relative z-10 animate-fade-in">
          <BrandLogo variant="dark-panel" size="md" href="/" />
        </div>

        {/* Middle: Brand Pitch & Realistic Miniature Setup Workflow Preview */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-teal-900/50 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A878]" />
            COMPLIANCE, SIMPLIFIED.
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Set up your organization workspace in less than 2 minutes.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            Eliminate audit risk and stop chasing certificates manually across WhatsApp groups and scattered emails.
          </p>

          {/* Miniature 3-Step Setup Card */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-5 shadow-xl backdrop-blur-xs text-xs space-y-3.5 max-w-md mt-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-semibold text-slate-200">Onboarding Preview</span>
              <span className="text-[10px] text-teal-400 font-mono">Immediate activation</span>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <div className="w-5 h-5 rounded-md bg-[#00A878] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="text-slate-200 font-medium">Create your secure business workspace</div>
                  <div className="text-[11px] text-slate-400">Configure GSTIN, factory profile, and team permissions</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <div className="w-5 h-5 rounded-md bg-[#00A878] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="text-slate-200 font-medium">Add suppliers &amp; required documents</div>
                  <div className="text-[11px] text-slate-400">Select GST, PAN, Udyam, ISO, and insurance requirements</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <div className="w-5 h-5 rounded-md bg-[#00A878] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="text-slate-200 font-medium">Auto-track expiry &amp; access audit dashboard</div>
                  <div className="text-[11px] text-slate-400">Zero-install vendor upload links via WhatsApp &amp; Email</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="relative z-10 text-xs text-slate-400 border-t border-slate-800/70 pt-4">
          <div>
            Build &amp; Develop : <span className="text-slate-200 font-medium">Rejiesh Ashwanth V</span>
          </div>
          <div className="text-[11px] text-slate-400">ADYK Multi Venture Company</div>
        </div>
      </div>

      {/* 16. RIGHT FORM PANEL */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-10 lg:px-16 xl:px-24 py-8 sm:py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
            <BrandLogo variant="full" size="sm" href="/" />
          </div>

          {isEmailConfirmationPending ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 text-center space-y-5 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 text-[#00A878] flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verify Your Email</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We sent a confirmation link to <strong className="text-slate-900">{email}</strong>.
                  Please verify your email address, then sign in to access your compliance workspace.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link href="/login" className="block">
                  <Button fullWidth size="lg">
                    Proceed to Sign In
                  </Button>
                </Link>
                <p className="text-[11px] text-slate-400">
                  Didn&apos;t receive it? Check your spam folder or sign in with your password.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Create Workspace</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Start tracking vendor compliance across your supply chain today.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-3.5 sm:space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Precision Components Pvt Ltd"
                      className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Work Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-9.5 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] focus:border-transparent transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98400 00000"
                        className="w-full pl-9.5 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] focus:border-transparent transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E3B] focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                    Create Workspace
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link href="/login" className="font-semibold text-[#0B1E3B] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-6 text-center text-[10px] text-slate-400">
                <div>Build &amp; Develop : Rejiesh Ashwanth V</div>
                <div>ADYK Multi Venture Company</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
