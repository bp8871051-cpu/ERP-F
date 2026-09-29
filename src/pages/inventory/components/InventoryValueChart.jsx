import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DollarSign, IndianRupee } from 'lucide-react';

export const InventoryValueChart = ({ valueTrend = [] }) => {
  if (!valueTrend || valueTrend.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            Inventory Value Trend (Valuation Trajectory)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Purchase valuation vs projected selling value vs active asset valuation
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
          Monthly Asset Growth
        </span>
      </div>

      <div className="h-64 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={valueTrend} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 100000)}L`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-800">
                      <p className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                        {label}
                      </p>
                      <p className="text-emerald-400">
                        Current Stock Value: ₹{(payload.find((p) => p.dataKey === 'current_stock_value')?.value || 0).toLocaleString()}
                      </p>
                      <p className="text-sky-400">
                        Selling Value: ₹{(payload.find((p) => p.dataKey === 'selling_value')?.value || 0).toLocaleString()}
                      </p>
                      <p className="text-slate-400">
                        Purchase Cost: ₹{(payload.find((p) => p.dataKey === 'purchase_value')?.value || 0).toLocaleString()}
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
              wrapperStyle={{ fontSize: '11px' }}
            />
            <Line
              type="monotone"
              name="Current Stock Value"
              dataKey="current_stock_value"
              stroke="#059669"
              strokeWidth={3}
              dot={{ r: 4, fill: '#059669' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              name="Projected Selling Value"
              dataKey="selling_value"
              stroke="#0284C7"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              name="Purchase Valuation"
              dataKey="purchase_value"
              stroke="#64748B"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InventoryValueChart;
