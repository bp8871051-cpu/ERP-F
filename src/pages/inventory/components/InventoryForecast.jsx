import React from 'react';
import { CalendarClock, AlertTriangle, ArrowRight } from 'lucide-react';

export const InventoryForecast = ({ forecasts = [], onOrderClick }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-teal-600" />
            AI & Run-Rate Inventory Stockout Forecast
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive depletion velocity and calculated lead-time reorder recommendations
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md border border-teal-100">
          Run-Rate Predictive Model
        </span>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3 text-right">Current Stock</th>
              <th className="py-2.5 px-3 text-right">Avg Daily Sales</th>
              <th className="py-2.5 px-3 text-center">Days Remaining</th>
              <th className="py-2.5 px-3 text-center">Predicted Stockout</th>
              <th className="py-2.5 px-3 text-right">Recommended Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {forecasts.map((fc) => (
              <tr key={fc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  <span className="truncate max-w-[200px] block">{fc.product}</span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                  {fc.current_stock}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                  {fc.daily_sales} / day
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                      fc.days_remaining <= 10
                        ? 'bg-rose-100 text-rose-800'
                        : fc.days_remaining <= 20
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {fc.days_remaining} Days
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-700 font-semibold">
                  {fc.predicted_stockout}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOrderClick && onOrderClick(fc)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200/80 rounded-md hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    <span>Order {fc.recommended_order} Units</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryForecast;
