import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    LOW: 'bg-slate-100 text-slate-700 border-slate-200',
    MEDIUM: 'bg-sky-50 text-sky-700 border-sky-200',
    HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
    URGENT: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        styles[priority] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {priority}
    </span>
  );
};
