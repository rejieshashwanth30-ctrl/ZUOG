'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ShieldCheck, CheckCircle2, Lock, Mail, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { showToast, refreshData } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
        showToast('Login Failed', error.message || 'Invalid credentials.', 'error');
        setIsLoading(false);
        return;
      }

      // Check /api/workspaces to ensure workspace resolution
      const res = await fetch('/api/workspaces');
      if (res.ok) {
        const { workspace } = await res.json();
        if (workspace) {
          showToast('Welcome back', `Signed in to ${workspace.companyName || workspace.name}.`);
          await refreshData();
          router.push('/dashboard');
          return;
        }
      }

      showToast('Welcome to ADYK ZUOG', 'Signed in to your compliance workspace.');
      await refreshData();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[LoginPage] Sign in exception:', err);
      setErrorMsg(err.message || 'An error occurred during sign in.');
      showToast('Login Error', err.message || 'Unable to connect to authentication service.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row text-slate-900">
      {/* 19. LOGIN PAGE DESKTOP: LEFT Brand / Product Experience */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1E3B] p-12 xl:p-16 text-white flex-col justify-between relative overflow-hidden">
        {/* 20. Subtle slow-moving gradient/light texture for depth (NO neon, NO futuristic blobs) */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 15% 25%, #00a878 0%, transparent 45%), radial-gradient(ellipse at 85% 75%, #1e3a8a 0%, transparent 50%)',
          }}
        />

        {/* Top: Logo & Tagline */}
        <div className="relative z-10 animate-fade-in">
          <BrandLogo variant="dark-panel" size="md" href="/" />
        </div>

        {/* Middle: Brand Pitch & Realistic Miniature Compliance Visualization */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-teal-900/50 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A878]" />
            COMPLIANCE, SIMPLIFIED.
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Stay ahead of every vendor obligation.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            Track documents, expiry dates and compliance status from one place.
          </p>

          {/* 19. Subtle miniature compliance preview */}
          <div className="bg-slate-900/70 border border-slate-700/80 rounded-xl p-5 shadow-xl backdrop-blur-xs text-xs space-y-4 max-w-md mt-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-semibold text-slate-200">Vendor Compliance</span>
              <span className="text-[10px] text-teal-400 font-mono">Real-time status</span>
            </div>

            {/* Micro stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60">
                <span className="text-base font-bold text-teal-400 block">82</span>
                <span className="text-[10px] text-slate-400">Compliant</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60">
                <span className="text-base font-bold text-amber-400 block">21</span>
                <span className="text-[10px] text-slate-400">Expiring Soon</span>
              </div>
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60">
                <span className="text-base font-bold text-red-400 block">9</span>
                <span className="text-[10px] text-slate-400">Expired</span>
              </div>
            </div>

            {/* Vendor Rows */}
            <div className="divide-y divide-slate-800/80 text-[11px] pt-1">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-300 font-medium">GSTIN &amp; PAN Statutory Check</span>
                <span className="text-teal-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Automated
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-300 font-medium">ISO &amp; License Expiry Watch</span>
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> 30-Day Alert
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Supplier Upload Portal</span>
                <span className="text-teal-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Zero Install
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 59. Footer Attribution */}
        <div className="relative z-10 text-xs text-slate-400 border-t border-slate-800/70 pt-4">
          <div>Build &amp; Develop : <span className="text-slate-200 font-medium">Rejiesh Ashwanth V</span></div>
          <div className="text-[11px] text-slate-400">ADYK Multi Venture Company</div>
        </div>
      </div>

      {/* 21. LOGIN FORM: RIGHT SIDE */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="max-w-md w-full mx-auto animate-fade-up">
          {/* Mobile Header with clear Logo */}
          <div className="lg:hidden mb-8">
            <BrandLogo variant="full" size="md" href="/" />
            <p className="text-xs text-slate-500 mt-2">
              Vendor compliance management for Indian manufacturing.
            </p>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500">
              Sign in to your ADYK ZUOG workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-8 space-y-4.5">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A878] focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert('Password reset link will be sent to your verified work email address.')
                  }
                  className="text-xs font-medium text-teal-800 hover:text-teal-900 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A878] focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B1E3B] focus:ring-[#00A878]"
                />
                <span className="text-slate-600">Remember this device</span>
              </label>
            </div>

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                Sign In
              </Button>
            </div>
          </form>

          {/* Bottom link to Signup */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-[#0B1E3B] hover:text-[#00A878] hover:underline">
                Create workspace
              </Link>
            </p>
          </div>

          {/* 59. Mobile attribution */}
          <div className="mt-8 text-center text-[11px] text-slate-400">
            <div>Build &amp; Develop : Rejiesh Ashwanth V</div>
            <div>ADYK Multi Venture Company</div>
          </div>
        </div>
      </div>
    </div>
  );
}
