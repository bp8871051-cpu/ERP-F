import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  DollarSign,
  ShoppingCart,
  CreditCard,
  RotateCcw,
  Printer,
  QrCode,
  Barcode,
  Sliders,
  AlertTriangle,
  TrendingUp,
  Banknote,
  Smartphone,
  Package,
  Layers,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import posService from '../../services/posService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import TrendAreaChart from '../../components/charts/TrendAreaChart';
import BarMetricChart from '../../components/charts/BarMetricChart';
import DonutMetricChart from '../../components/charts/DonutMetricChart';

export const PosDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await posService.getDashboardData();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching POS dashboard:', err);
      setError('Unable to fetch POS terminal telemetry and order registers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPos();
  }, []);

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={fetchPos} />;

  const {
    metrics = {},
    hourlySales = [],
    dailySales = [],
    paymentMethods = [],
    topSellingProducts = [],
    categorySales = [],
    refundTrend = [],
    lowStockProducts = [],
    activeSession = null,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header & POS Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Point of Sale (POS)</h1>
            {activeSession ? (
              <Badge variant="success" dot={true}>Register Open</Badge>
            ) : (
              <Badge variant="neutral">Shift Standby</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time retail register telemetry, hourly velocity, multi-tender transactions, and print hubs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Receipt}
            onClick={() => navigate('/app/pos/orders')}
          >
            Orders & Refunds
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Store}
            onClick={() => navigate('/app/pos/terminal')}
            className="bg-teal-700 hover:bg-teal-800 text-white shadow-sm"
          >
            Launch POS Screen
          </Button>
        </div>
      </div>

      {/* 8 POS KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={`₹${Number(metrics.todaySales || 0).toLocaleString()}`}
          change="+12.4%"
          isPositive={true}
          changeLabel="vs yesterday"
          icon={DollarSign}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Today's Orders"
          value={metrics.todayOrders || 0}
          change="+4"
          isPositive={true}
          changeLabel="orders"
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${Number(metrics.averageOrderValue || 0).toLocaleString()}`}
          subtitle="Ticket Size"
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Cash Sales"
          value={`₹${Number(metrics.cashSales || 0).toLocaleString()}`}
          subtitle="Tendered"
          icon={Banknote}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Card Sales"
          value={`₹${Number(metrics.cardSales || 0).toLocaleString()}`}
          subtitle="Credit/Debit"
          icon={CreditCard}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
        <StatCard
          title="UPI Sales"
          value={`₹${Number(metrics.upiSales || 0).toLocaleString()}`}
          subtitle="Digital QR"
          icon={Smartphone}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Pending Orders"
          value={metrics.pendingOrders || 0}
          subtitle="Hold / Draft"
          icon={Store}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Refunds"
          value={`₹${Number(metrics.refunds || 0).toLocaleString()}`}
          subtitle="Today's Returns"
          icon={RotateCcw}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
      </div>

      {/* Row 2: Charts (Hourly Sales, Daily Sales, Payment Method Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Sales Velocity */}
        <div className="lg:col-span-4">
          <Card
            title="Hourly Sales Velocity"
            subtitle="Today's turnover across operating store hours"
          >
            <div className="h-64">
              <TrendAreaChart
                data={hourlySales}
                dataKey="sales"
                xAxisKey="hour"
                color="#0F8B7A"
                tooltipFormatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Sales']}
              />
            </div>
          </Card>
        </div>

        {/* Daily Sales 7-Day Trend */}
        <div className="lg:col-span-5">
          <Card
            title="7-Day Daily Turnover"
            subtitle="Trailing 7 days revenue trajectory"
          >
            <div className="h-64">
              <BarMetricChart
                data={dailySales}
                dataKey="sales"
                xAxisKey="day"
                color="#2563EB"
                tooltipFormatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Turnover']}
              />
            </div>
          </Card>
        </div>

        {/* Payment Methods Distribution */}
        <div className="lg:col-span-3">
          <Card
            title="Payment Distribution"
            subtitle="Share of tenders received"
          >
            <div className="h-64">
              <DonutMetricChart
                data={paymentMethods}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={75}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Sales by Category & Refund Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales by Category */}
        <div className="lg:col-span-6">
          <Card
            title="Sales by Category"
            subtitle="Category-wise gross merchandise volume"
          >
            <div className="h-64">
              <BarMetricChart
                data={categorySales}
                dataKey="amount"
                xAxisKey="category"
                color="#8B5CF6"
                tooltipFormatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Gross Volume']}
              />
            </div>
          </Card>
        </div>

        {/* Refund Trend */}
        <div className="lg:col-span-6">
          <Card
            title="Refund Trend (7 Days)"
            subtitle="Returned merchandise and refund outflow"
          >
            <div className="h-64">
              <TrendAreaChart
                data={refundTrend}
                dataKey="amount"
                xAxisKey="day"
                color="#EF4444"
                tooltipFormatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Refunds']}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Row 4: Top Selling Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products */}
        <div className="lg:col-span-7">
          <Card
            title="Top Selling POS Products"
            subtitle="Highest volume inventory items checked out at terminals"
            headerAction={
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/app/pos/terminal')}
              >
                Go to POS <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-medium">
                    <th className="pb-2.5">Product Name</th>
                    <th className="pb-2.5">Category</th>
                    <th className="pb-2.5 text-right">Unit Price</th>
                    <th className="pb-2.5 text-right">Sold Units</th>
                    <th className="pb-2.5 text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {topSellingProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-medium text-slate-900 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-teal-600" />
                        {p.name}
                      </td>
                      <td className="py-2.5 text-slate-500">{p.category}</td>
                      <td className="py-2.5 text-right font-medium">₹{Number(p.price).toLocaleString()}</td>
                      <td className="py-2.5 text-right">
                        <Badge variant="teal" size="sm">{p.soldUnits} sold</Badge>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-slate-900">
                        ₹{Number(p.revenue).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Low Stock Products */}
        <div className="lg:col-span-5">
          <Card
            title="Low Stock Watchlist"
            subtitle="Products reaching reorder threshold"
            headerAction={
              <Badge variant="warning" dot={true}>
                {lowStockProducts.length} Items
              </Badge>
            }
          >
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">All inventory items are sufficiently stocked.</p>
              ) : (
                lowStockProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 bg-amber-50/40 rounded-lg border border-amber-200/60"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-900">{prod.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono pl-5.5">SKU: {prod.sku} • {prod.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-600">{prod.availableStock} in stock</span>
                      <p className="text-[10px] text-slate-400">Alert: {prod.alertQuantity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PosDashboard;
