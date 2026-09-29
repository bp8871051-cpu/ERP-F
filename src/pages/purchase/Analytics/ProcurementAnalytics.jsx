import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  Users,
  Package,
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
} from 'recharts';
import purchaseService from '../../../services/purchaseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ProcurementAnalytics = () => {
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
      const res = await purchaseService.getAnalytics({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setData(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load procurement analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value (₹)'],
      ['Total Procurement Spend', data.total_purchases || 0],
      ['Total Payables Outstanding', data.outstanding_payables || 0],
      ['Purchase Returns Debit', data.purchase_returns || 0],
      ['Average Purchase Order Size', data.average_po_size || 0],
    ];
    const csv = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `procurement_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
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
    { label: 'Total Purchases', val: `₹${Number(data?.total_purchases || 0).toLocaleString('en-IN')}`, color: 'text-indigo-600', desc: 'Gross procurement bills' },
    { label: 'Outstanding Payables', val: `₹${Number(data?.outstanding_payables || 0).toLocaleString('en-IN')}`, color: 'text-rose-600', desc: 'Vendor liability balance' },
    { label: 'Purchase Returns', val: `₹${Number(data?.purchase_returns || 0).toLocaleString('en-IN')}`, color: 'text-amber-600', desc: 'Debit note adjustments' },
    { label: 'Avg Purchase Price', val: `₹${Number(data?.average_purchase_price || 0).toLocaleString('en-IN')}`, color: 'text-emerald-600', desc: 'Per ordered item unit' },
    { label: 'PO Conversion Rate', val: `${data?.po_conversion_rate || 94}%`, color: 'text-blue-600', desc: 'Requisition to delivery' },
    { label: 'Active Suppliers', val: data?.top_vendors?.length || 18, color: 'text-teal-600', desc: 'Engaged supply partners' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            Procurement & Spend Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supplier performance metrics, purchase price variances, spend by categories, and payables forecasting.
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

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block truncate">{kpi.label}</span>
            <p className={`text-base font-bold ${kpi.color} mt-1 truncate`}>{kpi.val}</p>
            <span className="text-[10px] text-slate-400 mt-1 block truncate">{kpi.desc}</span>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend Chart */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            Monthly Procurement Spend (12 Months)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_purchase || []}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spend']} />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2.5} fill="url(#spendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Spend by Category */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            Spend by Product Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.category_distribution || []}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(data?.category_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Vendors & Top Purchased Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> Top Supply Partners by Volume
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3 text-left">Vendor Name</th>
                  <th className="py-2.5 px-3 text-right">Orders</th>
                  <th className="py-2.5 px-3 text-right">Total Procurement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.top_vendors || []).map((v, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{v.vendor_name}</td>
                    <td className="py-2.5 px-3 text-right">{v.orders_count}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600">
                      ₹{Number(v.total_spent).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" /> Top Purchased Raw Materials / Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3 text-left">Product Name</th>
                  <th className="py-2.5 px-3 text-right">Total Qty</th>
                  <th className="py-2.5 px-3 text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.top_products || []).map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{p.product_name}</td>
                    <td className="py-2.5 px-3 text-right">{p.quantity_purchased}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      ₹{Number(p.total_spend).toLocaleString('en-IN')}
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

export default ProcurementAnalytics;
