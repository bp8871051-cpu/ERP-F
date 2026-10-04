import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#162B53] text-white p-3.5 rounded-xl shadow-xl border border-slate-700/60 text-xs space-y-2 min-w-[170px]">
        <p className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1.5">
          {label}
        </p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}:
            </span>
            <span className="font-bold font-mono">
              {Number(item.value).toLocaleString()} Units
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const StockMovementAnalytics = ({
  movementData = [],
  timeframe = '30 Days',
  onTimeframeChange,
}) => {
  const timeframes = ['7 Days', '30 Days', '3 Months', '6 Months', '1 Year'];

  // Calculate totals from movementData
  const totalIn = movementData.reduce((acc, cur) => acc + (cur.stock_in || 0), 0);
  const totalOut = movementData.reduce((acc, cur) => acc + (cur.stock_out || 0), 0);
  const netMovement = totalIn - totalOut;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header: Title, Totals & Timeframe Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB]/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F9D8A]/10 text-[#0F9D8A] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172033] tracking-tight">
                Stock Movement
              </h3>
              <p className="text-xs text-[#64748B]">
                Inbound, outbound inventory throughput and net stock differential
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center gap-1 bg-[#F7F8FA] border border-[#E5E7EB] p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange && onTimeframeChange(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                timeframe === tf
                  ? 'bg-white text-[#162B53] shadow-xs border border-[#E5E7EB]'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Throughput KPI Badges */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Stock In
            </div>
            <div className="text-lg font-bold text-emerald-950 mt-0.5">
              +{totalIn.toLocaleString()}
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Stock Out
            </div>
            <div className="text-lg font-bold text-rose-950 mt-0.5">
              -{totalOut.toLocaleString()}
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Net Movement
            </div>
            <div className="text-lg font-bold text-blue-950 mt-0.5">
              {netMovement >= 0 ? `+${netMovement.toLocaleString()}` : netMovement.toLocaleString()}
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            Δ
          </div>
        </div>
      </div>

      {/* Responsive Recharts Area Chart */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={movementData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F9D8A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0F9D8A" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorStockOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
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
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="stock_in"
              name="Stock In"
              stroke="#0F9D8A"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorStockIn)"
            />
            <Area
              type="monotone"
              dataKey="stock_out"
              name="Stock Out"
              stroke="#DC2626"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorStockOut)"
            />
            <Area
              type="monotone"
              dataKey="net_movement"
              name="Net Movement"
              stroke="#2563EB"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorNet)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockMovementAnalytics;
