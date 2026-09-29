import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Download,
  Printer,
  Filter,
  PieChart as PieChartIcon,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const HRAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrmService.getAnalytics();
      setAnalyticsData(data || {});
    } catch (err) {
      console.error('Error fetching HR analytics:', err);
      setError('Unable to compile workforce analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Workforce Headcount', analyticsData?.headcount || 118],
      ['Retention / Stability Rate', '96.4%'],
      ['Average Monthly Cost per Head', '₹68,500'],
      ['Average Attendance Compliance', '94.8%'],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `hr_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !analyticsData) return <LoadingSkeleton type="dashboard" />;
  if (error && !analyticsData) return <ErrorState message={error} onRetry={fetchAnalytics} />;

  const {
    headcountTrend = [
      { month: 'Apr', count: 95 },
      { month: 'May', count: 102 },
      { month: 'Jun', count: 108 },
      { month: 'Jul', count: 112 },
      { month: 'Aug', count: 115 },
      { month: 'Sep', count: 118 },
    ],
    departmentSplit = [
      { name: 'Engineering', count: 45, color: '#0F8B7A' },
      { name: 'Product & Design', count: 18, color: '#2563EB' },
      { name: 'Sales & BD', count: 24, color: '#F59E0B' },
      { name: 'Finance & Legal', count: 12, color: '#8B5CF6' },
      { name: 'HR & Ops', count: 19, color: '#EC4899' },
    ],
    leaveAnalysis = [
      { type: 'Casual Leave', days: 140 },
      { type: 'Sick Leave', days: 68 },
      { type: 'Paid Vacation', days: 210 },
      { type: 'WFH Compensatory', days: 45 },
    ],
  } = analyticsData || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise HR Analytics & Telemetry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Workforce demographics, retention curves, departmental resource distribution, and headcount trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
            Print Brief
          </Button>
          <Button variant="teal" size="sm" icon={Download} onClick={handleExportCSV}>
            Export Telemetry
          </Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 block uppercase">Total Headcount</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">118 Staff</span>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">+12% YoY</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 block uppercase">Annual Retention</span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block">96.4%</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Low voluntary turnover</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 block uppercase">Attendance Health</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">94.8%</span>
          <span className="text-[10px] text-slate-500 mt-1 block">On-time check-in rate</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 block uppercase">Avg Monthly Payroll</span>
          <span className="text-2xl font-bold text-indigo-700 mt-1 block">₹7.2M</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Disbursed per cycle</span>
        </Card>
      </div>

      {/* Row 1: Headcount Growth & Dept Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Workforce Headcount Expansion</h2>
              <p className="text-xs text-slate-500">Net staff growth trajectory over the past 6 months</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={headcountTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F8B7A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0F8B7A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} Employees`, '']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0F8B7A"
                  strokeWidth={2}
                  fill="url(#hcGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Distribution */}
        <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Departmental Breakdown</h2>
          <div className="space-y-3 pt-2">
            {departmentSplit.map((dept, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">{dept.name}</span>
                  <span className="font-bold text-slate-900">{dept.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(dept.count / 118) * 100}%`,
                      backgroundColor: dept.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Leave Consumption & Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-4">Leave Utilization By Category</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveAnalysis} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} Days`, '']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="days" name="Days Taken" fill="#0F8B7A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Workforce Stability Benchmarks</h2>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Average Tenure:</span>
              <span className="font-semibold text-slate-900">2.8 Years</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Gender Ratio (Male / Female):</span>
              <span className="font-semibold text-slate-900">62% / 38%</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Training Completion Index:</span>
              <span className="font-semibold text-emerald-600">88.5% (Certified)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Recruitment Time-to-Hire:</span>
              <span className="font-semibold text-slate-900">21 Calendar Days</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HRAnalytics;
