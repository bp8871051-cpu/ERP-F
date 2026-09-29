import React from 'react';

export const StockStatusBadge = ({ status, className = '' }) => {
  const norm = String(status || '').toLowerCase().replace(/[\s-]/g, '_');

  let config = {
    label: 'Healthy',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    dot: 'bg-emerald-500',
  };

  if (norm === 'low_stock' || norm === 'low') {
    config = {
      label: 'Low Stock',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      dot: 'bg-amber-500',
    };
  } else if (norm === 'critical') {
    config = {
      label: 'Critical',
      bg: 'bg-orange-50 text-orange-700 border-orange-200/60',
      dot: 'bg-orange-500',
    };
  } else if (norm === 'out_of_stock' || norm === 'out') {
    config = {
      label: 'Out of Stock',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
      dot: 'bg-rose-500',
    };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0 animate-pulse`} />
      <span>{config.label}</span>
    </span>
  );
};

export default StockStatusBadge;
