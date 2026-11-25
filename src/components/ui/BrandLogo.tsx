'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'icon' | 'dark-panel';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
  withTagline?: boolean;
  priority?: boolean;
}

export const BrandLogo = React.memo(function BrandLogo({
  variant = 'full',
  size = 'md',
  href,
  className = '',
  withTagline = false,
  priority = true,
}: BrandLogoProps) {
  // Desktop height approximately 40-48px as explicitly requested:
  // sm: h-8.5 (34px), md: h-11 (44px), lg: h-12 (48px), xl: h-14 (56px)
  const sizeConfig = {
    sm: { height: 34, width: 140, containerClass: 'h-8.5 w-[140px]' },
    md: { height: 44, width: 180, containerClass: 'h-10 sm:h-[44px] w-[150px] sm:w-[180px]' },
    lg: { height: 48, width: 198, containerClass: 'h-12 w-[198px]' },
    xl: { height: 56, width: 230, containerClass: 'h-14 w-[230px]' },
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {variant === 'icon' ? (
        <div className="relative w-10 h-10 shrink-0">
          <Image
            src="/adyk-zuog-icon.png"
            alt="ADYK ZUOG Icon"
            width={40}
            height={40}
            priority={priority}
            className="object-contain"
          />
        </div>
      ) : variant === 'dark-panel' ? (
        /* Dark navy panel variant: Crisp, generous white card with comfortable padding & breathing room */
        <div className="inline-flex items-center bg-white px-4 py-2.5 rounded-xl shadow-xs border border-white/25">
          <div className="relative h-11 w-[180px]">
            <Image
              src="/adyk-zuog-logo-cropped.png"
              alt="ADYK ZUOG"
              fill
              priority={priority}
              className="object-contain object-left"
              sizes="200px"
            />
          </div>
        </div>
      ) : (
        /* Main transparent/clean background variant: Direct cropped logo without tiny box or border */
        <div className="flex items-center gap-3">
          <div className={`relative ${sizeConfig.containerClass} shrink-0`}>
            <Image
              src="/adyk-zuog-logo-cropped.png"
              alt="ADYK ZUOG — Compliance, Simplified."
              fill
              priority={priority}
              className="object-contain object-left"
              sizes="(max-width: 768px) 150px, 200px"
            />
          </div>
          {withTagline && (
            <div className="hidden lg:flex flex-col border-l border-slate-200 pl-3 py-0.5">
              <span className="text-[11px] font-bold tracking-wider text-teal-800 uppercase leading-none font-sans">
                Compliance, Simplified.
              </span>
              <span className="text-[10px] text-slate-500 font-normal tracking-normal mt-1 leading-none">
                Vendor Compliance Platform
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center hover:opacity-95 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1E3B] rounded-md"
        aria-label="ADYK ZUOG Home"
      >
        {content}
      </Link>
    );
  }

  return content;
});
