import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  Filter,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  Users,
  Package,
  Layers,
  Printer,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const SalesAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await salesService.getAnalytics({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setData(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load sales analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value (₹)'],
      ['Gross Sales', data.gross_sales || 0],
      ['Net Sales', data.net_sales || 0],
      ['Tax Collected', data.tax_collected || 0],
      ['Discount Given', data.discount_given || 0],
      ['Total Receivable', data.total_receivable || 0],
      ['Total Refunds', data.total_refunds || 0],
    ];
    const csv = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `sales_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  const kpis = [
    { label: 'Gross Sales', val: data?.gross_sales || 0, color: 'text-indigo-600', desc: 'Total sales invoices billed' },
    { label: 'Net Sales', val: data?.net_sales || (data?.gross_sales - (data?.discount_given || 0)), color: 'text-emerald-600', desc: 'After trade discounts' },
    { label: 'Tax Collected (GST)', val: data?.tax_collected || 0, color: 'text-cyan-600', desc: 'Total GST liability' },
    { label: 'Discounts Granted', val: data?.discount_given || 0, color: 'text-amber-600', desc: 'Promotional deductions' },
    { label: 'Total Receivables', val: data?.total_receivable || 0, color: 'text-blue-600', desc: 'Customer unpaid balance' },
    { label: 'Customer Refunds', val: data?.total_refunds || 0, color: 'text-rose-600', desc: 'Settled returns/refunds' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            Sales & Revenue Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise business intelligence, gross-to-net reconciliation, product margins, and revenue growth.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export Metrics
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Print Report
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Report Period:</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>
        {(startDate || endDate) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-slate-500 gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </Button>
        )}
      </Card>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block truncate">{kpi.label}</span>
            <p className={`text-lg font-bold ${kpi.color} mt-1`}>
              ₹{Number(kpi.val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <span className="text-[10px] text-slate-400 mt-1 block truncate">{kpi.desc}</span>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            Monthly Revenue Trend (Last 12 Months)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_sales || []}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2.5} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sales by Category */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            Category Revenue Share
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.sales_by_category || []}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(data?.sales_by_category || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Products & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" /> Top Selling Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3 text-left">Product</th>
                  <th className="py-2.5 px-3 text-right">Qty Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.top_products || []).map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{p.product_name}</td>
                    <td className="py-2.5 px-3 text-right">{p.quantity_sold}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600">
                      ₹{Number(p.revenue).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" /> High-Value Accounts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3 text-left">Customer</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Total Invoiced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.top_customers || []).map((c, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{c.customer_name}</td>
                    <td className="py-2.5 px-3 text-right">{c.orders_count}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      ₹{Number(c.revenue).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalytics;
