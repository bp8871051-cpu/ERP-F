import React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  XCircle,
  Warehouse,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const InventoryKPICards = ({ kpi, onCardClick }) => {
  if (!kpi) return null;

  const cards = [
    {
      id: 'total_products',
      title: 'TOTAL PRODUCTS',
      value: kpi.total_products?.value?.toLocaleString() || '1,284',
      change: kpi.total_products?.change || '+8.4%',
      label: kpi.total_products?.label || 'Active Products',
      isPositive: true,
      icon: Package,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-100',
      sparkline: [20, 24, 28, 25, 32, 38, 42],
    },
    {
      id: 'total_stock_units',
      title: 'TOTAL STOCK UNITS',
      value: kpi.total_stock_units?.value?.toLocaleString() || '24,860',
      change: kpi.total_stock_units?.change || '+5.2%',
      label: kpi.total_stock_units?.label || 'Units Available',
      isPositive: true,
      icon: Boxes,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50 border-teal-100',
      sparkline: [120, 135, 128, 142, 150, 165, 178],
    },
    {
      id: 'inventory_value',
      title: 'INVENTORY VALUE',
      value: kpi.inventory_value?.formatted || '₹48.6L',
      change: kpi.inventory_value?.change || '+7.8%',
      label: kpi.inventory_value?.label || 'Current Stock Value',
      isPositive: true,
      icon: IndianRupee,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-100',
      sparkline: [32, 35, 38, 41, 44, 46, 48.6],
    },
    {
      id: 'low_stock_items',
      title: 'LOW STOCK ITEMS',
      value: kpi.low_stock_items?.value?.toLocaleString() || '42',
      change: kpi.low_stock_items?.change || '-12.5%',
      label: kpi.low_stock_items?.label || 'Need Reorder',
      isPositive: false, // low stock count drop is good
      isAlert: true,
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-100',
      sparkline: [58, 52, 49, 45, 46, 44, 42],
      actionHint: 'Click to view',
    },
    {
      id: 'out_of_stock',
      title: 'OUT OF STOCK',
      value: kpi.out_of_stock?.value?.toLocaleString() || '18',
      change: kpi.out_of_stock?.change || '+4',
      label: kpi.out_of_stock?.label || 'Products unavailable',
      isPositive: false,
      isDanger: true,
      icon: XCircle,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 border-rose-100',
      sparkline: [12, 14, 15, 13, 16, 17, 18],
    },
    {
      id: 'warehouse_utilization',
      title: 'WAREHOUSE UTILIZATION',
      value: kpi.warehouse_utilization?.formatted || '76.4%',
      change: kpi.warehouse_utilization?.change || '+3.2%',
      label: kpi.warehouse_utilization?.label || 'Across all warehouses',
      isPositive: true,
      icon: Warehouse,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50 border-sky-100',
      sparkline: [68, 70, 72, 73, 75, 75.8, 76.4],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => onCardClick && onCardClick(card.id)}
            className={`bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
              card.isAlert
                ? 'hover:border-amber-300'
                : card.isDanger
                ? 'hover:border-rose-300'
                : 'hover:border-teal-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>

              {/* Sparkline Visual Simulation */}
              <div className="flex items-end gap-0.5 h-5 opacity-70 group-hover:opacity-100 transition-opacity">
                {card.sparkline.map((val, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${Math.max(20, (val / Math.max(...card.sparkline)) * 100)}%`,
                    }}
                    className={`w-1 rounded-t-xs ${
                      card.isDanger
                        ? 'bg-rose-400'
                        : card.isAlert
                        ? 'bg-amber-400'
                        : 'bg-teal-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1">
                {card.change.startsWith('+') ? (
                  <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px]">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {card.change}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-slate-500 font-semibold text-[11px]">
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    {card.change}
                  </span>
                )}
                <span className="text-slate-400 text-[11px] truncate max-w-[90px]">
                  {card.label}
                </span>
              </div>

              {card.actionHint && (
                <span className="text-[10px] font-semibold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {card.actionHint} →
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default InventoryKPICards;
