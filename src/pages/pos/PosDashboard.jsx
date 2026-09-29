import React, { useState, useEffect } from 'react';
import {
  Store,
  DollarSign,
  ShoppingCart,
  CreditCard,
  RotateCcw,
  Printer,
  PlusCircle,
  Clock,
  TrendingUp,
  Banknote,
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
    metrics,
    hourlySales,
    dailySales,
    paymentMethods,
    recentOrders,
    topSellingProducts,
    recentTransactions,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header & POS Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Point of Sale (POS)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Terminal register telemetry, hourly transaction velocity, tender methods, and receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" icon={RotateCcw}>
            Refund
          </Button>
          <Button variant="secondary" size="sm" icon={Printer}>
            Print Receipt
          </Button>
          <Button variant="teal" size="sm" icon={PlusCircle}>
            New Order
          </Button>
          <Button variant="primary" size="sm" icon={Store}>
            Open POS Register
          </Button>
        </div>
      </div>

      {/* 6 Key POS Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Today's Sales"
          value={`$${metrics.todaySales.toLocaleString()}`}
          change="+8.4%"
          isPositive={true}
          changeLabel="vs yesterday"
          icon={DollarSign}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Today's Orders"
          value={metrics.todayOrders}
          subtitle="Processed at terminals"
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Avg Order Value"
          value={`$${metrics.averageOrderValue.toFixed(2)}`}
          change="+3.1%"
          isPositive={true}
          icon={Receipt}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Refunds"
          value={`$${metrics.refunds.toFixed(2)}`}
          change="0.8% return rate"
          isPositive={false}
          icon={RotateCcw}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
        <StatCard
          title="Cash Tendered"
          value={`$${metrics.cashPayments.toLocaleString()}`}
          subtitle="Verified in drawer"
          icon={Banknote}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Card Payments"
          value={`$${metrics.cardPayments.toLocaleString()}`}
          subtitle="Visa, Mastercard, Amex"
          icon={CreditCard}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Charts Row 1: Hourly Sales + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Hourly Sales Velocity (Today)"
          subtitle="Transaction throughput across peak retail and trading hours"
          className="lg:col-span-2"
        >
          <BarMetricChart
            data={hourlySales}
            dataKeyX="hour"
            bars={[
              { key: 'sales', name: 'Revenue ($)', color: '#0F8B7A' },
            ]}
            formatY={(v) => `$${v}`}
          />
        </Card>

        <Card title="Tender / Payment Methods" subtitle="Breakdown of checkout payment channels">
          <DonutMetricChart
            data={paymentMethods}
            dataKey="value"
            nameKey="name"
          />
        </Card>
      </div>

      {/* Charts Row 2: Daily Sales Trend (7 Days) */}
      <Card
        title="7-Day Daily Revenue Trend"
        subtitle="Weekly retail consistency and weekend volume surges"
      >
        <TrendAreaChart
          data={dailySales}
          dataKeyX="day"
          series={[
            { key: 'sales', name: 'Daily Gross Receipts ($)', color: '#1E293B' },
          ]}
          formatY={(v) => `$${(v / 1000).toFixed(1)}k`}
        />
      </Card>

      {/* Tables Row: Recent Orders + Top Selling Products + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <Card title="Recent Terminal Orders" subtitle="Live stream of completed ticket sales" noPadding>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recentOrders.map((o) => (
              <div key={o.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{o.orderNumber}</span>
                  <span className="text-[10px] text-slate-400">{o.customer} • {o.time}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 block">{o.total}</span>
                  <Badge variant={o.paymentMethod === 'CARD' ? 'info' : 'teal'} size="sm">
                    {o.paymentMethod}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Selling Products */}
        <Card title="Top Selling SKUs Today" subtitle="Highest units moved through registers" noPadding>
          <div className="divide-y divide-slate-100">
            {topSellingProducts.map((p) => (
              <div key={p.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block truncate max-w-[150px]">{p.name}</span>
                  <span className="text-[10px] text-slate-400">{p.category} • Price: {p.price}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-700 block">{p.revenue}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{p.soldUnits} units</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Settlement Transactions */}
        <Card title="Recent Terminal Settlements" subtitle="Merchant batch audit log" noPadding>
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((t) => (
              <div key={t.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block truncate max-w-[150px]">{t.reference}</span>
                  <span className="text-[10px] text-slate-400">{t.time}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{t.amount}</span>
                  <Badge variant="success" size="sm">
                    {t.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PosDashboard;
