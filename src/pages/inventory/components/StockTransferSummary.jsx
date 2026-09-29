import React from 'react';
import { ArrowRightLeft, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StockTransferSummary = ({ summary }) => {
  const navigate = useNavigate();
  if (!summary) return null;

  const cards = [
    {
      label: 'Pending Approval',
      value: summary.pending || 12,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
    },
    {
      label: 'In Transit',
      value: summary.in_transit || 8,
      icon: Truck,
      color: 'text-sky-600',
      bg: 'bg-sky-50 border-sky-100',
    },
    {
      label: 'Completed Transfers',
      value: summary.completed || 156,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Cancelled / Void',
      value: summary.cancelled || 4,
      icon: XCircle,
      color: 'text-slate-500',
      bg: 'bg-slate-50 border-slate-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-teal-600" />
            Inter-Warehouse Stock Transfer Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Logistics status of inventory moving between regional fulfilment centres
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/inventory/stock/transfer')}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
        >
          Transfer Manager →
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              onClick={() => navigate('/app/inventory/stock/transfer')}
              className={`p-3.5 rounded-xl border ${c.bg} flex items-center justify-between cursor-pointer hover:shadow-xs transition-shadow`}
            >
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  {c.label}
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {c.value}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-slate-200/60 shadow-2xs">
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockTransferSummary;
