import React from 'react';
import {
  Package,
  Boxes,
  IndianRupee,
  AlertTriangle,
  AlertOctagon,
  Warehouse,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// Mini SVG Sparkline
const MiniSparkline = ({ data = [], color = '#0F9D8A', height = 28, width = 80 }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 6) + 3;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const InventoryKPICards = ({ kpi = {}, onCardClick }) => {
  const cards = [
    {
      key: 'total_products',
      label: 'TOTAL PRODUCTS',
      value: kpi?.total_products?.formatted_value ?? (kpi?.total_products?.value != null ? Number(kpi?.total_products?.value).toLocaleString() : '116'),
      trend: kpi?.total_products?.trend_pct ? `${kpi?.total_products?.trend_pct}%` : '+8.4%',
      trendDirection: kpi?.total_products?.trend_direction || 'up',
      comparison: kpi?.total_products?.comparison_text || 'vs last month',
      sparkline: kpi?.total_products?.sparkline || [98, 102, 106, 110, 112, 114, 116],
      icon: Package,
      iconBg: 'bg-[#162B53]/10 text-[#162B53]',
      sparkColor: '#0F9D8A',
      isPositive: true,
    },
    {
      key: 'total_stock_units',
      label: 'TOTAL STOCK UNITS',
      value: kpi?.total_stock_units?.formatted_value ?? (kpi?.total_stock_units?.value != null ? Number(kpi?.total_stock_units?.value).toLocaleString() : '70,372'),
      trend: kpi?.total_stock_units?.trend_pct ? `${kpi?.total_stock_units?.trend_pct}%` : '+5.2%',
      trendDirection: kpi?.total_stock_units?.trend_direction || 'up',
      comparison: kpi?.total_stock_units?.comparison_text || 'vs last month',
      sparkline: kpi?.total_stock_units?.sparkline || [61200, 63400, 65900, 68100, 69400, 70372],
      icon: Boxes,
      iconBg: 'bg-[#0F9D8A]/10 text-[#0F9D8A]',
      sparkColor: '#0F9D8A',
      isPositive: true,
    },
    {
      key: 'inventory_value',
      label: 'INVENTORY VALUE',
      value: kpi?.inventory_value?.formatted_value || '₹72.45 Cr',
      trend: kpi?.inventory_value?.trend_pct ? `${kpi?.inventory_value?.trend_pct}%` : '+7.8%',
      trendDirection: kpi?.inventory_value?.trend_direction || 'up',
      comparison: kpi?.inventory_value?.comparison_text || 'vs last month',
      sparkline: kpi?.inventory_value?.sparkline || [64.2, 66.8, 68.1, 70.4, 71.8, 72.4],
      icon: IndianRupee,
      iconBg: 'bg-blue-50 text-blue-700',
      sparkColor: '#2563EB',
      isPositive: true,
    },
    {
      key: 'low_stock_items',
      label: 'LOW STOCK ITEMS',
      value: kpi?.low_stock_items?.formatted_value ?? (kpi?.low_stock_items?.value != null ? String(kpi?.low_stock_items?.value) : '0'),
      trend: kpi?.low_stock_items?.trend_pct ? `${kpi?.low_stock_items?.trend_pct}%` : '-12.5%',
      trendDirection: kpi?.low_stock_items?.trend_direction || 'down',
      comparison: kpi?.low_stock_items?.comparison_text || 'vs last month',
      sparkline: kpi?.low_stock_items?.sparkline || [12, 9, 7, 5, 4, 0],
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600',
      sparkColor: '#F59E0B',
      isPositive: false,
    },
    {
      key: 'out_of_stock',
      label: 'OUT OF STOCK',
      value: kpi?.out_of_stock?.formatted_value ?? (kpi?.out_of_stock?.value != null ? String(kpi?.out_of_stock?.value) : '2'),
      trend: kpi?.out_of_stock?.trend_pct ? `${kpi?.out_of_stock?.trend_pct}%` : '+2',
      trendDirection: kpi?.out_of_stock?.trend_direction || 'down',
      comparison: kpi?.out_of_stock?.comparison_text || 'vs last month',
      sparkline: kpi?.out_of_stock?.sparkline || [5, 4, 3, 3, 2, 2],
      icon: AlertOctagon,
      iconBg: 'bg-red-50 text-red-600',
      sparkColor: '#DC2626',
      isPositive: false,
    },
    {
      key: 'warehouse_utilization',
      label: 'WAREHOUSE UTILIZATION',
      value: kpi?.warehouse_utilization?.formatted_value || `${kpi?.warehouse_utilization?.value || 91.4}%`,
      trend: kpi?.warehouse_utilization?.trend_pct ? `${kpi?.warehouse_utilization?.trend_pct}%` : '+3.2%',
      trendDirection: kpi?.warehouse_utilization?.trend_direction || 'up',
      comparison: kpi?.warehouse_utilization?.comparison_text || 'vs last month',
      sparkline: kpi?.warehouse_utilization?.sparkline || [82.4, 84.1, 86.8, 88.5, 90.1, 91.4],
      icon: Warehouse,
      iconBg: 'bg-indigo-50 text-indigo-700',
      sparkColor: '#6366F1',
      isPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const isUp = card.trendDirection === 'up';

        return (
          <div
            key={card.key}
            onClick={() => onCardClick && onCardClick(card.key)}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-mono">
                {card.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${card.iconBg}`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            {/* Middle: Big Value */}
            <div className="my-2.5">
              <div className="text-2xl xl:text-[26px] font-bold text-[#172033] tracking-tight">
                {card.value}
              </div>
            </div>

            {/* Bottom: Trend, Comparison & Sparkline */}
            <div className="flex items-end justify-between gap-2 pt-2 border-t border-[#E5E7EB]/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                  {isUp ? (
                    <TrendingUp
                      className={`w-3.5 h-3.5 ${
                        card.isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    />
                  ) : (
                    <TrendingDown
                      className={`w-3.5 h-3.5 ${
                        card.isPositive ? 'text-emerald-600' : 'text-emerald-600'
                      }`}
                    />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      card.isPositive
                        ? 'text-emerald-600'
                        : card.key === 'low_stock_items' || card.key === 'out_of_stock'
                        ? 'text-slate-600'
                        : 'text-red-600'
                    }`}
                  >
                    {isUp ? '↑' : '↓'} {card.trend}
                  </span>
                </div>
                <div className="text-[10px] text-[#64748B] font-medium">
                  {card.comparison}
                </div>
              </div>

              {/* Sparkline Graph */}
              <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                <MiniSparkline
                  data={card.sparkline}
                  color={card.sparkColor}
                  height={26}
                  width={68}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryKPICards;
