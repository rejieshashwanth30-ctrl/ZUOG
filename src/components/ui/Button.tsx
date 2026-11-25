import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'teal' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Professional micro-interaction: smooth 1-2px subtle elevation on hover, active state
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8.5 font-medium',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 h-9.5 font-medium',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 h-11 font-semibold',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#0B1E3B] hover:bg-[#07152B] active:bg-[#050E1D] text-white shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#0B1E3B]',
    secondary:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-slate-400',
    teal:
      'bg-[#00A878] hover:bg-[#008F66] active:bg-[#007654] text-white shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-[#00A878]',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-red-500',
    outline:
      'bg-transparent hover:bg-[#0B1E3B]/5 text-[#0B1E3B] border border-[#0B1E3B]/30 hover:border-[#0B1E3B]/60 focus-visible:ring-[#0B1E3B]',
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 focus-visible:ring-slate-400',
  }[variant];

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
