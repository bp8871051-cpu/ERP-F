import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Award,
  Clock,
  Sparkles,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  ArrowUpRight,
  PieChart as PieIcon,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const CustomerAnalytics = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmService.getAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load customer analytics:', err);
      setError('Unable to load CRM customer analytics and segments.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateSegments = async () => {
    try {
      setEvaluating(true);
      await crmService.evaluateSegments();
      alert('Segmentation rules evaluated! Customer tier assignments refreshed.');
      fetchAnalytics();
    } catch (err) {
      alert('Error updating segments.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={fetchAnalytics} />;

  const { metrics, customer_growth = [], revenue_trend = [], acquisition_sources = [], top_customers = [], segments = [] } = data;

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Retention vs Churn comparison data
  const retentionVsChurnData = [
    { name: 'Retained', value: metrics.retention_rate || 75, color: '#10B981' },
    { name: 'Churned', value: metrics.churn_rate || 25, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            CRM Customer Analytics & Segmentation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            CLV lifetime value calculation, acquisition channel mix, retention velocity, and automated VIP tiering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            icon={Sparkles}
            onClick={handleEvaluateSegments}
            disabled={evaluating}
          >
            {evaluating ? 'Evaluating Rules...' : 'Re-Evaluate Segments'}
          </Button>
          <button
            onClick={fetchAnalytics}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Customers"
          value={metrics.total_customers?.toLocaleString()}
          subtitle={`${metrics.active_customers} active accounts`}
          icon={Users}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Lifetime Value (CLV)"
          value={formatCurrency(metrics.clv)}
          subtitle="Estimated value per client"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Avg Deal Value"
          value={formatCurrency(metrics.average_deal_value)}
          subtitle="Average won contract"
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Sales Cycle"
          value={`${metrics.average_sales_cycle_days} Days`}
          subtitle="Inquiry to Close velocity"
          icon={Clock}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Retention Rate"
          value={`${metrics.retention_rate}%`}
          subtitle="Repeat buying accounts"
          icon={Award}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="ARPU (Revenue/User)"
          value={formatCurrency(metrics.arpu)}
          subtitle="Annualized per customer"
          icon={DollarSign}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Customer Segmentation Section */}
      <Card
        title="Automated Customer Segmentation"
        subtitle="Rule-based tiering evaluated server-side (VIP, High Value, Repeat, At Risk, Inactive)"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-2">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: seg.color || '#0F8B7A' }}
                />
                <span className="text-[10px] font-bold font-mono text-slate-400">
                  {seg.code || `SEG-${idx + 1}`}
                </span>
              </div>
              <span className="font-bold text-slate-800 text-xs block truncate">
                {seg.name}
              </span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                {seg.count || 0}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                {seg.description || 'Configurable segment rule'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Row 1: Customer Growth & Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth */}
        <Card title="Monthly Customer Acquisition & Base Growth" subtitle="New accounts added vs cumulative base">
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customer_growth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val, name) => [
                    `${val} accounts`,
                    name === 'new_customers' ? 'New Customers' : 'Cumulative Base',
                  ]}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(val) => (val === 'new_customers' ? 'New Customers' : 'Total Customer Base')}
                />
                <Bar dataKey="new_customers" fill="#0F8B7A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total_customers" fill="#1E293B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Trend */}
        <Card title="Revenue Growth Velocity" subtitle="Expected pipeline revenue vs closed won revenue">
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F8B7A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0F8B7A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(v) => (v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${v}`)}
                />
                <Tooltip
                  formatter={(val, name) => [
                    formatCurrency(val),
                    name === 'actual_revenue' ? 'Won Revenue' : 'Expected Revenue',
                  ]}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area
                  type="monotone"
                  dataKey="actual_revenue"
                  stroke="#0F8B7A"
                  strokeWidth={2}
                  fill="url(#areaActual)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2: Acquisition Sources & Retention vs Churn */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Customer Acquisition Source" subtitle="Origin channels for signed customers" className="lg:col-span-2">
          <div className="h-60 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={acquisition_sources} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="source" type="category" tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip
                  formatter={(val) => [`${val} accounts`, 'Customers Acquired']}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Retention vs Churn" subtitle="Customer retention health benchmark">
          <div className="h-60 mt-1 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={retentionVsChurnData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {retentionVsChurnData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Rate']}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Retention {metrics.retention_rate}%
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Churn {metrics.churn_rate}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top 10 Customers Table */}
      <Card title="Top 10 Accounts by Closed Won Revenue" subtitle="Highest contract value enterprise customers" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Closed Won Deals</th>
                <th className="py-3 px-4">Cumulative Revenue</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {top_customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No customers found.
                  </td>
                </tr>
              ) : (
                top_customers.map((c, idx) => (
                  <tr key={c.id || idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.company || 'Corporate'}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {c.deals_count} won deals
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">
                      {formatCurrency(c.total_revenue)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={c.status === 'active' ? 'success' : 'neutral'} size="sm">
                        {c.status || 'active'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/app/sales/customers/${c.id}`)}
                        className="text-teal-600 hover:text-teal-800 font-semibold text-[11px] cursor-pointer inline-flex items-center gap-1"
                      >
                        Profile <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CustomerAnalytics;
