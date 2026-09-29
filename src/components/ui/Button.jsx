import React from 'react';

const variants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-900 active:bg-slate-950',
  teal: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm border border-teal-600 active:bg-teal-800',
  blue: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-blue-600 active:bg-blue-800',
  secondary: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 active:bg-slate-100 shadow-sm',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm border border-rose-600 active:bg-rose-800',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 mr-2 shrink-0" />
      ) : null}

      {children}

      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4 ml-2 shrink-0" />
      )}
    </button>
  );
};

export default Button;
