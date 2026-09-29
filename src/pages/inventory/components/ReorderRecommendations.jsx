import React from 'react';
import { ShoppingCart, Sparkles } from 'lucide-react';

export const ReorderRecommendations = ({ recommendations = [], onCreatePO }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Automated Reorder Recommendations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            System generated purchase requisitions based on reorder points and sales velocity
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md border border-teal-100">
          Smart Purchasing
        </span>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3 text-right">Current Stock</th>
              <th className="py-2.5 px-3 text-right">Reorder Level</th>
              <th className="py-2.5 px-3 text-right">Avg Sales</th>
              <th className="py-2.5 px-3 text-right">Recommended Qty</th>
              <th className="py-2.5 px-3">Preferred Supplier</th>
              <th className="py-2.5 px-3 text-right">Estimated Cost</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recommendations.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  <span className="truncate max-w-[180px] block">{rec.product}</span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                  {rec.current_stock}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                  {rec.reorder_level}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-500">
                  {rec.avg_sales} / day
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-teal-700">
                  {rec.recommended_qty} Units
                </td>
                <td className="py-2.5 px-3 text-slate-700 font-medium">{rec.supplier}</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                  ₹{rec.estimated_cost?.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onCreatePO && onCreatePO(rec)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Create PO</span>
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

export default ReorderRecommendations;
