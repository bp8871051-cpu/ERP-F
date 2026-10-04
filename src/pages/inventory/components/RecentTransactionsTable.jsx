import React from 'react';
import { History, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Sliders, RefreshCw } from 'lucide-react';

export const RecentTransactionsTable = ({ transactions = [] }) => {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Stock In':
      case 'Purchase':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownLeft className="w-3 h-3" />
            {type}
          </span>
        );
      case 'Stock Out':
      case 'Sale':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <ArrowUpRight className="w-3 h-3" />
            {type}
          </span>
        );
      case 'Transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ArrowRightLeft className="w-3 h-3" />
            Transfer
          </span>
        );
      case 'Adjustment':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Sliders className="w-3 h-3" />
            Adjustment
          </span>
        );
      case 'Return':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <RefreshCw className="w-3 h-3" />
            Return
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            {type}
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {status}
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
      case 'Cancelled':
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            {status || 'Completed'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB]/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#172033] tracking-tight">
              Recent Inventory Transactions
            </h2>
            <p className="text-xs text-[#64748B]">
              Real-time audit log of stock-ins, sales deductions, transfers and warehouse adjustments
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F7F8FA] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              <th className="py-3 px-4 rounded-l-lg">Date & Time</th>
              <th className="py-3 px-3">Transaction ID</th>
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3 text-right">Quantity</th>
              <th className="py-3 px-3">Warehouse</th>
              <th className="py-3 px-3">User</th>
              <th className="py-3 px-4 text-center rounded-r-lg">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]/70 text-xs">
            {transactions && transactions.length > 0 ? (
              transactions.map((txn) => {
                const isNegative = String(txn.formatted_quantity || txn.quantity).startsWith('-');
                return (
                  <tr
                    key={txn.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Date */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#172033]">{txn.date}</div>
                      <div className="text-[10px] text-slate-400">{txn.time}</div>
                    </td>

                    {/* Transaction ID */}
                    <td className="py-3 px-3 font-mono font-bold text-[#162B53] text-[11px]">
                      {txn.transaction_id || `TXN-${txn.id}`}
                    </td>

                    {/* Product */}
                    <td className="py-3 px-3 font-medium text-slate-800 line-clamp-1 max-w-[200px]">
                      {txn.product}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3">
                      {getTypeBadge(txn.type)}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          isNegative
                            ? 'text-rose-600'
                            : 'text-emerald-700'
                        }
                      >
                        {txn.formatted_quantity || (txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity)}
                      </span>
                    </td>

                    {/* Warehouse */}
                    <td className="py-3 px-3 text-slate-600">
                      {txn.warehouse || 'Main Warehouse'}
                    </td>

                    {/* User */}
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {txn.user || 'Administrator'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(txn.status)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="py-6 text-center text-slate-500">
                  No inventory transactions recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactionsTable;
