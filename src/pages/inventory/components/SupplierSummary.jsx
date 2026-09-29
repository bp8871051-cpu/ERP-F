import React from 'react';
import { Truck, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SupplierSummary = ({ suppliers = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-4 h-4 text-teal-600" />
            Top Procurement Suppliers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key vendor fulfillment volume, active commitments & procurement value
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/inventory/suppliers')}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
        >
          <span>All Suppliers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">Supplier Name</th>
              <th className="py-2.5 px-3 text-right">Products Supplied</th>
              <th className="py-2.5 px-3 text-right">Total Purchase Value</th>
              <th className="py-2.5 px-3 text-center">Pending Orders</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((sup) => (
              <tr
                key={sup.id}
                onClick={() => navigate(`/app/inventory/suppliers/${sup.id}`)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[10px] font-bold text-teal-700 shrink-0">
                    {sup.name.charAt(0)}
                  </span>
                  <span className="truncate max-w-[190px]">{sup.name}</span>
                </td>
                <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                  {sup.products_supplied} Products
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                  ₹{sup.purchase_value?.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                    {sup.pending_orders} Orders
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Active
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

export default SupplierSummary;
