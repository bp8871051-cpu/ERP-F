import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  DollarSign,
  TrendingDown,
  UserCheck,
  Wrench,
  Trash2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Building2,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
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
import assetService from '../../services/assetService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#6366F1'];

export const AssetDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await assetService.getDashboardData();
      setData(res.data || res);
    } catch (err) {
      console.error('Failed to load asset dashboard:', err);
      setError('Unable to load asset dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-72" />
          <LoadingSkeleton className="h-72" />
        </div>
      </div>
    );
  }

  const s = data?.summary || {
    total_assets: 0,
    total_cost: 0,
    total_book_value: 0,
    accumulated_depreciation: 0,
    assigned_count: 0,
    maintenance_count: 0,
    disposed_count: 0,
  };

  const categoryData = (data?.by_category || []).map((c) => ({
    name: c.name || c.category || 'Other',
    value: Number(c.count || c.total || 0),
    cost: Number(c.cost || 0),
  }));

  const departmentData = (data?.by_department || []).map((d) => ({
    name: d.department || d.name || 'Unassigned',
    count: Number(d.count || 0),
  }));

  const valueTrend = data?.value_trend || [
    { month: 'Apr', original: s.total_cost * 0.9, book_value: s.total_book_value * 1.05 },
    { month: 'May', original: s.total_cost * 0.92, book_value: s.total_book_value * 1.03 },
    { month: 'Jun', original: s.total_cost * 0.95, book_value: s.total_book_value * 1.01 },
    { month: 'Jul', original: s.total_cost * 0.97, book_value: s.total_book_value * 0.99 },
    { month: 'Aug', original: s.total_cost * 0.99, book_value: s.total_book_value * 0.96 },
    { month: 'Sep', original: s.total_cost, book_value: s.total_book_value },
  ];

  const maintenanceCostData = data?.maintenance_costs || [
    { month: 'May', cost: 12000 },
    { month: 'Jun', cost: 18500 },
    { month: 'Jul', cost: 9200 },
    { month: 'Aug', cost: 24000 },
    { month: 'Sep', cost: 15400 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" />
            Fixed Asset Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise fixed asset lifecycle tracking, depreciation schedule engine, assignments, and disposals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/assets/analytics')}
            className="text-xs"
          >
            <Activity className="w-3.5 h-3.5 mr-1 text-teal-600" /> Asset Analytics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/assets/register')}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" /> Register Asset
          </Button>
        </div>
      </div>

      {/* 7 KPI Executive Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Assets</span>
            <Boxes className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{s.total_assets}</p>
          <span className="text-[10px] text-slate-400">All registered items</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Purchase Cost</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(s.total_cost)}</p>
          <span className="text-[10px] text-slate-400">Gross acquisition cost</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Net Book Value</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(s.total_book_value)}</p>
          <span className="text-[10px] text-slate-400">Current financial value</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Accum. Depr.</span>
            <TrendingDown className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(s.accumulated_depreciation)}</p>
          <span className="text-[10px] text-slate-400">Depreciation expensed</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Assigned</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{s.assigned_count}</p>
          <span className="text-[10px] text-indigo-600 font-medium">In active custody</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Maintenance</span>
            <Wrench className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold text-rose-600 mt-1">{s.maintenance_count}</p>
          <span className="text-[10px] text-slate-400">Under repair/service</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Disposed</span>
            <Trash2 className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xl font-bold text-slate-700 mt-1">{s.disposed_count}</p>
          <span className="text-[10px] text-slate-400">Written off / sold</span>
        </Card>
      </div>

      {/* Charts Section: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Value & Depreciation Trajectory (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Asset Cost vs Net Book Value Trajectory</h3>
                <p className="text-xs text-slate-500">Historical acquisition cost vs amortized monthly book balance</p>
              </div>
              <Badge variant="info">Monthly Schedule</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={valueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), '']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="original" name="Acquisition Cost" stroke="#0D9488" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="book_value" name="Current Book Value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Breakdown Pie (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Assets by Category</h3>
              <span className="text-xs text-slate-400">{categoryData.length} Categories</span>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">No category records.</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Section: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Assets by Department Bar Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Asset Distribution Across Departments</h3>
              <span className="text-xs text-slate-400">Assigned units count</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="count" name="Assets" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Maintenance Cost Bar Chart (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Maintenance & Repair Expense</h3>
              <span className="text-xs text-rose-600 font-semibold">Repairs & AMC</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintenanceCostData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(v) => [formatCurrency(v), 'Maintenance Cost']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="cost" name="Repair Cost" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Access Operations Links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { title: 'Asset Register', desc: 'Browse & register capital assets', route: '/app/assets/register', icon: Boxes },
          { title: 'Custody Assignments', desc: 'Assign & return hardware', route: '/app/assets/assignments', icon: UserCheck },
          { title: 'Depreciation Engine', desc: 'Straight line & declining schedules', route: '/app/assets/depreciation', icon: TrendingDown },
          { title: 'Maintenance Tickets', desc: 'Preventative & breakdown repairs', route: '/app/assets/maintenance', icon: Wrench },
          { title: 'Disposal & Scrap', desc: 'Sell, scrap, write-off ledger', route: '/app/assets/disposal', icon: Trash2 },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={() => navigate(item.route)}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{item.title}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AssetDashboard;
