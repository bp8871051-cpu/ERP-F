import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  ServerCrash,
  Wrench,
  Clock,
  ArrowLeft,
  Home,
  RefreshCw,
} from 'lucide-react';

export const SpecialPage = ({ type }) => {
  const configs = {
    'error-404': {
      code: '404',
      badge: 'Page Not Found',
      title: 'Lost in Enterprise Cyberspace',
      description: 'The requested system module, record, or URL endpoint does not exist or has been archived.',
      icon: AlertTriangle,
      color: 'amber',
    },
    'error-500': {
      code: '500',
      badge: 'Internal Server Error',
      title: 'System Exception Encountered',
      description: 'The API server encountered an unexpected error. Our system engineers have been automatically alerted.',
      icon: ServerCrash,
      color: 'rose',
    },
    maintenance: {
      code: '503',
      badge: 'Scheduled Maintenance',
      title: 'Platform Upgrade in Progress',
      description: 'We are performing zero-downtime database optimization and infrastructure updates. Operations will resume shortly.',
      icon: Wrench,
      color: 'teal',
    },
    'coming-soon': {
      code: '2026',
      badge: 'Under Development',
      title: 'Autonomous AI Insights Coming Soon',
      description: 'This next-generation enterprise capability is currently being finalized in our beta sandbox.',
      icon: Clock,
      color: 'sky',
    },
  };

  const current = configs[type] || configs['error-404'];
  const Icon = current.icon;

  return (
    <div className="w-full min-h-[460px] flex items-center justify-center py-10 px-4">
      <div className="max-w-lg w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center mx-auto mb-5 text-teal-600 shadow-xs">
          <Icon className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 mb-2">
          {current.badge}
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          {current.title}
        </h1>

        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
          {current.description}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <NavLink
            to="/app/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </NavLink>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialPage;
