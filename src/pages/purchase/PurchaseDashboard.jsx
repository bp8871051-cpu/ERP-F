import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Users,
  Plus,
  ArrowRight,
  Download,
  Calendar,
  Building2,
  FileText,
  DollarSign,
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
import purchaseService from '../../services/purchaseService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const PurchaseDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getDashboard();
      setData(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load procurement dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Purchases', val: `₹${Number(data?.total_purchases || 0).toLocaleString('en-IN')}`, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: "This Month's Purchases", val: `₹${Number(data?.this_month_purchases || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Pending POs', val: data?.pending_purchase_orders || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Pending Receipts', val: data?.pending_receipts || 0, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Total Payables', val: `₹${Number(data?.total_payables || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
    { label: 'Overdue Payables', val: `₹${Number(data?.overdue_payables || 0).toLocaleString('en-IN')}`, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40' },
    { label: 'Purchase Returns', val: data?.purchase_returns || 0, icon: RotateCcw, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Active Vendors', val: data?.active_vendors || 0, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-indigo-600" />
            Procurement & Purchase Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supplier lifecycle, purchase requisitions, goods receiving (GRN), and accounts payable overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/app/purchase/purchases/create')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Receive Goods
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/app/purchase/orders/create')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" /> Create Purchase Order
          </Button>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} bodyClassName="p-4 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-xl ${kpi.bg} shrink-0`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-semibold text-slate-400 block truncate uppercase tracking-wider">{kpi.label}</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 truncate">{kpi.val}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Purchases Trend */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Purchase Spend Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.purchase_trend || []}>
                <defs>
                  <linearGradient id="poGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spend']} />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2.5} fill="url(#poGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Purchases by Category */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            Spend Distribution by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.purchases_by_category || []}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(data?.purchases_by_category || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Purchases Ledger */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            Recent Purchases & Goods Receipts
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/purchase/purchases')}
            className="text-xs"
          >
            View All Purchases
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-5 py-3">Purchase #</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Payment</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.recent_purchases || []).map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/app/purchase/purchases/${p.id}`)}
                  className="hover:bg-slate-50/50 cursor-pointer"
                >
                  <td className="px-5 py-3 font-semibold text-indigo-600">{p.purchase_number}</td>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{p.vendor?.name || 'Vendor'}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{p.invoice_date || 'N/A'}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-white">
                    ₹{Number(p.grand_total || p.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Badge variant={p.status === 'received' ? 'success' : 'neutral'}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs font-semibold capitalize">{p.payment_status || 'unpaid'}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="outline" size="sm" className="text-xs p-1 px-2">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseDashboard;
