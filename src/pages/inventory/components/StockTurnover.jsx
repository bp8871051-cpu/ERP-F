import React from 'react';
import { RefreshCw, Zap, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const StockTurnover = ({ turnoverData }) => {
  if (!turnoverData) return null;

  const sections = [
    {
      name: 'Fast Moving',
      count: turnoverData.fast_moving_count || 48,
      desc: 'Stock cycle < 30 days',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
      icon: Zap,
    },
    {
      name: 'Medium Moving',
      count: turnoverData.medium_moving_count || 40,
      desc: 'Stock cycle 30-60 days',
      color: 'text-teal-700 bg-teal-50 border-teal-200/80',
      icon: ShieldCheck,
    },
    {
      name: 'Slow Moving',
      count: turnoverData.slow_moving_count || 18,
      desc: 'Stock cycle 60-90 days',
      color: 'text-amber-700 bg-amber-50 border-amber-200/80',
      icon: Clock,
    },
    {
      name: 'Dead Stock',
      count: turnoverData.dead_stock_count || 8,
      desc: 'No sales for 90+ days',
      color: 'text-rose-700 bg-rose-50 border-rose-200/80',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-teal-600" />
            Inventory Turnover & Velocity Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Turnover ratio and classification of products by stock aging cycles
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200/60">
          <span className="text-xs text-teal-800 font-semibold">Turnover Ratio:</span>
          <span className="text-base font-extrabold text-teal-700">
            {turnoverData.turnover_ratio || '4.8x'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.name}
              className={`p-3.5 rounded-xl border ${sec.color} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">{sec.name}</span>
                <Icon className="w-4 h-4 opacity-80" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black">{sec.count}</span>
                <span className="text-xs ml-1 font-semibold opacity-90">SKUs</span>
                <p className="text-[11px] opacity-75 mt-0.5">{sec.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockTurnover;
