import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-200/80 rounded ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs flex flex-col justify-between h-32">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3.5 w-32" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-zinc-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}
