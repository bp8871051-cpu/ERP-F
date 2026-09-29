import React from 'react';

export const Card = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = 'p-6',
  headerClassName = 'px-6 py-4 border-b border-slate-100',
  noPadding = false,
}) => {
  return (
    <div className={`erp-card bg-white border border-slate-200/80 rounded-xl overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className={`flex items-center justify-between ${headerClassName}`}>
          <div>
            {title && <h3 className="font-semibold text-slate-900 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : bodyClassName}>
        {children}
      </div>
    </div>
  );
};

export default Card;
