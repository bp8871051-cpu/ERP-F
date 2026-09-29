import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ListTodo,
  PlusCircle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import projectService from '../../services/projectService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import BarMetricChart from '../../components/charts/BarMetricChart';
import DonutMetricChart from '../../components/charts/DonutMetricChart';

export const ProjectDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectService.getDashboardData();
      setData(res.data);
    } catch (err) {
      console.error('Error fetching project dashboard:', err);
      setError('Unable to load project telemetry and milestone tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={fetchProjects} />;

  const {
    metrics,
    projectProgress,
    taskStatus,
    teamWorkload,
    projectBudget,
    activeProjects,
    recentTasks,
    upcomingDeadlines,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Management & Engineering</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active milestones, sprint burn-down, task statuses, team bandwidth, and budget tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Calendar}>
            Sprint Board
          </Button>
          <Button variant="teal" size="sm" icon={PlusCircle}>
            New Project
          </Button>
        </div>
      </div>

      {/* 6 Key Project Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Projects"
          value={metrics.totalProjects}
          subtitle="Portfolio count"
          icon={FolderKanban}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Active Projects"
          value={metrics.activeProjects}
          change="On Schedule"
          isPositive={true}
          icon={Layers}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Completed"
          value={metrics.completedProjects}
          change="+1 this sprint"
          isPositive={true}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Overdue"
          value={metrics.overdueProjects}
          change="Action Required"
          isPositive={false}
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
        <StatCard
          title="Team Members"
          value={metrics.teamMembers}
          subtitle="Engineers & leads"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Total Tasks"
          value={metrics.totalTasks}
          subtitle="Across sprints"
          icon={ListTodo}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts Row 1: Task Status Breakdown + Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Task Status Breakdown" subtitle="Distribution across Todo, In Progress, Review, Completed">
          <DonutMetricChart
            data={taskStatus}
            dataKey="value"
            nameKey="name"
          />
        </Card>

        <Card
          title="Team Member Workload Allocation"
          subtitle="Active sprint task commitments vs engineer capacity"
          className="lg:col-span-2"
        >
          <div className="space-y-3 mt-2">
            {teamWorkload.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{m.name}</span>
                  <span className="text-slate-500 font-medium">
                    {m.activeTasks} in-progress • {m.completed} done ({m.capacity} capacity)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all duration-500"
                    style={{ width: m.capacity }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2: Project Budget vs Spent */}
      <Card title="Project Budget vs Actual Expenditure" subtitle="Capital allocation versus burn-rate">
        <BarMetricChart
          data={projectBudget}
          dataKeyX="project"
          bars={[
            { key: 'budget', name: 'Allocated Budget ($)', color: '#1E293B' },
            { key: 'spent', name: 'Actual Burned ($)', color: '#0F8B7A' },
          ]}
          formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
      </Card>

      {/* Sections: Active Projects + Recent Tasks + Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Table */}
        <Card title="Active Sprint Projects" subtitle="Initiatives actively in development" noPadding>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {activeProjects.map((p) => (
              <div key={p.id} className="p-3 hover:bg-slate-50/60 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-900 truncate max-w-[170px]">{p.name}</span>
                  <span className="font-bold text-teal-600">{p.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-1.5">
                  <div className="h-full rounded-full bg-teal-600" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Client: {p.client}</span>
                  <span>Spent: {p.spent} / {p.budget}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Tasks */}
        <Card title="Recent Sprint Tasks" subtitle="Tasks recently updated by engineering team" noPadding>
          <div className="divide-y divide-slate-100">
            {recentTasks.map((t) => (
              <div key={t.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block truncate max-w-[150px]">{t.title}</span>
                  <span className="text-[10px] text-slate-400">{t.assignedTo} • Due: {t.dueDate}</span>
                </div>
                <Badge variant={t.priority === 'Urgent' ? 'danger' : t.priority === 'High' ? 'warning' : 'teal'} size="sm">
                  {t.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card title="Critical Milestone Deadlines" subtitle="Upcoming delivery and audit gates" noPadding>
          <div className="divide-y divide-slate-100">
            {upcomingDeadlines.map((d) => (
              <div key={d.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">{d.task}</span>
                  <span className="text-[10px] text-slate-400">{d.project} • {d.date}</span>
                </div>
                <Badge variant={d.urgency === 'critical' ? 'danger' : d.urgency === 'high' ? 'warning' : 'neutral'} size="sm">
                  {d.urgency.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDashboard;
