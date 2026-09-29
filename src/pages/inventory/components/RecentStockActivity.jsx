import React from 'react';
import {
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  ArrowRightLeft,
  RotateCcw,
} from 'lucide-react';

export const RecentStockActivity = ({ activities = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Recent Stock Activity & Transactions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit log of inventory increments, deductions, adjustments & transfers
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          Live Audit Stream
        </span>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3">Transaction Type</th>
              <th className="py-2.5 px-3">Warehouse</th>
              <th className="py-2.5 px-3 text-right">Quantity</th>
              <th className="py-2.5 px-3">Reference</th>
              <th className="py-2.5 px-3">Performed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.map((act) => {
              const isPositive = String(act.quantity).startsWith('+') || Number(act.quantity) > 0;
              const typeBadge =
                act.type === 'Stock Added' || act.type === 'Purchase Received' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    <ArrowDownLeft className="w-3 h-3" />
                    {act.type}
                  </span>
                ) : act.type === 'Sales Deduction' || act.type === 'Stock Removed' ? (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
                    <ArrowUpRight className="w-3 h-3" />
                    {act.type}
                  </span>
                ) : act.type === 'Stock Adjustment' ? (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                    <Sliders className="w-3 h-3" />
                    {act.type}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sky-700 font-medium bg-sky-50 px-2 py-0.5 rounded border border-sky-200/60">
                    <ArrowRightLeft className="w-3 h-3" />
                    {act.type}
                  </span>
                );

              return (
                <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {act.time}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{act.product}</td>
                  <td className="py-2.5 px-3">{typeBadge}</td>
                  <td className="py-2.5 px-3 text-slate-600">{act.warehouse}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {act.quantity}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {act.reference}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{act.user}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentStockActivity;
