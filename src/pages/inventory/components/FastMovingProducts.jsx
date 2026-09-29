import React from 'react';
import { Zap } from 'lucide-react';

export const FastMovingProducts = ({ products = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            Fast-Moving Products (High Velocity)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Top demand SKUs with rapid replenishment and high sales frequency
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
          High Demand
        </span>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3 text-right">Units Sold</th>
              <th className="py-2.5 px-3 text-right">Current Stock</th>
              <th className="py-2.5 px-3 text-center">Turnover</th>
              <th className="py-2.5 px-3 text-center">Days in Stock</th>
              <th className="py-2.5 px-3 text-center">Velocity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  <span className="truncate max-w-[180px] block">{p.name}</span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                  {p.units_sold} Units
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                  {p.current_stock}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {p.turnover}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-600 font-medium">
                  {p.days_in_stock}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Fast
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FastMovingProducts;
