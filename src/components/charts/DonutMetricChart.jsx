import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DEFAULT_COLORS = ['#0F8B7A', '#1E293B', '#2563EB', '#F59E0B', '#64748B', '#10B981', '#EC4899'];

export const DonutMetricChart = ({
  data = [],
  nameKey = 'name',
  dataKey = 'value',
  height = 280,
  innerRadius = 60,
  outerRadius = 90,
  colors = DEFAULT_COLORS,
}) => {
  return (
    <div style={{ width: '100%', height }} className="select-none flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
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
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutMetricChart;
