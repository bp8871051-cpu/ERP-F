import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';

export const StockMovementChart = ({ movementData = [] }) => {
  const [filter, setFilter] = useState('1Y');

  const filterOptions = [
    { key: '7D', label: '7 Days' },
    { key: '30D', label: '30 Days' },
    { key: '3M', label: '3 Months' },
    { key: '6M', label: '6 Months' },
    { key: '1Y', label: '1 Year' },
  ];

  // Slice data based on filter
  let displayData = movementData;
  if (filter === '7D') displayData = movementData.slice(-3);
  else if (filter === '30D') displayData = movementData.slice(-4);
  else if (filter === '3M') displayData = movementData.slice(-3);
  else if (filter === '6M') displayData = movementData.slice(-6);

  const totalIn = displayData.reduce((acc, d) => acc + (d.stock_in || 0), 0);
  const totalOut = displayData.reduce((acc, d) => acc + (d.stock_out || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Stock Movement & Velocity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare monthly stock additions, dispatches, opening & closing balances
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                filter === opt.key
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Stock In</span>
          <p className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            +{totalIn.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Stock Out</span>
          <p className="text-sm font-bold text-rose-600 mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            -{totalOut.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Net Movement</span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {(totalIn - totalOut > 0 ? '+' : '') + (totalIn - totalOut).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Closing Balance</span>
          <p className="text-sm font-bold text-teal-700 mt-0.5">
            {displayData[displayData.length - 1]?.closing_stock?.toLocaleString() || '18,500'}
          </p>
        </div>
      </div>

      {/* Area Chart */}
      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorStockOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorClosing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F766E" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-800">
                      <p className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                        Month: {label}
                      </p>
                      <p className="text-emerald-400">
                        Stock In: +{payload.find((p) => p.dataKey === 'stock_in')?.value?.toLocaleString()}
                      </p>
                      <p className="text-rose-400">
                        Stock Out: -{payload.find((p) => p.dataKey === 'stock_out')?.value?.toLocaleString()}
                      </p>
                      <p className="text-teal-300 font-semibold border-t border-slate-700 pt-1">
                        Closing Stock: {payload.find((p) => p.dataKey === 'closing_stock')?.value?.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
            />
            <Area
              type="monotone"
              name="Stock In"
              dataKey="stock_in"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorStockIn)"
            />
            <Area
              type="monotone"
              name="Stock Out"
              dataKey="stock_out"
              stroke="#F43F5E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorStockOut)"
            />
            <Area
              type="monotone"
              name="Closing Stock"
              dataKey="closing_stock"
              stroke="#0F766E"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorClosing)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockMovementChart;
