import React, { useState, useEffect } from 'react';
import {
  Truck,
  Clock,
  DollarSign,
  PackageCheck,
  Building,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  FileCheck,
  FileText,
  Calendar,
} from 'lucide-react';
import procurementService from '../../services/procurementService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import TrendAreaChart from '../../components/charts/TrendAreaChart';
import BarMetricChart from '../../components/charts/BarMetricChart';
import DonutMetricChart from '../../components/charts/DonutMetricChart';

export const ProcurementDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProcurement = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await procurementService.getDashboardData();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching procurement dashboard:', err);
      setError('Unable to load purchase orders and vendor procurement metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurement();
  }, []);

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={fetchProcurement} />;

  const {
    metrics,
    purchaseTrend,
    supplierDistribution,
    procurementStatus,
    recentPurchaseOrders,
    pendingApprovals,
    upcomingDeliveries,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Procurement & Sourcing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Supplier purchase orders, inbound goods receipts, vendor commitments, and delivery schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={FileCheck}>
            Supplier Catalog
          </Button>
          <Button variant="teal" size="sm" icon={PlusCircle}>
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* 6 Key Procurement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Purchase Orders"
          value={metrics.purchaseOrdersCount}
          subtitle="Issued POs"
          icon={FileText}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Pending Approvals"
          value={metrics.pendingApprovals}
          change="Requires Review"
          isPositive={false}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Total Procurement"
          value={`$${metrics.totalProcurement.toLocaleString()}`}
          change="+6.8%"
          isPositive={true}
          changeLabel="MoM"
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="In Transit"
          value={metrics.pendingDeliveries}
          subtitle="Awaiting Delivery"
          icon={Truck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Suppliers"
          value={metrics.suppliersCount}
          subtitle="Contracted Tier 1"
          icon={Building}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Purchase Value"
          value={`$${metrics.purchaseValue.toLocaleString()}`}
          change="All Warehouses"
          isPositive={true}
          icon={PackageCheck}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
      </div>

      {/* Charts Row 1: Purchase Trend + Supplier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Procurement Spend Trend (Past 6 Months)"
          subtitle="Monthly capital deployed for equipment, inventory, and hardware"
          className="lg:col-span-2"
        >
          <TrendAreaChart
            data={purchaseTrend}
            dataKeyX="month"
            series={[{ key: 'amount', name: 'Purchase Spend ($)', color: '#0F8B7A' }]}
            formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
        </Card>

        <Card title="Vendor Spend Distribution" subtitle="Share of spend by primary hardware partner">
          <DonutMetricChart
            data={supplierDistribution}
            dataKey="value"
            nameKey="name"
          />
        </Card>
      </div>

      {/* Procurement Status Breakdown */}
      <Card
        title="Procurement Lifecycle Status"
        subtitle="Distribution of POs across Draft, Pending, Approved, Ordered, Received, Cancelled"
      >
        <BarMetricChart
          data={procurementStatus}
          dataKeyX="status"
          bars={[{ key: 'count', name: 'Purchase Orders', color: '#1E293B' }]}
          formatY={(v) => `${v}`}
        />
      </Card>

      {/* Tables Row: Recent POs + Pending Approvals + Upcoming Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Purchase Orders */}
        <Card title="Recent Purchase Orders" subtitle="Latest PO activity with suppliers" noPadding>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recentPurchaseOrders.map((po) => (
              <div key={po.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{po.poNumber}</span>
                  <span className="text-[10px] text-slate-400">{po.supplier} • {po.orderDate}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 block">{po.total}</span>
                  <Badge variant={po.status === 'Ordered' ? 'info' : 'warning'} size="sm">
                    {po.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card title="Pending PO Approvals" subtitle="Orders awaiting CFO / Director approval" noPadding>
          <div className="divide-y divide-slate-100">
            {pendingApprovals.map((pa) => (
              <div key={pa.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{pa.poNumber}</span>
                  <span className="text-[10px] text-slate-400">{pa.supplier} • Req: {pa.requestedBy}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{pa.amount}</span>
                  <Button variant="teal" size="sm" className="!py-0.5 !px-2 !text-[10px] mt-1">
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Deliveries */}
        <Card title="Scheduled Cargo Deliveries" subtitle="Shipments arriving at warehouses" noPadding>
          <div className="divide-y divide-slate-100">
            {upcomingDeliveries.map((d) => (
              <div key={d.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block truncate max-w-[150px]">{d.items}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    ETA: {d.expectedDate} • {d.destination}
                  </span>
                </div>
                <Badge variant="teal" size="sm">
                  {d.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
