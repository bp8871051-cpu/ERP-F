import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Eye, Sliders, ShoppingCart } from 'lucide-react';

export const LowStockAlerts = ({ alerts = [], onAdjustStock, onCreatePO }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-2xs relative overflow-hidden">
      {/* Top Banner Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Critical & Low Stock Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SKUs operating below required safety stock levels needing immediate procurement
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200/60">
          {alerts.length} Items Require Action
        </span>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">SKU</th>
              <th className="py-2.5 px-3">Warehouse</th>
              <th className="py-2.5 px-3 text-right">Current Stock</th>
              <th className="py-2.5 px-3 text-right">Safety Threshold</th>
              <th className="py-2.5 px-3 text-center">Deficit Status</th>
              <th className="py-2.5 px-3 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((item) => {
              const statusClass =
                item.severity === 'red' || item.status === 'Out of Stock'
                  ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                  : item.severity === 'orange' || item.status === 'Critical'
                  ? 'bg-orange-50 text-orange-700 border-orange-200/60'
                  : 'bg-amber-50 text-amber-700 border-amber-200/60';

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <span className="truncate max-w-[200px] block">{item.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {item.sku}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{item.warehouse}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                    {item.current_stock}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                    {item.minimum_stock}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/app/inventory/products/${item.id}`)}
                        title="View Product"
                        className="p-1 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjustStock && onAdjustStock(item)}
                        title="Adjust Stock"
                        className="p-1 text-amber-600 hover:text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onCreatePO && onCreatePO(item)}
                        title="Create Purchase Order"
                        className="px-2 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 transition-colors flex items-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockAlerts;
