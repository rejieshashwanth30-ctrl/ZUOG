'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * Shared singleton IntersectionObserver for all reveal sections.
 * Observes each element once, triggers CSS visibility on entry, then disconnects immediately.
 * Zero ongoing scroll polling, zero continuous calculations.
 */
let sharedObserver: IntersectionObserver | null = null;
const observerCallbacks = new Map<Element, () => void>();

function getSharedObserver() {
  if (typeof window === 'undefined') return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cb = observerCallbacks.get(entry.target);
            if (cb) {
              cb();
              observerCallbacks.delete(entry.target);
            }
            sharedObserver?.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.08 }
    );
  }
  return sharedObserver;
}

export function ScrollReveal({
  children,
  className = '',
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = getSharedObserver();
    if (!observer) {
      setIsVisible(true);
      return;
    }

    observerCallbacks.set(element, () => {
      if (delayMs > 0) {
        setTimeout(() => setIsVisible(true), delayMs);
      } else {
        setIsVisible(true);
      }
    });

    observer.observe(element);

    return () => {
      observerCallbacks.delete(element);
      observer.unobserve(element);
    };
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      } ${className}`}
      style={{
        willChange: isVisible ? 'auto' : 'opacity, transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </div>
  );
}
