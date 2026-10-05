import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle,
  FolderPlus,
  ArrowRight,
  TrendingUp,
  X,
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
import AddProjectModal from '../../components/projects/AddProjectModal';

export const ProjectDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  const handleProjectSaved = (newProject) => {
    setToastMessage(`Project "${newProject.name}" created and launched successfully!`);
    fetchProjects();
    setTimeout(() => setToastMessage(''), 5000);
  };

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
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-teal-500/40"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">{toastMessage}</span>
            <button
              onClick={() => setToastMessage('')}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Management & Engineering</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
              Live Sprints
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active milestones, sprint burn-down, task statuses, team bandwidth, and budget tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Calendar}
            onClick={() => setShowSprintModal(true)}
            id="sprint-board-button"
          >
            Sprint Board
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={PlusCircle}
            onClick={() => setShowProjectModal(true)}
            id="new-project-button"
            className="shadow-sm hover:shadow-teal-600/20"
          >
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
        <Card
          title="Active Sprint Projects"
          subtitle="Initiatives actively in development"
          noPadding
          action={
            <button
              onClick={() => setShowProjectModal(true)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <span>+ Add</span>
            </button>
          }
        >
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {activeProjects.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active projects found. Click "New Project" to launch one.
              </div>
            ) : (
              activeProjects.map((p) => (
                <div key={p.id} className="p-3 hover:bg-slate-50/60 text-xs transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-900 truncate max-w-[170px]" title={p.name}>
                      {p.name}
                    </span>
                    <span className="font-bold text-teal-600">{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-1.5">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[120px]">Client: {p.client}</span>
                    <span>Spent: {p.spent} / {p.budget}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Tasks */}
        <Card title="Recent Sprint Tasks" subtitle="Tasks recently updated by engineering team" noPadding>
          <div className="divide-y divide-slate-100">
            {recentTasks.map((t) => (
              <div key={t.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs transition-colors">
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
              <div key={d.id} className="p-3 hover:bg-slate-50/60 flex items-center justify-between text-xs transition-colors">
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

      {/* Add Project Modal Component */}
      <AddProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSaved={handleProjectSaved}
      />

      {/* Quick Sprint Board Modal */}
      {showSprintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Engineering Sprint Board (Current Sprint)</h3>
              </div>
              <button
                onClick={() => setShowSprintModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto bg-slate-50/50">
              {['Todo', 'In Progress', 'Review', 'Completed'].map((columnName, colIdx) => {
                const colorMap = {
                  'Todo': 'border-slate-300 bg-slate-100/70 text-slate-700',
                  'In Progress': 'border-blue-300 bg-blue-50 text-blue-700',
                  'Review': 'border-amber-300 bg-amber-50 text-amber-700',
                  'Completed': 'border-emerald-300 bg-emerald-50 text-emerald-700',
                };
                return (
                  <div key={colIdx} className="space-y-3">
                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center justify-between ${colorMap[columnName]}`}>
                      <span>{columnName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 font-mono">
                        {taskStatus?.find((s) => s.name === columnName)?.value || 0}
                      </span>
                    </div>

                    <div className="space-y-2 min-h-[140px] p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                      {recentTasks
                        .filter((t) => t.status.toLowerCase().includes(columnName.toLowerCase()) || (columnName === 'In Progress' && t.status === 'In Progress'))
                        .slice(0, 3)
                        .map((t) => (
                          <div key={t.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all text-xs space-y-1">
                            <span className="font-semibold text-slate-800 block truncate">{t.title}</span>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>{t.assignedTo}</span>
                              <Badge size="xs" variant={t.priority === 'Urgent' ? 'danger' : 'neutral'}>
                                {t.priority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-3 bg-white border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setShowSprintModal(false)}>
                Close Board
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
