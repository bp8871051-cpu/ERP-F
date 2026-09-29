import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  Boxes,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  LifeBuoy,
  CreditCard,
  PlusCircle,
  FileText,
  UserPlus,
  PackagePlus,
  ArrowUpRight,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import productService from '../../services/productService';
import AddProductModal from '../../components/inventory/AddProductModal';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import TrendAreaChart from '../../components/charts/TrendAreaChart';
import BarMetricChart from '../../components/charts/BarMetricChart';
import DonutMetricChart from '../../components/charts/DonutMetricChart';

export const MainDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getOverview();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching main dashboard:', err);
      setError('Unable to retrieve dashboard metrics from the Laravel API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSaveProduct = async (formData, id) => {
    try {
      if (id) {
        await productService.updateProduct(id, formData);
      } else {
        await productService.createProduct(formData);
      }
      setShowProductModal(false);
      fetchDashboard();
      setToastMessage('Product created successfully in Inventory!');
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error('Failed to create product:', err);
      throw err;
    }
  };

  if (loading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (error || !data) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  const { metrics, revenueTrend, departmentDistribution, inventoryStatus, expenseCategories, recentActivities } = data;

  const iconMap = {
    UserCheck,
    ShoppingCart,
    CheckCircle,
    Award: Activity,
    LifeBuoy,
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise ERP Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time cross-department analytics, revenue telemetry, and system activity.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={UserPlus}
            onClick={() => navigate('/app/hrm')}
          >
            Add Employee
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={PackagePlus}
            onClick={() => setShowProductModal(true)}
          >
            Add Product
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/app/sales/invoices/create')}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Primary 8 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={metrics.totalEmployees}
          change="+2 new"
          isPositive={true}
          changeLabel="this month"
          icon={Users}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Total Customers"
          value={metrics.totalCustomers}
          change="+18%"
          isPositive={true}
          icon={Building}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Total Products"
          value={metrics.totalProducts}
          subtitle="Across 3 Warehouses"
          icon={Boxes}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Total Orders"
          value={metrics.totalSalesCount}
          change="+12.4%"
          isPositive={true}
          icon={ShoppingCart}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          change="+8.6%"
          isPositive={true}
          icon={DollarSign}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Pending Receivables"
          value={`$${metrics.pendingPayments.toLocaleString()}`}
          change="3 Overdue"
          isPositive={false}
          icon={CreditCard}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Low Stock Items"
          value={metrics.lowStockItems}
          change="Reorder Needed"
          isPositive={false}
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
        <StatCard
          title="Open Tickets"
          value={metrics.openTickets}
          subtitle="Average SLA: 18m"
          icon={LifeBuoy}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Row 1 Charts: Revenue Trend vs Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Financial Performance & Revenue Velocity"
          subtitle="6-Month Revenue, Expenses, and Operating Net Margin"
          className="lg:col-span-2"
        >
          <TrendAreaChart
            data={revenueTrend}
            series={[
              { key: 'revenue', name: 'Gross Revenue', color: '#0F8B7A' },
              { key: 'expenses', name: 'Operating Expenses', color: '#1E293B' },
              { key: 'profit', name: 'Net Profit', color: '#2563EB' },
            ]}
          />
        </Card>

        <Card
          title="Workforce by Department"
          subtitle="Full-time headcount distribution"
        >
          <DonutMetricChart
            data={departmentDistribution.map((d) => ({ name: d.name, value: d.count }))}
            dataKey="value"
            nameKey="name"
          />
        </Card>
      </div>

      {/* Row 2: Inventory Status Breakdown + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Inventory Stock Status"
          subtitle="Proportion of healthy vs critical inventory items"
        >
          <DonutMetricChart
            data={inventoryStatus}
            dataKey="value"
            nameKey="name"
            innerRadius={65}
            outerRadius={95}
          />
        </Card>

        <Card
          title="Recent Operational Activity"
          subtitle="Live multi-department audit trail"
          className="lg:col-span-2"
          noPadding
        >
          <div className="divide-y divide-slate-100">
            {recentActivities.map((act) => {
              const Icon = iconMap[act.icon] || Activity;
              return (
                <div key={act.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-teal-700 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{act.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{act.description}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 3: Operating Expenses by Category */}
      <Card
        title="Operating Expenses by Category"
        subtitle="Consolidated overhead and department disbursements"
      >
        <BarMetricChart
          data={expenseCategories}
          dataKeyX="category"
          bars={[{ key: 'amount', name: 'Amount ($)', color: '#1E293B' }]}
          formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
      </Card>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-sm font-medium border border-emerald-500 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-100" />
          {toastMessage}
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSaved={handleSaveProduct}
      />
    </div>
  );
};

export default MainDashboard;
