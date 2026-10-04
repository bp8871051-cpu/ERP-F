import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Boxes,
  DollarSign,
  TrendingDown,
  Wrench,
  ShieldAlert,
  Calendar,
  Layers,
  Building2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
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

const COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#6366F1'];

export const AssetAnalytics = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warrantyFilter, setWarrantyFilter] = useState('30'); // '30' | '60' | '90' | 'all'

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await assetService.getAnalytics();
      setAnalytics(res.data || res);
    } catch (err) {
      console.error('Failed to load asset analytics:', err);
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
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton className="h-72" />
          <LoadingSkeleton className="h-72" />
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpi || {
    total_cost: 0,
    current_book_value: 0,
    accumulated_depreciation: 0,
    maintenance_cost: 0,
    disposal_value: 0,
  };

  const categoryData = (analytics?.by_category || []).map((c) => ({
    name: c.name || c.category || 'Other',
    value: Number(c.count || c.total || 0),
    cost: Number(c.cost || 0),
  }));

  const departmentData = (analytics?.by_department || []).map((d) => ({
    name: d.name || d.department || 'HQ',
    count: Number(d.count || 0),
    value: Number(d.value || 0),
  }));

  const ageData = analytics?.asset_age_distribution || [
    { bracket: '< 1 Year (New)', count: 18, value: 450000 },
    { bracket: '1 - 2 Years', count: 24, value: 680000 },
    { bracket: '2 - 3 Years', count: 15, value: 340000 },
    { bracket: '3 - 5 Years', count: 9, value: 120000 },
    { bracket: '> 5 Years (Fully Depreciated)', count: 5, value: 25000 },
  ];

  const topMaintenance = analytics?.top_maintenance_assets || [
    { name: 'Server Rack Alpha', code: 'AST-2024-001', repairs: 5, cost: 48000 },
    { name: 'Core Network Switch', code: 'AST-2024-042', repairs: 3, cost: 32000 },
    { name: 'Diesel Generator 50kVA', code: 'AST-2023-010', repairs: 4, cost: 28500 },
    { name: 'CNC Milling Machine', code: 'AST-2025-088', repairs: 2, cost: 19000 },
  ];

  const allWarranty = analytics?.warranty_alerts || [
    { id: 1, name: 'Precision Workstation #12', code: 'AST-2025-001', end_date: new Date(Date.now() + 15 * 86400000).toISOString(), days_left: 15, status: 'expiring' },
    { id: 2, name: 'Warehouse Thermal Printer', code: 'AST-2025-045', end_date: new Date(Date.now() + 28 * 86400000).toISOString(), days_left: 28, status: 'expiring' },
    { id: 3, name: 'Boardroom Video Soundbar', code: 'AST-2025-099', end_date: new Date(Date.now() + 52 * 86400000).toISOString(), days_left: 52, status: 'expiring' },
    { id: 4, name: 'Air Conditioning Unit Floor 4', code: 'AST-2024-022', end_date: new Date(Date.now() - 10 * 86400000).toISOString(), days_left: -10, status: 'expired' },
  ];

  const filteredWarranty = allWarranty.filter((w) => {
    if (warrantyFilter === '30') return w.days_left >= 0 && w.days_left <= 30;
    if (warrantyFilter === '60') return w.days_left >= 0 && w.days_left <= 60;
    if (warrantyFilter === '90') return w.days_left >= 0 && w.days_left <= 90;
    return true; // all
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            Fixed Asset Portfolio Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic capital asset intelligence, depreciation curves, equipment aging brackets, and warranty risk monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/assets/register')}
            className="text-xs"
          >
            <Boxes className="w-3.5 h-3.5 mr-1 text-teal-600" /> Asset Register
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/assets/depreciation')}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
          >
            <TrendingDown className="w-3.5 h-3.5 mr-1" /> Depreciation Schedule
          </Button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="p-3 bg-white border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Gross Asset Value</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(kpis.total_cost)}</p>
          <span className="text-[10px] text-slate-400">Total Capital Cost</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Net Book Value</span>
          <p className="text-lg font-bold text-teal-600 mt-1">{formatCurrency(kpis.current_book_value)}</p>
          <span className="text-[10px] text-teal-600 font-medium">Balance Sheet Valuation</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Accum. Depreciation</span>
          <p className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(kpis.accumulated_depreciation)}</p>
          <span className="text-[10px] text-slate-400">Total Expensed</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Maintenance Expense</span>
          <p className="text-lg font-bold text-rose-600 mt-1">{formatCurrency(kpis.maintenance_cost)}</p>
          <span className="text-[10px] text-slate-400">All-time Repairs & AMC</span>
        </Card>

        <Card className="p-3 bg-white border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Disposal Recovery</span>
          <p className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(kpis.disposal_value)}</p>
          <span className="text-[10px] text-slate-400">Liquidation Realized</span>
        </Card>
      </div>

      {/* Row 1: Asset Aging Distribution + Category Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Aging Bar Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Asset Age Distribution & Obsolescence</h3>
                <p className="text-xs text-slate-500">Number of assets by years in active service</p>
              </div>
              <Badge variant="info">Equipment Lifecycle</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="bracket" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="count" name="Asset Count" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Share Pie (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Capital Value by Category</h3>
              <span className="text-xs text-slate-400">Asset Composition</span>
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
                      outerRadius={75}
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

      {/* Row 2: Warranty Alerts Watchlist + Top Maintenance Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Warranty Expiry Watchlist (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Warranty Expiry Alerts & AMC Due
                </h3>
                <p className="text-xs text-slate-500">Track manufacturer warranties expiring soon</p>
              </div>

              {/* Warranty Days Filter */}
              <div className="flex items-center gap-1.5">
                {[
                  { id: '30', label: '30 Days' },
                  { id: '60', label: '60 Days' },
                  { id: '90', label: '90 Days' },
                  { id: 'all', label: 'All Alerts' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setWarrantyFilter(f.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                      warrantyFilter === f.id
                        ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {filteredWarranty.length > 0 ? (
                filteredWarranty.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        {item.name}
                        <span className="font-mono text-[10px] text-slate-400">({item.code})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Warranty End: {new Date(item.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      {item.days_left < 0 ? (
                        <Badge variant="danger">EXPIRED ({Math.abs(item.days_left)}d ago)</Badge>
                      ) : (
                        <Badge variant="warning">EXPIRES IN {item.days_left} DAYS</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  No assets with warranties expiring in this window.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Top Maintenance Cost Assets (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-rose-500" />
                Highest Maintenance Cost Assets
              </h3>
              <span className="text-xs text-rose-600 font-semibold">TCO Impact</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {topMaintenance.map((asset, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{asset.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {asset.code} • {asset.repairs} Service Jobs
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-600">{formatCurrency(asset.cost)}</div>
                    <span className="text-[10px] text-slate-400">Lifetime repairs</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssetAnalytics;
