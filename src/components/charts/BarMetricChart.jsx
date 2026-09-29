import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const BarMetricChart = ({
  data = [],
  dataKeyX = 'name',
  bars = [{ key: 'value', name: 'Value', color: '#0F8B7A' }],
  height = 280,
  formatY = (val) => val,
}) => {
  return (
    <div style={{ width: '100%', height }} className="select-none">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
          />
          {bars.length > 1 && <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />}
          {bars.map((b) => (
            <Bar
              key={b.key}
              dataKey={b.key}
              name={b.name}
              fill={b.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarMetricChart;
