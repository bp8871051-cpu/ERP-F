import React from 'react';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  ShoppingCart,
  Truck,
  AlertTriangle,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

export const QuickActionsToolbar = ({
  onAddProduct,
  onStockIn,
  onStockOut,
  onStockTransfer,
  onCreatePO,
  onAddSupplier,
  onViewLowStock,
  onViewReports,
}) => {
  const actions = [
    {
      title: '+ Add Product',
      desc: 'Register new SKU in catalog',
      icon: Plus,
      cardBg: 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200/80 hover:border-emerald-300',
      iconBg: 'bg-emerald-600 text-white',
      textColor: 'text-emerald-950',
      descColor: 'text-emerald-800/80',
      onClick: onAddProduct,
    },
    {
      title: '+ Stock In',
      desc: 'Receive inbound inventory',
      icon: ArrowDownLeft,
      cardBg: 'bg-teal-50/60 hover:bg-teal-50 border-teal-200/80 hover:border-teal-300',
      iconBg: 'bg-[#0F9D8A] text-white',
      textColor: 'text-teal-950',
      descColor: 'text-teal-800/80',
      onClick: onStockIn,
    },
    {
      title: '- Stock Out',
      desc: 'Deduct or write-off stock',
      icon: ArrowUpRight,
      cardBg: 'bg-rose-50/60 hover:bg-rose-50 border-rose-200/80 hover:border-rose-300',
      iconBg: 'bg-rose-600 text-white',
      textColor: 'text-rose-950',
      descColor: 'text-rose-800/80',
      onClick: onStockOut,
    },
    {
      title: 'Stock Transfer',
      desc: 'Inter-warehouse movement',
      icon: ArrowRightLeft,
      cardBg: 'bg-indigo-50/60 hover:bg-indigo-50 border-indigo-200/80 hover:border-indigo-300',
      iconBg: 'bg-indigo-600 text-white',
      textColor: 'text-indigo-950',
      descColor: 'text-indigo-800/80',
      onClick: onStockTransfer,
    },
    {
      title: 'Create Purchase Order',
      desc: 'Procure items from vendor',
      icon: ShoppingCart,
      cardBg: 'bg-blue-50/60 hover:bg-blue-50 border-blue-200/80 hover:border-blue-300',
      iconBg: 'bg-[#2563EB] text-white',
      textColor: 'text-blue-950',
      descColor: 'text-blue-800/80',
      onClick: onCreatePO,
    },
    {
      title: 'Add Supplier',
      desc: 'Onboard vendor partner',
      icon: Truck,
      cardBg: 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300',
      iconBg: 'bg-[#162B53] text-white',
      textColor: 'text-slate-950',
      descColor: 'text-slate-600',
      onClick: onAddSupplier,
    },
    {
      title: 'View Low Stock',
      desc: 'Inspect shortage alerts',
      icon: AlertTriangle,
      cardBg: 'bg-amber-50/60 hover:bg-amber-50 border-amber-200/80 hover:border-amber-300',
      iconBg: 'bg-[#F59E0B] text-white',
      textColor: 'text-amber-950',
      descColor: 'text-amber-800/80',
      onClick: onViewLowStock,
    },
    {
      title: 'Inventory Reports',
      desc: 'Valuation & audit export',
      icon: FileSpreadsheet,
      cardBg: 'bg-purple-50/60 hover:bg-purple-50 border-purple-200/80 hover:border-purple-300',
      iconBg: 'bg-purple-600 text-white',
      textColor: 'text-purple-950',
      descColor: 'text-purple-800/80',
      onClick: onViewReports,
    },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB]/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F9D8A] flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#172033] tracking-tight">
              Quick Actions
            </h2>
            <p className="text-xs text-[#64748B]">
              Standard inventory operational shortcuts and transaction workflows
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 8 Actions: Responsive 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              key={index}
              onClick={act.onClick}
              className={`p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all duration-150 hover:shadow-sm active:scale-98 cursor-pointer group ${act.cardBg}`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${act.iconBg}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`font-bold text-xs sm:text-sm tracking-tight leading-snug ${act.textColor}`}
                >
                  {act.title}
                </div>
                <div
                  className={`text-[11px] sm:text-xs mt-0.5 leading-tight ${act.descColor}`}
                >
                  {act.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsToolbar;
