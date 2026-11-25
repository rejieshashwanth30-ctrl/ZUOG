'use client';

import React, { useEffect, useRef } from 'react';

/**
 * GPU-accelerated scroll progress bar that operates strictly on the compositor thread
 * via `transform: scaleX(...)` and `requestAnimationFrame`.
 * Never triggers React re-renders on the parent page during scroll.
 */
export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const updateScroll = () => {
      const totalScroll = window.scrollY || document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0 && barRef.current) {
        const progress = Math.min(1, Math.max(0, totalScroll / windowHeight));
        barRef.current.style.transform = `scaleX(${progress})`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    // Passive listener for 60fps / 120fps smooth scrolling
    window.addEventListener('scroll', onScroll, { passive: true });
    updateScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-[#00A878] z-50 pointer-events-none origin-left"
      style={{
        transform: 'scaleX(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    />
  );
}
