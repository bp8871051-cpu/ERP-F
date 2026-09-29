import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Target,
  Briefcase,
  TrendingUp,
  DollarSign,
  UserCheck,
  Tag,
  PhoneCall,
  Search,
  Plus,
  RefreshCw,
  Award,
  ChevronRight,
  Send,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Layers,
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
import crmService from '../../services/crmService';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import CrmSearchModal from './CrmSearchModal';
import { LogCallModal, ScheduleMeetingModal } from './Activities/ActivityModals';

export const CrmDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmService.getDashboardData();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching CRM dashboard:', err);
      setError('Unable to load CRM dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const { cards, charts, recent_deals = [], recent_leads = [] } = data;

  // Format currency in Indian Rupees format or USD
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const campaignMetrics = [
    { label: 'Sent', value: charts.campaign_performance?.sent || 0, color: '#334155' },
    { label: 'Delivered', value: charts.campaign_performance?.delivered || 0, color: '#0F8B7A' },
    { label: 'Opened', value: charts.campaign_performance?.opened || 0, color: '#2563EB' },
    { label: 'Clicked', value: charts.campaign_performance?.clicked || 0, color: '#8B5CF6' },
    { label: 'Converted', value: charts.campaign_performance?.converted || 0, color: '#10B981' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-teal-600" />
            CRM Enterprise Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative sales pipeline, lead conversion funnel, campaign velocity, and activity analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Search}
            onClick={() => setSearchOpen(true)}
          >
            Quick Search
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={PhoneCall}
            onClick={() => setCallOpen(true)}
          >
            Log Call
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Calendar}
            onClick={() => setMeetingOpen(true)}
          >
            Schedule
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/app/crm/leads')}
          >
            New Lead
          </Button>
          <button
            onClick={fetchDashboard}
            title="Refresh statistics"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top 10 CRM KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Contacts"
          value={cards.total_contacts?.toLocaleString()}
          subtitle="Directory accounts"
          icon={Users}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Total Leads"
          value={cards.total_leads?.toLocaleString()}
          subtitle={`${cards.new_leads || 0} new inquiries`}
          icon={Target}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Qualified Leads"
          value={cards.qualified_leads?.toLocaleString()}
          subtitle="Ready for Proposal"
          icon={UserCheck}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Open Deals"
          value={cards.open_deals?.toLocaleString()}
          subtitle="Active discussions"
          icon={Layers}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Won Deals"
          value={cards.won_deals?.toLocaleString()}
          subtitle={formatCurrency(cards.won_revenue)}
          icon={Award}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Lost Deals"
          value={cards.lost_deals?.toLocaleString()}
          subtitle="Archived opportunities"
          icon={Briefcase}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(cards.pipeline_value)}
          subtitle="Total open contract size"
          icon={DollarSign}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Expected Revenue"
          value={formatCurrency(cards.expected_revenue)}
          subtitle="Probability weighted"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Conversion Rate"
          value={`${cards.conversion_rate}%`}
          subtitle="Lead-to-Won velocity"
          icon={Target}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Active Campaigns"
          value={cards.active_campaigns}
          subtitle="Multi-channel initiatives"
          icon={Tag}
          iconColor="text-pink-600"
          iconBg="bg-pink-50"
        />
      </div>

      {/* 3. Charts Row 1: Lead Conversion Funnel & Pipeline Monthly Value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Lead Conversion Funnel */}
        <Card
          title="Lead Conversion Funnel"
          subtitle="Visitors → Leads → Qualified → Opportunity → Won drop-off"
        >
          <div className="space-y-3.5 mt-2">
            {charts.lead_funnel?.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.stage}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 text-[11px]">
                      {item.percentage}%
                    </span>
                    <span className="font-bold text-slate-900 min-w-12 text-right">
                      {item.count?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(6, Math.min(100, item.percentage))}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chart 2: Sales Pipeline Value (Monthly) */}
        <Card
          title="Sales Pipeline Value"
          subtitle="Monthly cumulative contract value of created opportunities"
        >
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthly_pipeline_value} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickFormatter={(v) => (v >= 100000 ? `${(v / 100000).toFixed(0)}L` : `${v}`)}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Pipeline Value']}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="pipeline_value" fill="#0F8B7A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 4. Charts Row 2: Leads by Source (Donut) & Deals by Stage (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Leads by Source */}
        <Card
          title="Leads by Source"
          subtitle="Acquisition channels: Web, Social, Ads, Referrals"
        >
          <div className="h-60 mt-1 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.leads_by_source}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {charts.leads_by_source?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0F8B7A'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Leads`, name]}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 text-[11px]">
              {charts.leads_by_source?.slice(0, 6).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Chart 4: Deals by Stage */}
        <Card
          title="Deals by Stage"
          subtitle="Active pipeline volume distributed across stages"
          className="lg:col-span-2"
        >
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.deals_by_stage} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val, name, item) => [
                    `${val} deals (${formatCurrency(item.payload.value)})`,
                    'Stage Count',
                  ]}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {charts.deals_by_stage?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0F8B7A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 5. Charts Row 3: Revenue Trend (Expected vs Actual) & Lead Conversion Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: Revenue Trend */}
        <Card
          title="Monthly Revenue Trend"
          subtitle="Expected probability revenue vs actual closed won revenue"
        >
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenue_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F8B7A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0F8B7A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
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
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => (value === 'actual_revenue' ? 'Actual Won Revenue' : 'Expected Revenue')}
                />
                <Area
                  type="monotone"
                  dataKey="actual_revenue"
                  stroke="#0F8B7A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
                <Area
                  type="monotone"
                  dataKey="expected_revenue"
                  stroke="#2563EB"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorExpected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 6: Lead Conversion Trend */}
        <Card
          title="Lead Conversion Trend"
          subtitle="Monthly conversion percentage from inbound inquiry to won deal"
        >
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.conversion_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
                <Tooltip
                  formatter={(val, name, item) => [
                    `${val}% (${item.payload.conversions} / ${item.payload.leads} leads)`,
                    'Conversion Rate',
                  ]}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="conversion_percentage"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8B5CF6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 6. Charts Row 4: Campaign Performance & Sales Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 7: Campaign Performance */}
        <Card
          title="Campaign Engagement Metrics"
          subtitle="Aggregate performance: Sent, Delivered, Opened, Clicked, Converted"
        >
          <div className="grid grid-cols-5 gap-2 my-4 text-center">
            {campaignMetrics.map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                  {m.label}
                </span>
                <span className="text-base font-bold text-slate-800" style={{ color: m.color }}>
                  {m.value?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 mt-4 text-xs">
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Delivery Rate</span>
              <span className="font-semibold text-slate-800">
                {charts.campaign_performance?.sent > 0
                  ? ((charts.campaign_performance.delivered / charts.campaign_performance.sent) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full"
                style={{
                  width: `${
                    charts.campaign_performance?.sent > 0
                      ? (charts.campaign_performance.delivered / charts.campaign_performance.sent) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex justify-between text-slate-500 text-[11px] pt-1">
              <span>Open to Conversion Rate</span>
              <span className="font-semibold text-slate-800">
                {charts.campaign_performance?.opened > 0
                  ? ((charts.campaign_performance.converted / charts.campaign_performance.opened) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{
                  width: `${
                    charts.campaign_performance?.opened > 0
                      ? (charts.campaign_performance.converted / charts.campaign_performance.opened) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </Card>

        {/* Chart 8: Sales Activity */}
        <Card
          title="Sales Activity Distribution"
          subtitle="Team touchpoints logged across Calls, Emails, Meetings, Notes, Tasks"
        >
          <div className="h-60 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.sales_activity} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip
                  formatter={(val) => [`${val} logged events`, 'Total Activity']}
                  contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {charts.sales_activity?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0F8B7A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 7. Tables Row: Recent Deals & Inbound Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <Card
          title="Recent Pipeline Deals"
          subtitle="Latest opportunities negotiated"
          action={
            <Button
              variant="secondary"
              size="xs"
              onClick={() => navigate('/app/crm/deals')}
            >
              View All
            </Button>
          }
          noPadding
        >
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recent_deals.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No deals logged.</div>
            ) : (
              recent_deals.map((d) => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/app/crm/deals/${d.id}`)}
                  className="p-3.5 hover:bg-slate-50/70 flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-semibold text-slate-800 block truncate hover:text-teal-600">
                      {d.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {d.customer?.name || 'Enterprise Client'} • {d.owner?.name || 'Owner'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 block">
                      {formatCurrency(d.value)}
                    </span>
                    <Badge variant={d.status === 'won' ? 'success' : d.status === 'lost' ? 'danger' : 'teal'} size="sm">
                      {d.stage?.name || d.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Inbound Leads */}
        <Card
          title="Recent Inbound Leads"
          subtitle="New prospects registered for qualification"
          action={
            <Button
              variant="secondary"
              size="xs"
              onClick={() => navigate('/app/crm/leads')}
            >
              View All
            </Button>
          }
          noPadding
        >
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recent_leads.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No leads registered.</div>
            ) : (
              recent_leads.map((l) => (
                <div
                  key={l.id}
                  onClick={() => navigate(`/app/crm/leads/${l.id}`)}
                  className="p-3.5 hover:bg-slate-50/70 flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-semibold text-slate-800 block truncate hover:text-teal-600">
                      {l.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {l.company_name || 'Prospect'} • Source: {l.lead_source?.name || 'Web'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-teal-700 block">Score: {l.score}</span>
                    <Badge variant={l.score >= 80 ? 'danger' : l.score >= 60 ? 'warning' : 'neutral'} size="sm">
                      {l.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <CrmSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <LogCallModal isOpen={callOpen} onClose={() => setCallOpen(false)} onSuccess={fetchDashboard} />
      <ScheduleMeetingModal isOpen={meetingOpen} onClose={() => setMeetingOpen(false)} onSuccess={fetchDashboard} />
    </div>
  );
};

export default CrmDashboard;
