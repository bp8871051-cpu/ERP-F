import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ArrowLeftRight, IndianRupee } from 'lucide-react';

export const PurchaseSalesChart = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-teal-600" />
            Purchase vs Sales Valuation (Gross Movement)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Procurement inflow capital vs fulfilled sales revenue output
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          Monthly Comparison
        </span>
      </div>

      <div className="h-64 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
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
                      <p className="text-indigo-400">
                        Purchases: ₹{(payload.find((p) => p.dataKey === 'purchase_value')?.value || 0).toLocaleString()}
                      </p>
                      <p className="text-emerald-400">
                        Sales: ₹{(payload.find((p) => p.dataKey === 'sales_value')?.value || 0).toLocaleString()}
                      </p>
                      <p className="text-teal-300 font-semibold border-t border-slate-700 pt-1">
                        Gross Margin Delta: ₹{(payload[0]?.payload?.gross_movement || 0).toLocaleString()}
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
            <Bar
              dataKey="purchase_value"
              name="Purchases (Inbound)"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
            <Bar
              dataKey="sales_value"
              name="Sales (Outbound)"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PurchaseSalesChart;
