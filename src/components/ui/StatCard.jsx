import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  change,
  isPositive = true,
  changeLabel = 'vs last month',
  icon: Icon,
  iconColor = 'text-teal-600',
  iconBg = 'bg-teal-50',
  subtitle,
}) => {
  return (
    <div className="erp-card erp-card-hover p-5 bg-white border border-slate-200/80 rounded-xl relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change !== undefined || subtitle) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {change !== undefined && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${
                isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {change}
            </span>
          )}
          <span className="text-slate-500">{subtitle || changeLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
