import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PurchaseOrders = ({ purchaseOrders = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-teal-600" />
            Recent Inbound Purchase Orders
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming stock shipments from verified vendors and procurement schedules
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/purchase/orders')}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
        >
          <span>All Purchase Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">PO Number</th>
              <th className="py-2.5 px-3">Supplier</th>
              <th className="py-2.5 px-3">Target Warehouse</th>
              <th className="py-2.5 px-3 text-right">Items</th>
              <th className="py-2.5 px-3 text-right">Order Amount</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Expected Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchaseOrders.map((po) => {
              const statusColor =
                po.status === 'Received'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : po.status === 'Confirmed'
                  ? 'bg-sky-50 text-sky-700 border-sky-200/60'
                  : po.status === 'Partially Received'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                  : po.status === 'Cancelled'
                  ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                  : 'bg-amber-50 text-amber-700 border-amber-200/60';

              return (
                <tr
                  key={po.id}
                  onClick={() => navigate(`/app/purchase/orders`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {po.po_number}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{po.supplier}</td>
                  <td className="py-2.5 px-3 text-slate-600">{po.warehouse}</td>
                  <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                    {po.items} SKUs
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ₹{po.amount?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                    {po.expected_date}
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

export default PurchaseOrders;
