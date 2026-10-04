import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { IndianRupee, TrendingUp, ShieldCheck } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#162B53] text-white p-3 rounded-xl shadow-xl border border-slate-700/60 text-xs space-y-1">
        <p className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1">
          {label} Valuation
        </p>
        <p className="font-mono text-sm font-bold text-emerald-400">
          ₹{Number(data.value / 100000).toFixed(1)} Lakhs
        </p>
        {data.payload.growth != null && (
          <p className="text-[11px] text-slate-300">
            Growth: +{data.payload.growth}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

export const InventoryValuationCard = ({ valueStats = {} }) => {
  const currentValue = valueStats?.formatted_current || '₹72.45 Cr';
  const prevValue = valueStats?.formatted_previous || '₹67.20 Cr';
  const growthPct = valueStats?.growth_percentage ?? 7.8;
  const monthlyTrend = valueStats?.monthly_trend || [
    { month: 'May', value: 58000000, previous_value: 54000000, growth: 7.4 },
    { month: 'Jun', value: 61000000, previous_value: 57000000, growth: 7.0 },
    { month: 'Jul', value: 64500000, previous_value: 60500000, growth: 6.6 },
    { month: 'Aug', value: 67200000, previous_value: 63000000, growth: 6.7 },
    { month: 'Sep', value: 70100000, previous_value: 65800000, growth: 6.5 },
    { month: 'Oct', value: 72458482, previous_value: 67200000, growth: 7.8 },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB]/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#172033] tracking-tight">
              Inventory Valuation
            </h3>
            <p className="text-xs text-[#64748B]">
              Real-time capital allocation (Quantity × Purchase / Cost Price)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D8A]" />
          <span>FIFO Asset Accounting</span>
        </div>
      </div>

      {/* Metrics Row: Current, Previous, Growth */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Current Value
          </div>
          <div className="text-lg sm:text-xl font-black text-[#162B53] mt-0.5 tracking-tight">
            {currentValue}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            Previous Value
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-600 mt-0.5 tracking-tight">
            {prevValue}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Net Growth
          </div>
          <div className="flex items-center gap-1 text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">
            <TrendingUp className="w-4 h-4" />
            <span>+{growthPct}%</span>
          </div>
        </div>
      </div>

      {/* Monthly Valuation Bar Chart */}
      <div className="h-[220px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyTrend}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 10000000).toFixed(1)}Cr`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Stock Value"
              fill="#162B53"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InventoryValuationCard;
