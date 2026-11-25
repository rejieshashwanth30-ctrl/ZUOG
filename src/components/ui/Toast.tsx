'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map((toast) => {
        const icon = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />,
        }[toast.type || 'info'];

        const borderClass = {
          success: 'border-emerald-200 bg-white',
          error: 'border-rose-200 bg-white',
          warning: 'border-amber-200 bg-white',
          info: 'border-sky-200 bg-white',
        }[toast.type || 'info'];

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border ${borderClass} transition-all animate-in slide-in-from-bottom-3 duration-200`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-zinc-900 leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded cursor-pointer transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
