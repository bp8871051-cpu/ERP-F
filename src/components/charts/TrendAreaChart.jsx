import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const TrendAreaChart = ({
  data = [],
  dataKeyX = 'month',
  series = [
    { key: 'revenue', name: 'Revenue', color: '#0F8B7A' },
    { key: 'expenses', name: 'Expenses', color: '#1E293B' },
  ],
  height = 280,
  formatY = (val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`,
}) => {
  return (
    <div style={{ width: '100%', height }} className="select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey={dataKeyX}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11 }}
            tickFormatter={formatY}
            dx={-4}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
              fontSize: '12px',
            }}
            formatter={(value, name) => [
              typeof value === 'number' && value > 100 ? `$${value.toLocaleString()}` : value,
              name,
            ]}
          />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#grad-${s.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendAreaChart;
