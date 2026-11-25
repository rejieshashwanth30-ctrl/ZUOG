'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleClose = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const displayText = message || description || 'This action cannot be undone.';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center pt-2 text-slate-900">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed max-w-xs">{displayText}</p>
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
