import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DEFAULT_COLORS = [
  '#0F8B7A', '#2563EB', '#7C3AED', '#DB2777', '#EA580C',
  '#D97706', '#059669', '#0891B2', '#4F46E5', '#9333EA',
  '#C026D3', '#E11D48', '#0284C7', '#16A34A', '#CA8A04',
  '#1E293B', '#64748B', '#14B8A6', '#3B82F6', '#8B5CF6',
];

export const DonutMetricChart = ({
  data = [],
  nameKey = 'name',
  dataKey = 'value',
  height = 280,
  chartHeight = 190,
  innerRadius = 55,
  outerRadius = 80,
  colors = DEFAULT_COLORS,
  showLegend = true,
  legendMaxHeight = 'max-h-48',
  showTotal = true,
}) => {
  const totalValue = data.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div style={{ width: '100%', height: chartHeight }} className="relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || colors[index % colors.length]}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} (${totalValue > 0 ? Math.round((value / totalValue) * 100) : 0}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {showTotal && totalValue > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-800 leading-none">{totalValue}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Total</span>
          </div>
        )}
      </div>

      {showLegend && data.length > 0 && (
        <div
          className={`w-full mt-3 pt-3 border-t border-slate-100 ${
            data.length > 5
              ? `${legendMaxHeight} overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 pb-2`
              : 'flex flex-wrap justify-center gap-x-4 gap-y-2 pb-1'
          }`}
        >
          {data.map((item, index) => {
            const itemColor = item.color || colors[index % colors.length];
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-2 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors group cursor-default"
                title={`${item[nameKey]}: ${item[dataKey]}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: itemColor }}
                  />
                  <span className="text-xs font-medium text-slate-700 truncate group-hover:text-slate-900">
                    {item[nameKey]}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-500 tabular-nums shrink-0 ml-1.5">
                  {item[dataKey]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DonutMetricChart;
