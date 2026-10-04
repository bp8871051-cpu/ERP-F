import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart, Line,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  ComposedChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  TrendingUp, BarChart3, PieChart as PieIcon, Activity, RefreshCw,
  Download, Calendar, Play, Pause, Layers, Eye
} from 'lucide-react';
import UIPageHeader from '../../../components/ui/interface/UIPageHeader';
import UIDemoCard from '../../../components/ui/interface/UIDemoCard';

// Shared Palette matching Dreams ERP
const PALETTE = {
  primary: '#0F8B7A', // Teal
  secondary: '#3B82F6', // Blue
  purple: '#8B5CF6',
  amber: '#F59E0B',
  rose: '#EF4444',
  emerald: '#10B981',
  cyan: '#06B6D4',
  navy: '#1E293B',
  dark: '#0F172A'
};

const PIE_COLORS = ['#0F8B7A', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];

// Reusable Chart Container Component
export const ChartCard = ({ title, description, children, onRefresh, onExport, showDateFilter = true, extraActions }) => {
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-wide">{title}</h3>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          {showDateFilter && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-750 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                    dateRange === range
                      ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {extraActions}

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Data"
              className="p-1.5 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <RefreshCw size={14} />
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              title="Export CSV"
              className="p-1.5 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <Download size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 min-h-[300px]">
        {children}
      </div>
    </div>
  );
};

