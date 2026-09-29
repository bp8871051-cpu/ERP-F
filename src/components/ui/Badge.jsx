import React from 'react';

const variantClasses = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
  info: 'bg-blue-50 text-blue-700 border-blue-200/60',
  teal: 'bg-teal-50 text-teal-700 border-teal-200/60',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  navy: 'bg-slate-800 text-slate-100 border-slate-700',
};

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const color = variantClasses[variant] || variantClasses.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${color} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success' ? 'bg-emerald-500' :
            variant === 'warning' ? 'bg-amber-500' :
            variant === 'danger' ? 'bg-rose-500' :
            variant === 'teal' ? 'bg-teal-500' :
            variant === 'info' ? 'bg-blue-500' : 'bg-slate-400'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
