import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, CreditCard, TrendingUp, Calendar, AlertTriangle, 
  CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, RefreshCw,
  Sparkles, Layers, DollarSign, Clock, ShieldCheck, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import membershipService from '../../services/membershipService';
import { Link } from 'react-router-dom';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function MembershipDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await membershipService.getDashboardData();
      setData(res);
    } catch (err) {
      console.error('Error fetching membership dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = data?.stats || {
    total_members: 0,
    active_members: 0,
    new_members: 0,
    expiring_soon: 0,
    expired_members: 0,
    cancelled_members: 0,
    mrr: 0,
    total_revenue: 0,
    renewal_rate: '0%',
    churn_rate: '0%'
  };

  const revenueTrend = data?.charts?.revenue_trend || [
    { month: 'May', revenue: 4200, mrr: 3800 },
    { month: 'Jun', revenue: 5600, mrr: 4500 },
    { month: 'Jul', revenue: 7100, mrr: 6200 },
    { month: 'Aug', revenue: 8400, mrr: 7500 },
    { month: 'Sep', revenue: 10200, mrr: 9100 },
    { month: 'Oct', revenue: 12500, mrr: 11000 },
  ];

  const planDistribution = data?.charts?.plan_distribution || [
    { name: 'Professional', value: 45 },
    { name: 'Enterprise', value: 30 },
    { name: 'Starter', value: 20 },
    { name: 'Custom', value: 5 },
  ];

  const growthTrend = data?.charts?.membership_growth || [
    { month: 'May', members: 45, churned: 2 },
    { month: 'Jun', members: 62, churned: 3 },
    { month: 'Jul', members: 88, churned: 4 },
    { month: 'Aug', members: 115, churned: 3 },
    { month: 'Sep', members: 142, churned: 5 },
    { month: 'Oct', members: 178, churned: 4 },
  ];

  const expiringMembers = data?.expiring_soon_members || [];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Membership & Subscription Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time subscription metrics, MRR recurring cashflow, retention cohorts, and member lifecycle tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link
            to="/app/membership/members"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Users className="w-3.5 h-3.5" /> View Members
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* MRR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Monthly Recurring (MRR)</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-slate-900">${Number(stats.mrr || 0).toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +14.2% from last month
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Subscribers</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">{stats.active_members}</div>
          <div className="text-[11px] text-slate-500">Out of {stats.total_members} total registered</div>
        </div>

        {/* Renewal Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Renewal Rate</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><RefreshCw className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.renewal_rate}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Industry high retention</div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Expiring (Next 30 Days)</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.expiring_soon}</div>
          <div className="text-[11px] text-amber-700 font-medium">Automatic reminders sent</div>
        </div>

        {/* Churn Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Churn Rate</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><XCircle className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.churn_rate}</div>
          <div className="text-[11px] text-slate-400">Cancelled: {stats.cancelled_members} members</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue & MRR Cashflow Trend</h3>
              <p className="text-xs text-slate-500">Monthly breakdown of gross collections vs recurring subscription revenue</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">Last 6 Months</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="mrr" name="MRR" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Plan Distribution</h3>
              <p className="text-xs text-slate-500">Active subscriptions by tier</p>
            </div>
            <PieChartIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row: Growth vs Churn & Expiring Soon Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth vs Churn Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Member Growth & Churn Cohort</h3>
            <p className="text-xs text-slate-500">Net subscriber additions compared to voluntary cancellations</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="members" name="Active Members" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churned" name="Churned" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expiring Soon Watchlist */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Expiring Subscriptions Watchlist</h3>
              <p className="text-xs text-slate-500">Members due for renewal within the next 30 days</p>
            </div>
            <Link 
              to="/app/membership/members" 
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Manage all →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Billing Cycle</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringMembers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      No memberships currently expiring in the next 30 days.
                    </td>
                  </tr>
                ) : (
                  expiringMembers.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">
                        {m.customer?.name || m.customer_name || 'Client #'+m.customer_id}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                          {m.plan?.name || m.plan_name || 'Standard'}
                        </span>
                      </td>
                      <td className="p-3 capitalize">{m.billing_cycle || 'Yearly'}</td>
                      <td className="p-3 font-medium text-amber-700">
                        {m.expires_at ? new Date(m.expires_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3">
                        <Link
                          to={`/app/membership/members`}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition"
                        >
                          Renew
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