// ==========================================
// 1. APEX CHARTS PAGE
// ==========================================
export const ApexChartsPage = () => {
  // Real-time data state
  const [isLive, setIsLive] = useState(true);
  const [realtimeData, setRealtimeData] = useState([
    { time: '10:00', cpu: 32, ram: 45, network: 24 },
    { time: '10:05', cpu: 38, ram: 46, network: 28 },
    { time: '10:10', cpu: 45, ram: 48, network: 32 },
    { time: '10:15', cpu: 42, ram: 50, network: 35 },
    { time: '10:20', cpu: 55, ram: 52, network: 40 },
    { time: '10:25', cpu: 62, ram: 54, network: 48 },
    { time: '10:30', cpu: 58, ram: 55, network: 42 }
  ]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setRealtimeData(prev => {
        const last = prev[prev.length - 1];
        const nextMin = (parseInt(last.time.split(':')[1]) + 5) % 60;
        const nextHour = nextMin === 0 ? (parseInt(last.time.split(':')[0]) + 1) : last.time.split(':')[0];
        const newTime = `${String(nextHour).padStart(2, '0')}:${String(nextMin).padStart(2, '0')}`;
        
        const newEntry = {
          time: newTime,
          cpu: Math.floor(Math.random() * 40) + 30,
          ram: Math.floor(Math.random() * 20) + 45,
          network: Math.floor(Math.random() * 35) + 20
        };
        return [...prev.slice(1), newEntry];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLive]);

  // Static datasets
  const monthlyData = [
    { month: 'Jan', revenue: 4200, profit: 2400, expense: 1800 },
    { month: 'Feb', revenue: 4800, profit: 2700, expense: 2100 },
    { month: 'Mar', revenue: 5600, profit: 3200, expense: 2400 },
    { month: 'Apr', revenue: 6100, profit: 3800, expense: 2300 },
    { month: 'May', revenue: 7200, profit: 4500, expense: 2700 },
    { month: 'Jun', revenue: 8400, profit: 5300, expense: 3100 },
    { month: 'Jul', revenue: 9100, profit: 5900, expense: 3200 },
    { month: 'Aug', revenue: 8700, profit: 5400, expense: 3300 },
    { month: 'Sep', revenue: 9500, profit: 6200, expense: 3300 },
    { month: 'Oct', revenue: 10400, profit: 6900, expense: 3500 },
    { month: 'Nov', revenue: 11200, profit: 7400, expense: 3800 },
    { month: 'Dec', revenue: 12500, profit: 8200, expense: 4300 }
  ];

  const pieData = [
    { name: 'Direct Sales', value: 420 },
    { name: 'Affiliate', value: 280 },
    { name: 'Social Media', value: 210 },
    { name: 'Email Campaign', value: 160 },
    { name: 'Organic Search', value: 340 }
  ];

  const radialData = [
    { name: 'Storage', uv: 85, fill: '#0F8B7A' },
    { name: 'Bandwidth', uv: 65, fill: '#3B82F6' },
    { name: 'Memory', uv: 48, fill: '#F59E0B' },
    { name: 'CPU Load', uv: 32, fill: '#EF4444' }
  ];

  const handleExportCSV = (data, filename = 'chart-data.csv') => {
    if (!data || !data.length) return;
    const keys = Object.keys(data[0]);
    const csvContent = [
      keys.join(','),
      ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        title="Apex Charts"
        description="Interactive, responsive charts inspired by modern ApexCharts layouts with rich tooltips, real-time streams, and multi-series combinations."
        breadcrumbs={[
          { label: 'UI Interface', path: '/ui/charts/apex' },
          { label: 'Charts' },
          { label: 'Apex Charts' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Line Chart */}
        <ChartCard
          title="Line Chart (Multi-Series Growth)"
          description="Monthly comparison between revenue and operational expense."
          onExport={() => handleExportCSV(monthlyData, 'line-chart.csv')}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke={PALETTE.primary} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expense" stroke={PALETTE.rose} strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Area Chart */}
        <ChartCard
          title="Area Chart (Profit Margin Trends)"
          description="Smooth gradient area visualization for net profitability."
          onExport={() => handleExportCSV(monthlyData, 'area-chart.csv')}
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="apexAreaProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.primary} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={PALETTE.primary} stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="apexAreaRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.secondary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={PALETTE.secondary} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke={PALETTE.secondary} fillOpacity={1} fill="url(#apexAreaRevenue)" />
              <Area type="monotone" dataKey="profit" stroke={PALETTE.primary} fillOpacity={1} fill="url(#apexAreaProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Bar Chart (Horizontal) */}
        <ChartCard
          title="Bar Chart (Horizontal Comparison)"
          description="Comparison of monthly performance metrics."
          onExport={() => handleExportCSV(monthlyData.slice(0, 6), 'bar-chart.csv')}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart layout="vertical" data={monthlyData.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="month" type="category" stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }} />
              <Legend />
              <Bar dataKey="profit" fill={PALETTE.primary} radius={[0, 4, 4, 0]} />
              <Bar dataKey="expense" fill={PALETTE.amber} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Column Chart (Vertical) */}
        <ChartCard
          title="Column Chart (Quarterly Revenue)"
          description="Stacked or grouped vertical bars displaying revenue breakdown."
          onExport={() => handleExportCSV(monthlyData, 'column-chart.csv')}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }} />
              <Legend />
              <Bar dataKey="revenue" fill={PALETTE.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill={PALETTE.secondary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Pie Chart & 6. Donut Chart */}
        <ChartCard
          title="Pie & Donut Chart (Traffic Channels)"
          description="Distribution of acquisitions across customer channels."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full items-center">
            <div>
              <p className="text-center text-xs font-semibold text-slate-500 mb-2">Standard Pie</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-center text-xs font-semibold text-slate-500 mb-2">Donut Style</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* 7. Radial Chart */}
        <ChartCard
          title="Radial Bar Chart (Resource Allocation)"
          description="Circular progress indicators for server capacity."
        >
          <ResponsiveContainer width="100%" height={260}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={12} data={radialData}>
              <RadialBar
                minAngle={15}
                label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                background
                clockWise
                dataKey="uv"
              />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 8. Mixed / Composed Chart */}
        <ChartCard
          title="Mixed Chart (Line + Bar Combination)"
          description="Combines bar volume with an overlaid line trend."
          onExport={() => handleExportCSV(monthlyData, 'mixed-chart.csv')}
        >
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }} />
              <Legend />
              <Bar dataKey="expense" barSize={20} fill={PALETTE.secondary} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="revenue" stroke={PALETTE.primary} strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 9. Real-Time Streaming Chart */}
        <ChartCard
          title="Real-Time Streaming Chart"
          description="Live ticker with automatic updates every 2.5 seconds."
          extraActions={
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                isLive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
            >
              {isLive ? <Pause size={12} /> : <Play size={12} />}
              {isLive ? 'Live Stream On' : 'Paused'}
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none' }} />
              <Legend />
              <Line isAnimationActive={false} type="monotone" dataKey="cpu" stroke="#EF4444" strokeWidth={2} name="CPU %" />
              <Line isAnimationActive={false} type="monotone" dataKey="ram" stroke="#3B82F6" strokeWidth={2} name="RAM %" />
              <Line isAnimationActive={false} type="monotone" dataKey="network" stroke="#0F8B7A" strokeWidth={2} name="Net MB/s" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

// ==========================================
// 2. CHART JS PAGE
// ==========================================
export const ChartJsPage = () => {
  const [dataPoints, setDataPoints] = useState([
    { label: 'Jan', sales: 65, marketing: 28, tech: 45 },
    { label: 'Feb', sales: 59, marketing: 48, tech: 52 },
    { label: 'Mar', sales: 80, marketing: 40, tech: 60 },
    { label: 'Apr', sales: 81, marketing: 19, tech: 68 },
    { label: 'May', sales: 56, marketing: 86, tech: 54 },
    { label: 'Jun', sales: 55, marketing: 27, tech: 70 },
    { label: 'Jul', sales: 40, marketing: 90, tech: 78 }
  ]);

  const radarData = [
    { subject: 'Math', A: 120, B: 110, fullMark: 150 },
    { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
    { subject: 'English', A: 86, B: 130, fullMark: 150 },
    { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
    { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
    { subject: 'History', A: 65, B: 85, fullMark: 150 }
  ];

  const scatterData = [
    { x: 10, y: 30, z: 200 },
    { x: 30, y: 200, z: 260 },
    { x: 45, y: 100, z: 400 },
    { x: 50, y: 400, z: 280 },
    { x: 70, y: 150, z: 500 },
    { x: 100, y: 250, z: 300 }
  ];

  const refreshRandom = () => {
    setDataPoints(prev => prev.map(p => ({
      ...p,
      sales: Math.floor(Math.random() * 60) + 30,
      marketing: Math.floor(Math.random() * 70) + 20,
      tech: Math.floor(Math.random() * 50) + 40
    })));
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        title="Chart.js Visualizations"
        description="Clean, responsive and high-performance charts implementing standard Chart.js aesthetic paradigms with full theme adaptability."
        breadcrumbs={[
          { label: 'UI Interface', path: '/ui/charts/chart-js' },
          { label: 'Charts' },
          { label: 'Chart.js' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Line Chart */}
        <ChartCard
          title="Line Chart (Multi-Dataset)"
          description="Curved line rendering with circular indicators."
          onRefresh={refreshRandom}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Line type="natural" dataKey="sales" stroke="#0F8B7A" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
              <Line type="natural" dataKey="marketing" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Bar Chart */}
        <ChartCard
          title="Bar Chart (Grouped)"
          description="Grouped bar representation for departments."
          onRefresh={refreshRandom}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataPoints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
              <Legend />
              <Bar dataKey="sales" fill="#0F8B7A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tech" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Radar Chart */}
        <ChartCard
          title="Radar Chart (Skill Profiling)"
          description="Multi-axis directional assessment."
        >
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Candidate A" dataKey="A" stroke="#0F8B7A" fill="#0F8B7A" fillOpacity={0.6} />
              <Radar name="Candidate B" dataKey="B" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Scatter & Bubble Simulation */}
        <ChartCard
          title="Scatter & Correlation Chart"
          description="Coordinate distribution mapping relationship between two continuous variables."
        >
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="x" name="Hours" unit="h" stroke="#94a3b8" />
              <YAxis type="number" dataKey="y" name="Output" unit="units" stroke="#94a3b8" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Production" data={scatterData} fill="#0F8B7A" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
