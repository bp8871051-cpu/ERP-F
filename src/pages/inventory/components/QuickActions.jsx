import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackagePlus,
  PlusCircle,
  Sliders,
  ArrowRightLeft,
  ShoppingCart,
  UserPlus,
  AlertTriangle,
  FileBarChart,
} from 'lucide-react';

export const QuickActions = ({
  onAddProduct,
  onAddStock,
  onStockAdjustment,
  onStockTransfer,
  onScrollToReports,
}) => {
  const navigate = useNavigate();

  const actions = [
    {
      label: '+ Add Product',
      icon: PackagePlus,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80 hover:bg-indigo-100',
      action: () => navigate('/app/inventory/products'),
    },
    {
      label: '+ Add Stock',
      icon: PlusCircle,
      color: 'text-teal-600 bg-teal-50 border-teal-200/80 hover:bg-teal-100',
      action: onAddStock,
    },
    {
      label: 'Stock Adjustment',
      icon: Sliders,
      color: 'text-amber-600 bg-amber-50 border-amber-200/80 hover:bg-amber-100',
      action: onStockAdjustment,
    },
    {
      label: 'Stock Transfer',
      icon: ArrowRightLeft,
      color: 'text-sky-600 bg-sky-50 border-sky-200/80 hover:bg-sky-100',
      action: onStockTransfer,
    },
    {
      label: 'Create Purchase Order',
      icon: ShoppingCart,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80 hover:bg-emerald-100',
      action: () => navigate('/app/purchase/orders'),
    },
    {
      label: 'Add Supplier',
      icon: UserPlus,
      color: 'text-purple-600 bg-purple-50 border-purple-200/80 hover:bg-purple-100',
      action: () => navigate('/app/inventory/suppliers'),
    },
    {
      label: 'View Low Stock',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 border-rose-200/80 hover:bg-rose-100',
      action: () => {
        const el = document.getElementById('low-stock-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      label: 'Inventory Reports',
      icon: FileBarChart,
      color: 'text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200',
      action: onScrollToReports,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-800 tracking-tight uppercase">
          Dashboard Quick Actions
        </span>
        <span className="text-[11px] text-slate-400">Shortcuts to key inventory workflows</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              type="button"
              onClick={act.action}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer group shadow-2xs ${act.color}`}
            >
              <Icon className="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110" />
              <span className="text-[11px] font-semibold tracking-tight leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
