import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, Home, Sparkles } from 'lucide-react';

export const UIPageHeader = ({
  module = 'UI Interface',
  category = 'Base UI',
  breadcrumbs,
  title,
  description,
  badge = 'Interactive Demo',
  actions,
}) => {
  return (
    <div className="mb-6 pb-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
      <div>
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-1.5" aria-label="Breadcrumb">
          <NavLink to="/app/dashboard" className="hover:text-slate-800 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </NavLink>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          
          {breadcrumbs && breadcrumbs.length > 0 ? (
            breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                {b.path ? (
                  <NavLink to={b.path} className="hover:text-slate-800 text-slate-600 font-medium">
                    {b.label}
                  </NavLink>
                ) : (
                  <span className={idx === breadcrumbs.length - 1 ? 'text-teal-600 font-semibold' : 'text-slate-600 font-medium'}>
                    {b.label}
                  </span>
                )}
              </React.Fragment>
            ))
          ) : (
            <>
              <span className="text-slate-600 font-medium">{module}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-600">{category}</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-teal-600 font-semibold">{title}</span>
            </>
          )}
        </nav>

        {/* Page Title & Badges */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/80">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>{badge}</span>
            </span>
          )}
        </div>

        {description && <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">{description}</p>}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
};

export default UIPageHeader;
