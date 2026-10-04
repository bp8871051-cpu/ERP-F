import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#162B53] text-white p-3 rounded-xl shadow-xl border border-slate-700/60 text-xs space-y-1">
        <p className="font-semibold flex items-center gap-1.5 text-slate-200">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          {data.name}
        </p>
        <p className="font-mono text-base font-bold text-white">
          {Number(data.value).toLocaleString()} SKUs
        </p>
        <p className="text-[11px] text-slate-400">
          {data.payload.percentage}% of catalog
        </p>
      </div>
    );
  }
  return null;
};

export const StockHealthDonut = ({ stockHealth = {} }) => {
  const segments = stockHealth?.segments || [
    { name: 'In Stock', value: 114, percentage: 98.3, color: '#0F9D8A' },
    { name: 'Low Stock', value: 0, percentage: 0.0, color: '#F59E0B' },
    { name: 'Out of Stock', value: 2, percentage: 1.7, color: '#DC2626' },
  ];

  const totalUnits = stockHealth?.total_units || 70372;

  const inStockData = stockHealth?.in_stock || { count: 114, percentage: 98.3 };
  const lowStockData = stockHealth?.low_stock || { count: 0, percentage: 0.0 };
  const outOfStockData = stockHealth?.out_of_stock || { count: 2, percentage: 1.7 };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB]/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F9D8A] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#172033] tracking-tight">
              Stock Health
            </h3>
            <p className="text-xs text-[#64748B]">
              Real-time ratio across active inventory lines
            </p>
          </div>
        </div>
      </div>

      {/* Donut Chart with Centered Total Units */}
      <div className="relative h-[220px] w-full my-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={segments}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={92}
              paddingAngle={4}
              stroke="none"
            >
              {segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Content: Total Stock Units */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Total Units
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#162B53] tracking-tight">
            {Number(totalUnits).toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Stock
          </span>
        </div>
      </div>

      {/* Bottom Health Distribution Legend */}
      <div className="space-y-2 pt-2 border-t border-[#E5E7EB]/80">
        <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0F9D8A]" />
            <span className="font-medium text-slate-800">In Stock</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-600 font-medium">
              {inStockData.count} SKUs
            </span>
            <span className="font-bold text-[#0F9D8A]">
              {inStockData.percentage}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
            <span className="font-medium text-slate-800">Low Stock</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-600 font-medium">
              {lowStockData.count} SKUs
            </span>
            <span className="font-bold text-[#F59E0B]">
              {lowStockData.percentage}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-50/50">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-[#DC2626]" />
            <span className="font-medium text-slate-800">Out of Stock</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-600 font-medium">
              {outOfStockData.count} SKUs
            </span>
            <span className="font-bold text-[#DC2626]">
              {outOfStockData.percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockHealthDonut;
