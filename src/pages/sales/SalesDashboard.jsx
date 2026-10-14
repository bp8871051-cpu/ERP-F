import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Receipt,
  Clock,
  AlertCircle,
  RotateCcw,
  PlusCircle,
  Eye,
  FileSpreadsheet,
  ArrowUpRight,
  Package,
  Users,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import salesService from '../../services/salesService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';

const COLORS = ['#0F8B7A', '#3B82F6', '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6'];

export const SalesDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await salesService.getDashboard();
      setData(res.data?.data || res.data);
    } catch (err) {
      console.error('Error fetching sales dashboard:', err);
      setError('Unable to load live sales metrics and transaction feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const {
    cards = {},
    revenueTrend = [],
    salesByCategory = [],
    salesByCustomer = [],
    paymentMethods = [],
    orderStatusDist = [],
    recentSales = [],
    topProducts = [],
    topCustomers = [],
  } = data;

  return (
    <div className="space-y-6">
      {/* Header and Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Sales Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline, invoicing status, collections, receivables, and top customer revenues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchDashboard}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" icon={FileSpreadsheet} onClick={() => navigate('/app/sales/analytics')}>
            Sales Analytics
          </Button>
          <Button variant="teal" size="sm" icon={PlusCircle} onClick={() => navigate('/app/sales/orders/create')}>
            New Order
          </Button>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={`$${Number(cards.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change="+18.4%"
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Today's Sales"
          value={`$${Number(cards.todaySales || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change="Real-time"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          title="This Month"
          value={`$${Number(cards.monthSales || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change="+12.1%"
          isPositive={true}
          icon={Receipt}
        />
        <StatCard
          title="Pending Orders"
          value={cards.pendingOrders || 0}
          change="In queue"
          isPositive={false}
          icon={ShoppingCart}
        />
        <StatCard
          title="Pending Invoices"
          value={cards.pendingInvoices || 0}
          change="Unpaid"
          isPositive={false}
          icon={Clock}
        />
        <StatCard
          title="Overdue Invoices"
          value={cards.overdueInvoices || 0}
          change="Action req."
          isPositive={false}
          icon={AlertCircle}
        />
        <StatCard
          title="Total Receivable"
          value={`$${Number(cards.totalReceivable || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change="Outstanding"
          isPositive={false}
          icon={DollarSign}
        />
        <StatCard
          title="Refunds"
          value={`$${Number(cards.totalRefunds || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change="Processed"
          isPositive={false}
          icon={RotateCcw}
        />
      </div>

      {/* Primary Chart Row: Sales Revenue Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sales Revenue Trend</h2>
              <p className="text-xs text-slate-500">Gross revenue invoiced vs. actual payment collected</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
              Last 6 Months
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F8B7A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0F8B7A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="sales" name="Invoiced Sales" stroke="#0F8B7A" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="collected" name="Payment Collected" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#collectedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sales by Category Donut */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sales by Category</h2>
            <p className="text-xs text-slate-500 mb-4">Volume breakdown across enterprise lines</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1 mt-2 text-xs">
            {salesByCategory.slice(0, 4).map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="truncate max-w-[140px]">{cat.name}</span>
                </span>
                <span className="font-semibold">${Number(cat.value).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Secondary Chart Row: Top Customer Volumes & Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sales by Customer</h2>
              <p className="text-xs text-slate-500">Top account volume contributors</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/sales/customers')}>
              View All Customers
            </Button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByCustomer} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="value" fill="#0F8B7A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Status Distribution */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order Status Distribution</h2>
            <p className="text-xs text-slate-500 mb-4">Pipeline fulfilment lifecycle ratio</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {orderStatusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            {orderStatusDist.map((stat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color || COLORS[i % COLORS.length] }} />
                <span className="truncate">{stat.name}: <b>{stat.value}</b></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Sales & Invoices</h2>
            <p className="text-xs text-slate-500">Live operational ledger of invoiced contracts and payments</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/app/sales/invoices')}>
            All Invoices
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    No sales recorded yet. Click 'New Order' to generate transactions.
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-teal-600 dark:text-teal-400">
                      {sale.invoice_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                      {sale.customer}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{sale.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      ${Number(sale.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          sale.payment_status === 'paid' ? 'success' :
                          sale.payment_status === 'partial' || sale.payment_status === 'partially_paid' ? 'warning' : 'danger'
                        }
                        size="sm"
                      >
                        {sale.payment_status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {sale.order_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/app/sales/invoices/${sale.id}`)}
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Grid: Top Selling Products & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-600" /> Top Selling Products
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/inventory/products')}>
              Inventory
            </Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topProducts.map((p, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400">SKU: {p.sku || 'N/A'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100">${Number(p.revenue).toLocaleString()}</p>
                  <p className="text-[11px] text-teal-600 font-medium">{p.quantity} units sold</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" /> Leading Corporate Clients
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/sales/customers')}>
              All Clients
            </Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topCustomers.map((cust, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{cust.name}</p>
                  <p className="text-[11px] text-slate-400">{cust.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100">${Number(cust.revenue).toLocaleString()}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{cust.orders} Orders Placed</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesDashboard;
