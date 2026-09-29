import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ShieldCheck, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';

export const InventoryHealth = ({ healthData = [] }) => {
  if (!healthData || healthData.length === 0) return null;

  const total = healthData.reduce((acc, item) => acc + (item.count || 0), 0);

  const icons = {
    'Healthy Stock': ShieldCheck,
    'Low Stock': AlertCircle,
    'Critical Stock': AlertTriangle,
    'Out of Stock': XCircle,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Inventory Health Index
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated SKU availability ratio across active inventory
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          {total.toLocaleString()} Total Evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mt-3">
        {/* Donut Chart */}
        <div className="md:col-span-5 h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={healthData}
                cx="50%"
                cy="50%"
                innerRadius={54}
                outerRadius={78}
                paddingAngle={4}
                dataKey="count"
              >
                {healthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg border border-slate-800">
                        <span className="font-semibold">{item.name}</span>: {item.count} items ({item.percentage}%)
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Stat */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {healthData[0]?.percentage || 72}%
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Healthy
            </span>
          </div>
        </div>

        {/* Legend & Breakdown Table */}
        <div className="md:col-span-7 space-y-2.5">
          {healthData.map((item) => {
            const Icon = icons[item.name] || ShieldCheck;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.count.toLocaleString()} SKUs
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">
                    {item.percentage}%
                  </span>
                  <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InventoryHealth;
