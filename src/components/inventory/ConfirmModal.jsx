import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../ui/Button';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  summary = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  variant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

            {/* Optional Summary Box */}
            {summary && (
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2 text-xs">
                {Object.entries(summary).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{key}:</span>
                    <span className="text-slate-800 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/80 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'teal'}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
