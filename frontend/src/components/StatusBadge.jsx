import React from 'react';

export const StatusBadge = ({ status }) => {
  const styles = {
    OPEN: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    CLOSED: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20'
  };

  const labels = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${
        styles[status] || 'bg-slate-50 text-slate-700 border-slate-200'
      }`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {labels[status] || status}
    </span>
  );
};
