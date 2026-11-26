import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgStyles = {
    success: 'border-emerald-200 bg-white shadow-emerald-500/10',
    error: 'border-rose-200 bg-white shadow-rose-500/10',
    info: 'border-blue-200 bg-white shadow-blue-500/10'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
          bgStyles[toast.type] || bgStyles.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <span className="text-sm font-medium text-slate-800">{toast.message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
