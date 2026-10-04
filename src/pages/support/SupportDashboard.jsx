import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Mail,
  BookOpen,
  Filter,
} from 'lucide-react';
import supportService from '../../services/supportService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import TrendAreaChart from '../../components/charts/TrendAreaChart';
import DonutMetricChart from '../../components/charts/DonutMetricChart';

export const SupportDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSupport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await supportService.getDashboardData();
      setData(res);
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
    total_tickets = 0,
    open_tickets = 0,
    pending_tickets = 0,
    in_progress_tickets = 0,
    resolved_tickets = 0,
    closed_tickets = 0,
    urgent_tickets = 0,
    avg_response_time = '24 mins',
    avg_resolution_time = '3.4 hrs',
    sla_breaches = 0,
    sla_compliance_rate = 96.5,
    customer_satisfaction = '98.2%',
    unread_messages_count = 0,
    tickets_by_status = [],
    tickets_by_priority = [],
    volume_trend = [],
    agent_performance = [],
    recent_tickets = [],
  } = data;

  return (
    <div className="space-y-6">
      {/* Header and Quick Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support & Helpdesk Command</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time customer ticketing, SLA compliance velocity, contact messages, and knowledge base repository.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" icon={Mail} onClick={() => navigate('/app/support/contact-messages')}>
            Contact Messages {unread_messages_count > 0 && <span className="ml-1 px-1.5 py-0.2 bg-teal-500 text-white rounded-full text-[10px]">{unread_messages_count}</span>}
          </Button>
          <Button variant="secondary" size="sm" icon={Clock} onClick={() => navigate('/app/support/sla')}>
            SLA Policies
          </Button>
          <Button variant="secondary" size="sm" icon={BookOpen} onClick={() => navigate('/app/support/knowledge-base')}>
            Knowledge Base
          </Button>
          <Button variant="teal" size="sm" icon={PlusCircle} onClick={() => navigate('/app/support/tickets')}>
            Ticket Ledger
          </Button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Tickets"
          value={total_tickets}
          change="All-time ledger"
          isPositive={true}
          icon={LifeBuoy}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Open Queue"
          value={open_tickets}
          change="Awaiting Agent"
          isPositive={true}
          icon={AlertCircle}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="In Progress"
          value={in_progress_tickets}
          change="Active resolution"
          isPositive={true}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Resolved"
          value={resolved_tickets}
          change={`${sla_compliance_rate}% on-time`}
          isPositive={true}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Urgent / Critical"
          value={urgent_tickets}
          change="P1 High Priority"
          isPositive={false}
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
        <StatCard
          title="SLA Breaches"
          value={sla_breaches}
          change={`${sla_compliance_rate}% compliance`}
          isPositive={sla_breaches === 0}
          icon={ShieldAlert}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
      </div>

      {/* Secondary Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Avg Response Time</span>
            <h3 className="text-xl font-bold text-slate-900">{avg_response_time}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">● Within standard SLA target</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Avg Resolution Time</span>
            <h3 className="text-xl font-bold text-slate-900">{avg_resolution_time}</h3>
            <span className="text-[11px] text-slate-400">Mean time to resolve (MTTR)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Customer Satisfaction</span>
            <h3 className="text-xl font-bold text-slate-900">{customer_satisfaction}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">★ High CSAT rating</span>
          </div>
        </div>
      </div>

      {/* Charts Row: Trend & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Ticket Volume & Resolution Velocity"
          subtitle="Monthly volume of newly filed client issues vs resolved tickets"
          className="lg:col-span-2"
        >
          <TrendAreaChart
            data={volume_trend}
            dataKeyX="month"
            series={[
              { key: 'received', name: 'Tickets Received', color: '#1E293B' },
              { key: 'resolved', name: 'Tickets Resolved', color: '#0F8B7A' },
            ]}
            formatY={(v) => `${v}`}
          />
        </Card>

        <Card title="Tickets by Status" subtitle="Real-time case distribution">
          <DonutMetricChart
            data={tickets_by_status}
            dataKey="value"
            nameKey="name"
          />
        </Card>
      </div>

      {/* Specialist Performance Scorecards */}
      <Card title="Support Specialist Scorecards" subtitle="Agent resolution throughput and CSAT ratings">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {agent_performance.map((agent) => (
            <div key={agent.id || agent.name} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {agent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{agent.name}</h4>
                  <p className="text-[10px] text-slate-500">{agent.resolved} resolved / {agent.assigned} assigned</p>
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

      {/* Live Ticket Queue */}
      <Card
        title="Live Support Tickets Queue"
        subtitle="Recent tickets active in helpdesk"
        action={
          <Button variant="secondary" size="xs" onClick={() => navigate('/app/support/tickets')}>
            View Full Ledger
          </Button>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Ticket ID</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">SLA Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent_tickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400">
                    No active tickets in queue.
                  </td>
                </tr>
              ) : (
                recent_tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-teal-700">
                      {t.ticket_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.customer?.name || 'Enterprise Customer'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          t.priority === 'urgent'
                            ? 'danger'
                            : t.priority === 'high'
                            ? 'warning'
                            : t.priority === 'medium'
                            ? 'info'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          t.status === 'resolved' || t.status === 'closed'
                            ? 'success'
                            : t.status === 'in_progress'
                            ? 'info'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {t.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center text-[11px] font-medium ${
                          t.sla_status === 'breached'
                            ? 'text-rose-600 font-bold'
                            : t.sla_status === 'warning'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        ● {t.sla_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/app/support/tickets/${t.id}`)}
                        className="text-teal-600 hover:text-teal-800 font-semibold cursor-pointer inline-flex items-center gap-1"
                      >
                        Open <ArrowRight className="w-3 h-3" />
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

export default SupportDashboard;
