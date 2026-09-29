import React from 'react';
import { ShoppingCart, ArrowDownRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SalesImpact = ({ salesImpact = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-teal-600" />
            Recent Sales Inventory Impact
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real customer fulfillment orders that triggered automatic stock deductions
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/sales/orders')}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
        >
          <span>All Sales Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">Sales Order</th>
              <th className="py-2.5 px-3">Customer Account</th>
              <th className="py-2.5 px-3 text-right">Products Count</th>
              <th className="py-2.5 px-3 text-right">Stock Deducted</th>
              <th className="py-2.5 px-3">Fulfillment Warehouse</th>
              <th className="py-2.5 px-3 text-right">Order Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {salesImpact.map((item) => (
              <tr
                key={item.id}
                onClick={() => navigate(`/app/sales/orders/${item.id}`)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                  {item.order_number}
                </td>
                <td className="py-2.5 px-3 font-semibold text-slate-800">{item.customer}</td>
                <td className="py-2.5 px-3 text-right text-slate-600">
                  {item.products_count} Items
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-rose-600 flex items-center justify-end gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  -{item.stock_deducted} Units
                </td>
                <td className="py-2.5 px-3 text-slate-600">{item.warehouse}</td>
                <td className="py-2.5 px-3 text-right text-slate-500 font-medium">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesImpact;
