import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  variant,
  isLoading = false,
}: ConfirmDialogProps) {
  const handleClose = onCancel || onClose || (() => {});
  const effectiveDestructive = variant ? variant === 'danger' : isDestructive;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <div className="text-center py-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
            effectiveDestructive ? 'bg-red-500/10 text-red-500' : 'bg-[#F52F3A]/10 text-[#F52F3A]'
          }`}
        >
          {effectiveDestructive ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={effectiveDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
