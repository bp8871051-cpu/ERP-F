import React from 'react';
import { AlertOctagon, Eye, Percent, ArrowRightLeft, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DeadStock = ({ deadStock = [], onAdjustStock, onTransferStock }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-rose-200/80 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            Dead Stock Alert (Stagnant Inventory)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SKUs without any customer sales for 30, 60, or 90+ days tying up working capital
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md border border-rose-200/60">
          Liquidation Required
        </span>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3 text-right">Stagnant Stock</th>
              <th className="py-2.5 px-3 text-right">Tied Capital</th>
              <th className="py-2.5 px-3">Last Recorded Sale</th>
              <th className="py-2.5 px-3 text-center">Days Inactive</th>
              <th className="py-2.5 px-3 text-right">Recommended Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deadStock.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  <span className="truncate max-w-[180px] block">{item.name}</span>
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                  {item.stock} Units
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                  ₹{item.value?.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-slate-500">{item.last_sale}</td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.days_without_sale >= 90
                        ? 'bg-rose-100 text-rose-800'
                        : item.days_without_sale >= 60
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.days_without_sale} Days
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/app/inventory/products/${item.id}`)}
                      title="View Product"
                      className="p-1 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onTransferStock && onTransferStock(item)}
                      title="Transfer to active hub"
                      className="p-1 text-sky-600 hover:text-sky-700 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdjustStock && onAdjustStock(item)}
                      title="Adjust or write off"
                      className="p-1 text-amber-600 hover:text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeadStock;
