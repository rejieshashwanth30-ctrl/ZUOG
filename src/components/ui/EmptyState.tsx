import React from 'react';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-zinc-200/80 my-4">
      <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mb-3.5 text-zinc-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-5 leading-relaxed">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2.5">
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button size="sm" variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
