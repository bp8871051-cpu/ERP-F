import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock, AlertOctagon } from 'lucide-react';

export const AccessDeniedPage = ({ requiredPermission, userRole = 'User' }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-inner">
          <ShieldAlert size={36} />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 mb-3">
            <Lock size={12} /> 403 Forbidden • Access Denied
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Restricted Page
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            You do not have administrative clearance to access this module with your current assigned role.
          </p>
        </div>

        {/* Security context box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-left text-xs font-mono space-y-1.5">
          <div className="flex justify-between text-slate-500">
            <span>Your Role:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{userRole}</span>
          </div>
          {requiredPermission && (
            <div className="flex justify-between text-slate-500">
              <span>Required:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">{requiredPermission}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>Authorization:</span>
            <span className="text-amber-600 dark:text-amber-400">Policy Violation Blocked</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <Home size={14} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
