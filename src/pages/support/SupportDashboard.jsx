import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  PlusCircle,
  UserCheck,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import supportService from '../../services/supportService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import TrendAreaChart from '../../components/charts/TrendAreaChart';
import BarMetricChart from '../../components/charts/BarMetricChart';
import DonutMetricChart from '../../components/charts/DonutMetricChart';

export const SupportDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSupport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await supportService.getDashboardData();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching support dashboard:', err);
      setError('Unable to load customer support helpdesk metrics from the API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupport();
  }, []);

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={fetchSupport} />;

  const {
    metrics,
    ticketTrend,
    ticketCategories,
    agentPerformance,
    recentTickets,
    urgentTickets,
    recentCustomerRequests,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Support & Helpdesk</h1>
          <p className="text-xs text-slate-500 mt-1">
            24/7 client ticket resolution, SLA compliance velocity, agent scorecards, and incident escalations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Clock}>
            SLA Policies
          </Button>
          <Button variant="teal" size="sm" icon={PlusCircle}>
            New Ticket
          </Button>
        </div>
      </div>

      {/* 6 Key Support Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Tickets"
          value={metrics.totalTickets}
          change="+12% volume"
          isPositive={true}
          changeLabel="vs last month"
          icon={LifeBuoy}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Open Tickets"
          value={metrics.openTickets}
          change="Queue Healthy"
          isPositive={true}
          icon={AlertCircle}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Pending Tickets"
          value={metrics.pendingTickets}
          subtitle="Waiting on client"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Resolved"
          value={metrics.resolvedTickets}
          change="97.4% SLA"
          isPositive={true}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Urgent / Critical"
          value={metrics.urgentTickets}
          change="Tier 1 Attention"
          isPositive={false}
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
        <StatCard
          title="Avg Response Time"
          value={metrics.averageResponseTime}
          change="-4m faster"
          isPositive={true}
          icon={Zap}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Charts Row 1: Ticket Inflow vs Resolution Trend + Categories Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Ticket Inflow vs Resolution Velocity"
          subtitle="Monthly volume of newly filed issues vs resolved tickets"
          className="lg:col-span-2"
        >
          <TrendAreaChart
            data={ticketTrend}
            dataKeyX="month"
            series={[
              { key: 'received', name: 'Tickets Received', color: '#1E293B' },
              { key: 'resolved', name: 'Tickets Resolved', color: '#0F8B7A' },
            ]}
            formatY={(v) => `${v}`}
          />
        </Card>

        <Card title="Tickets by Category" subtitle="Distribution of support case topics">
          <DonutMetricChart
            data={ticketCategories}
            dataKey="value"
            nameKey="name"
          />
        </Card>
      </div>

      {/* Agent Performance Leaderboard */}
      <Card title="Support Specialist Scorecards" subtitle="Agent resolution throughput and CSAT ratings">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {agentPerformance.map((agent, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{agent.name}</h4>
                  <p className="text-[10px] text-slate-500">{agent.resolved} tickets closed</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">CSAT Score:</span>
                <span className="font-bold text-emerald-700">{agent.satisfaction}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Avg First Response:</span>
                <span className="font-bold text-slate-800">{agent.avgTime}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sections: Recent Tickets + Urgent Tickets + Recent Customer Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <Card title="Live Support Queue" subtitle="Latest ticket updates" noPadding>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recentTickets.map((t) => (
              <div key={t.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block truncate max-w-[150px]">{t.subject}</span>
                  <span className="text-[10px] text-slate-400">{t.ticketNumber} • {t.customer}</span>
                </div>
                <div className="text-right">
                  <Badge variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'neutral'} size="sm">
                    {t.priority}
                  </Badge>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Urgent Tickets */}
        <Card title="Urgent & Critical Escalations" subtitle="Tickets requiring immediate management intervention" noPadding>
          <div className="divide-y divide-slate-100">
            {urgentTickets.map((ut) => (
              <div key={ut.id} className="p-3 hover:bg-slate-50/60 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-rose-700">{ut.ticketNumber}</span>
                  <Badge variant="danger" size="sm">
                    {ut.priority}
                  </Badge>
                </div>
                <p className="font-semibold text-slate-800 line-clamp-1">{ut.subject}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Client: {ut.customer}</span>
                  <span>{ut.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Customer Requests */}
        <Card title="Recent Client Service Requests" subtitle="Direct feature or expansion tickets" noPadding>
          <div className="divide-y divide-slate-100">
            {recentCustomerRequests.map((req) => (
              <div key={req.id} className="p-3 hover:bg-slate-50/60 text-xs">
                <span className="font-semibold text-slate-800 block mb-0.5">{req.request}</span>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{req.customer}</span>
                  <span>{req.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SupportDashboard;
