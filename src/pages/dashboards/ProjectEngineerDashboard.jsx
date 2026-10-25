import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  FileCheck2,
  Package,
  Layers,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Eye,
  Check,
  X,
  ChevronRight,
  ExternalLink,
  Activity,
  HardHat,
  Sliders,
  FileText,
  AlertOctagon,
  Timer,
  FileUp,
  MapPin,
  Users
} from 'lucide-react';
import { roleDashboardService } from '../../services/roleDashboardService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';

export default function ProjectEngineerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Tabs / Filters
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'tasks' | 'milestones' | 'reviews' | 'site_reports' | 'material_requests' | 'issues' | 'timesheets'
  const [taskFilter, setTaskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalType, setModalType] = useState(null); // 'update_task' | 'site_report' | 'issue' | 'material_req' | 'timesheet' | 'tech_review'
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [taskForm, setTaskForm] = useState({ task_id: '', status: 'in_progress', notes: '' });
  const [reportForm, setReportForm] = useState({
    project_id: '',
    report_date: new Date().toISOString().split('T')[0],
    work_completed: '',
    site_conditions: 'Normal working conditions (Dry, 28°C)',
    blockers: '',
    manpower_count: 5,
  });
  const [issueForm, setIssueForm] = useState({
    project_id: '',
    title: '',
    description: '',
    severity: 'medium',
    mitigation_plan: '',
  });
  const [materialForm, setMaterialForm] = useState({
    project_id: '',
    warehouse_id: '',
    priority: 'high',
    required_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    site_location: 'Main Plant Erection Site',
    notes: '',
    product_id: '',
    quantity: 10,
    item_notes: '',
  });
  const [timesheetForm, setTimesheetForm] = useState({
    project_id: '',
    date: new Date().toISOString().split('T')[0],
    hours: 8,
    description: 'Engineering site supervision, structural inspection and alignment.',
  });
  const [reviewForm, setReviewForm] = useState({
    project_id: '',
    title: '',
    deliverable_type: 'drawing',
    version: '1.0',
    submission_notes: 'Civil engineering structural foundation drawings ready for review.',
  });

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await roleDashboardService.projectEngineer.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load Project Engineer dashboard:', err);
      setError(err.response?.data?.message || 'Unable to connect to Project Engineer API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Quick Action Handlers
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.projectEngineer.updateTask(taskForm);
      showToast(res.message || 'Task updated successfully');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProgressReport = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.projectEngineer.submitProgressReport(reportForm);
      showToast(res.message || 'Daily Site Progress Report submitted');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordIssue = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.projectEngineer.recordIssue(issueForm);
      showToast(res.message || 'Engineering issue logged');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log issue', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitMaterialRequest = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        project_id: materialForm.project_id,
        warehouse_id: materialForm.warehouse_id || undefined,
        priority: materialForm.priority,
        required_date: materialForm.required_date,
        site_location: materialForm.site_location,
        notes: materialForm.notes,
        items: [
          {
            product_id: materialForm.product_id,
            quantity: Number(materialForm.quantity),
            notes: materialForm.item_notes,
          },
        ],
      };
      const res = await roleDashboardService.projectEngineer.submitMaterialRequest(payload);
      showToast(res.message || 'Material request submitted to Store Executive');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit material request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnterTimesheet = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.projectEngineer.enterTimesheet(timesheetForm);
      showToast(res.message || 'Engineering hours logged successfully');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log timesheet', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTechnicalReview = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.projectEngineer.submitTechnicalReview(reviewForm);
      showToast(res.message || 'Deliverable submitted for technical review');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton type="card" count={8} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <ErrorState
          title="Project Engineer Dashboard Error"
          message={error}
          onRetry={() => fetchDashboard(false)}
        />
      </div>
    );
  }

  const { cards = {}, sections = {}, lookups = {} } = data || {};
  const {
    my_assigned_projects = [],
    my_tasks_and_deadlines = [],
    upcoming_milestones = [],
    technical_review_queue = [],
    site_progress_reports = [],
    pending_material_requests = [],
    project_issues_and_risks = [],
    timesheet_summary = { total_hours: 0, entries: [] },
    recent_activities = [],
  } = sections;

  // Task filtering
  const filteredTasks = my_tasks_and_deadlines.filter((task) => {
    const matchesSearch =
      (task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.project?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = taskFilter === 'all' || task.status === taskFilter;
    return matchesSearch && matchesFilter;
  });

  const getTaskStatusBadge = (status) => {
    switch (status) {
      case 'completed':
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <Check className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-300 dark:border-sky-800">
            <Clock className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            On Hold
          </span>
        );
      case 'pending':
      case 'todo':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
              toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
              Engineering & Site Operations
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Project Engineer Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Assigned project execution, site daily progress, engineering milestones, and material requisition tracking.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => {
              setReportForm({
                project_id: lookups.projects?.[0]?.id || '',
                report_date: new Date().toISOString().split('T')[0],
                work_completed: '',
                site_conditions: 'Normal working conditions (Dry, 28°C)',
                blockers: '',
                manpower_count: 5,
              });
              setModalType('site_report');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            Submit Site Report
          </button>

          <button
            onClick={() => {
              setMaterialForm({
                project_id: lookups.projects?.[0]?.id || '',
                warehouse_id: lookups.warehouses?.[0]?.id || '',
                priority: 'high',
                required_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
                site_location: 'Site Location A',
                notes: '',
                product_id: lookups.products?.[0]?.id || '',
                quantity: 10,
                item_notes: '',
              });
              setModalType('material_req');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
          >
            <Package className="w-4 h-4" />
            Request Material
          </button>
        </div>
      </div>

      {/* 8 Dashboard Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Assigned Projects */}
        <div
          onClick={() => setActiveTab('projects')}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Assigned Projects</span>
            <FolderGit2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {cards.assigned_projects ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Active sites</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Total Tasks */}
        <div
          onClick={() => {
            setActiveTab('tasks');
            setTaskFilter('all');
          }}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {cards.total_assigned_tasks ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Assigned queue</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => {
            setActiveTab('tasks');
            setTaskFilter('in_progress');
          }}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">In Progress</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400">
            {cards.tasks_in_progress ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Work underway</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Tasks Pending */}
        <div
          onClick={() => {
            setActiveTab('tasks');
            setTaskFilter('pending');
          }}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {cards.tasks_pending ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>To be started</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {cards.overdue_tasks ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Past deadline</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div
          onClick={() => setActiveTab('milestones')}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Milestones</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
            {cards.upcoming_milestones ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Deliverables</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Pending Technical Reviews */}
        <div
          onClick={() => setActiveTab('reviews')}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Tech Reviews</span>
            <FileCheck2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
            {cards.pending_technical_reviews ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>In evaluation</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Pending Material Requests */}
        <div
          onClick={() => setActiveTab('material_requests')}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Material Reqs</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {cards.pending_material_requests ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Awaiting Store issue</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-sm font-medium">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'projects'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          Assigned Projects ({my_assigned_projects.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'tasks'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Tasks & Deadlines ({my_tasks_and_deadlines.length})
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'milestones'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Milestones ({upcoming_milestones.length})
        </button>

        <button
          onClick={() => setActiveTab('site_reports')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'site_reports'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          Site Progress Reports ({site_progress_reports.length})
        </button>

        <button
          onClick={() => setActiveTab('material_requests')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'material_requests'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Package className="w-4 h-4" />
          Material Requests ({pending_material_requests.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'reviews'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          Technical Reviews ({technical_review_queue.length})
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'issues'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Issues & Risks ({project_issues_and_risks.length})
        </button>

        <button
          onClick={() => setActiveTab('timesheets')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'timesheets'
              ? 'border-sky-600 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Timer className="w-4 h-4" />
          Timesheet ({timesheet_summary.total_hours} hrs)
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Tab contents */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: MY ASSIGNED PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {my_assigned_projects.length === 0 ? (
                  <div className="col-span-2 p-12 text-center text-slate-400 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                    <FolderGit2 className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <p className="font-medium text-slate-700 dark:text-slate-300">No projects currently assigned.</p>
                  </div>
                ) : (
                  my_assigned_projects.map((proj) => {
                    const taskList = proj.tasks || [];
                    const completedTasks = taskList.filter((t) => ['completed', 'done'].includes(t.status)).length;
                    const progressPercent = taskList.length > 0 ? Math.round((completedTasks / taskList.length) * 100) : 35;

                    return (
                      <div
                        key={proj.id}
                        className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                              {proj.code || `PRJ-${proj.id}`}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{proj.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Client: {proj.client?.name || 'In-House'}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 capitalize">
                            {proj.status || 'Active'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                            <span>Engineering Progress</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick Metrics */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Tasks</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {completedTasks}/{taskList.length}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Milestones</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {proj.milestones?.length || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Deadline</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {proj.end_date ? new Date(proj.end_date).toLocaleDateString() : 'Q4 2026'}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setReportForm((prev) => ({ ...prev, project_id: proj.id }));
                              setModalType('site_report');
                            }}
                            className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> Site Report
                          </button>
                          <button
                            onClick={() => {
                              setMaterialForm((prev) => ({ ...prev, project_id: proj.id }));
                              setModalType('material_req');
                            }}
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                          >
                            <Package className="w-3.5 h-3.5" /> Request Parts
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TASKS AND DEADLINES */}
          {activeTab === 'tasks' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Assigned Engineering Tasks
                  </h2>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search task title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Check className="w-12 h-12 mx-auto mb-3 text-emerald-500/70" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No tasks found matching criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Task Title</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 dark:text-white">{task.title}</div>
                            {task.description && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{task.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {task.project?.name || 'General Project'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Open'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                              {task.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{getTaskStatusBadge(task.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setTaskForm({
                                  task_id: task.id,
                                  status: task.status === 'in_progress' ? 'completed' : 'in_progress',
                                  notes: '',
                                });
                                setModalType('update_task');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-600 text-white hover:bg-sky-700 transition"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UPCOMING MILESTONES */}
          {activeTab === 'milestones' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Upcoming Engineering Milestones
                  </h2>
                </div>
              </div>

              {upcoming_milestones.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No pending milestones.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Milestone Title</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {upcoming_milestones.map((ms) => (
                        <tr key={ms.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {ms.title}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {ms.project?.name || 'Project'}
                          </td>
                          <td className="px-4 py-3 font-medium text-purple-600 dark:text-purple-400">
                            {ms.due_date ? new Date(ms.due_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                            {ms.status || 'Pending'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SITE PROGRESS REPORTS */}
          {activeTab === 'site_reports' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Site Progress Daily Logs
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setReportForm({
                      project_id: lookups.projects?.[0]?.id || '',
                      report_date: new Date().toISOString().split('T')[0],
                      work_completed: '',
                      site_conditions: 'Normal working conditions (Dry, 28°C)',
                      blockers: '',
                      manpower_count: 5,
                    });
                    setModalType('site_report');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Submit Log
                </button>
              </div>

              {site_progress_reports.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No site reports submitted yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {site_progress_reports.map((sr) => (
                    <div key={sr.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {sr.project?.name || 'Project'} • {new Date(sr.report_date).toLocaleDateString()}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          Crew size: {sr.manpower_count || 1} people
                        </span>
                      </div>
                      <p className="mt-1 text-slate-700 dark:text-slate-300 font-medium">
                        {sr.work_completed}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Weather: {sr.site_conditions || 'Clear'}</span>
                        {sr.blockers && <span className="text-rose-500 font-semibold">Blockers: {sr.blockers}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MATERIAL REQUESTS */}
          {activeTab === 'material_requests' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Site Material Requests Sent to Store Executive
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setMaterialForm({
                      project_id: lookups.projects?.[0]?.id || '',
                      warehouse_id: lookups.warehouses?.[0]?.id || '',
                      priority: 'high',
                      required_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
                      site_location: 'Site Location A',
                      notes: '',
                      product_id: lookups.products?.[0]?.id || '',
                      quantity: 10,
                      item_notes: '',
                    });
                    setModalType('material_req');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Requisition
                </button>
              </div>

              {pending_material_requests.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No material requests logged.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Request #</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Warehouse</th>
                        <th className="px-4 py-3">Required By</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pending_material_requests.map((mr) => (
                        <tr key={mr.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                            {mr.request_number}
                          </td>
                          <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">
                            {mr.project?.name || 'Project Site'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {mr.warehouse?.name || 'Central Store'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {mr.required_date ? new Date(mr.required_date).toLocaleDateString() : 'Urgent'}
                          </td>
                          <td className="px-4 py-3 capitalize font-bold text-rose-600">
                            {mr.priority}
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {mr.status?.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TECHNICAL REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-teal-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Technical Reviews & Engineering Submittals
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setReviewForm({
                      project_id: lookups.projects?.[0]?.id || '',
                      title: '',
                      deliverable_type: 'drawing',
                      version: '1.0',
                      submission_notes: '',
                    });
                    setModalType('tech_review');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Submit Deliverable
                </button>
              </div>

              {technical_review_queue.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <FileCheck2 className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No technical reviews in queue.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Document / Deliverable</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Version</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {technical_review_queue.map((tr) => (
                        <tr key={tr.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 dark:text-white">{tr.title}</div>
                            <div className="text-[11px] text-slate-400">{tr.submission_notes}</div>
                          </td>
                          <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">
                            {tr.deliverable_type}
                          </td>
                          <td className="px-4 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                            v{tr.version}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {tr.project?.name || 'Project'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                              {tr.status?.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ISSUES & RISKS */}
          {activeTab === 'issues' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Site Engineering Issues & Risks
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIssueForm({
                      project_id: lookups.projects?.[0]?.id || '',
                      title: '',
                      description: '',
                      severity: 'medium',
                      mitigation_plan: '',
                    });
                    setModalType('issue');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Issue
                </button>
              </div>

              {project_issues_and_risks.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Check className="w-12 h-12 mx-auto mb-3 text-emerald-500/70" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No active engineering issues.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Issue Title</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Severity</th>
                        <th className="px-4 py-3">Mitigation Plan</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {project_issues_and_risks.map((iss) => (
                        <tr key={iss.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 dark:text-white">{iss.title}</div>
                            <div className="text-[11px] text-slate-400">{iss.description}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {iss.project?.name || 'Project'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="capitalize font-bold text-rose-600">{iss.severity}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {iss.mitigation_plan || 'Under review'}
                          </td>
                          <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">
                            {iss.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: TIMESHEETS */}
          {activeTab === 'timesheets' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    My Engineering Timesheet Log ({timesheet_summary.total_hours} Hours)
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setTimesheetForm({
                      project_id: lookups.projects?.[0]?.id || '',
                      date: new Date().toISOString().split('T')[0],
                      hours: 8,
                      description: 'Engineering site supervision, structural inspection and alignment.',
                    });
                    setModalType('timesheet');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Hours
                </button>
              </div>

              {timesheet_summary.entries.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Timer className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No timesheets logged yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Hours</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {timesheet_summary.entries.map((ts) => (
                        <tr key={ts.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {new Date(ts.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                            {ts.hours} hrs
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {ts.description}
                          </td>
                          <td className="px-4 py-3 capitalize text-slate-500">
                            {ts.status || 'Submitted'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 col: Quick Actions panel & Recent Activities */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Project Engineer Actions
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  const firstTask = my_tasks_and_deadlines[0];
                  if (firstTask) {
                    setSelectedTask(firstTask);
                    setTaskForm({
                      task_id: firstTask.id,
                      status: firstTask.status === 'in_progress' ? 'completed' : 'in_progress',
                      notes: '',
                    });
                    setModalType('update_task');
                  } else {
                    showToast('No assigned tasks available', 'error');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare className="w-4 h-4 text-sky-500" />
                  <span>Update Task Progress</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setReportForm({
                    project_id: lookups.projects?.[0]?.id || '',
                    report_date: new Date().toISOString().split('T')[0],
                    work_completed: '',
                    site_conditions: 'Normal working conditions (Dry, 28°C)',
                    blockers: '',
                    manpower_count: 5,
                  });
                  setModalType('site_report');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Submit Site Progress Report</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setIssueForm({
                    project_id: lookups.projects?.[0]?.id || '',
                    title: '',
                    description: '',
                    severity: 'medium',
                    mitigation_plan: '',
                  });
                  setModalType('issue');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-4 h-4 text-rose-500" />
                  <span>Record Engineering Issue</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setMaterialForm({
                    project_id: lookups.projects?.[0]?.id || '',
                    warehouse_id: lookups.warehouses?.[0]?.id || '',
                    priority: 'high',
                    required_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
                    site_location: 'Site Location A',
                    notes: '',
                    product_id: lookups.products?.[0]?.id || '',
                    quantity: 10,
                    item_notes: '',
                  });
                  setModalType('material_req');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-indigo-500" />
                  <span>Requisition Material to Store</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setTimesheetForm({
                    project_id: lookups.projects?.[0]?.id || '',
                    date: new Date().toISOString().split('T')[0],
                    hours: 8,
                    description: 'Engineering site supervision, structural inspection and alignment.',
                  });
                  setModalType('timesheet');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Timer className="w-4 h-4 text-purple-500" />
                  <span>Enter Timesheet</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setReviewForm({
                    project_id: lookups.projects?.[0]?.id || '',
                    title: '',
                    deliverable_type: 'drawing',
                    version: '1.0',
                    submission_notes: '',
                  });
                  setModalType('tech_review');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-teal-500" />
                  <span>Submit Technical Review</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              Recent Project Activities
            </h3>

            {recent_activities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent engineering activities recorded.</p>
            ) : (
              <div className="space-y-3.5">
                {recent_activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{act.title}</p>
                      <p className="text-slate-500 dark:text-slate-400">{act.description}</p>
                      <span className="text-[10px] text-slate-400">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: UPDATE TASK */}
      <AnimatePresence>
        {modalType === 'update_task' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-sky-600" />
                  Update Task Status
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateTask} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select Task
                  </label>
                  <select
                    value={taskForm.task_id}
                    onChange={(e) => setTaskForm({ ...taskForm, task_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select task</option>
                    {my_tasks_and_deadlines.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.project?.name || 'Project'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    New Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Progress Notes
                  </label>
                  <textarea
                    rows={2}
                    value={taskForm.notes}
                    onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                    placeholder="Enter summary of progress or testing results..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700"
                  >
                    {submitting ? 'Updating...' : 'Save Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: SUBMIT DAILY SITE PROGRESS REPORT */}
      <AnimatePresence>
        {modalType === 'site_report' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600" />
                  Submit Daily Site Progress Report
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitProgressReport} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Project
                    </label>
                    <select
                      value={reportForm.project_id}
                      onChange={(e) => setReportForm({ ...reportForm, project_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="">Select project</option>
                      {lookups.projects?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Report Date
                    </label>
                    <input
                      type="date"
                      required
                      value={reportForm.report_date}
                      onChange={(e) => setReportForm({ ...reportForm, report_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Work Completed Today
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reportForm.work_completed}
                    onChange={(e) => setReportForm({ ...reportForm, work_completed: e.target.value })}
                    placeholder="Describe specific engineering tasks completed, equipment erected or cables laid..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Site Conditions / Weather
                    </label>
                    <input
                      type="text"
                      value={reportForm.site_conditions}
                      onChange={(e) => setReportForm({ ...reportForm, site_conditions: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Manpower on Site
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={reportForm.manpower_count}
                      onChange={(e) => setReportForm({ ...reportForm, manpower_count: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Blockers or Dependencies (Optional)
                  </label>
                  <input
                    type="text"
                    value={reportForm.blockers}
                    onChange={(e) => setReportForm({ ...reportForm, blockers: e.target.value })}
                    placeholder="e.g. Waiting on transformer delivery from Store"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: RECORD ENGINEERING ISSUE */}
      <AnimatePresence>
        {modalType === 'issue' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  Log Engineering Issue / Risk
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordIssue} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Related Project
                  </label>
                  <select
                    value={issueForm.project_id}
                    onChange={(e) => setIssueForm({ ...issueForm, project_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select project</option>
                    {lookups.projects?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Foundation pile alignment mismatch"
                    value={issueForm.title}
                    onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Severity
                  </label>
                  <select
                    value={issueForm.severity}
                    onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="low">Low (Minor Delay)</option>
                    <option value="medium">Medium (Requires attention)</option>
                    <option value="high">High (Blocks critical path)</option>
                    <option value="critical">Critical (Safety / Structural risk)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description & Impact
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={issueForm.description}
                    onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                    placeholder="Technical description of the problem..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mitigation Plan
                  </label>
                  <input
                    type="text"
                    value={issueForm.mitigation_plan}
                    onChange={(e) => setIssueForm({ ...issueForm, mitigation_plan: e.target.value })}
                    placeholder="e.g. Re-cast anchor bolts with 25mm offset"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700"
                  >
                    {submitting ? 'Logging...' : 'Log Issue'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: MATERIAL REQUEST */}
      <AnimatePresence>
        {modalType === 'material_req' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Site Material Requisition to Store
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitMaterialRequest} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Project
                    </label>
                    <select
                      value={materialForm.project_id}
                      onChange={(e) => setMaterialForm({ ...materialForm, project_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="">Select project</option>
                      {lookups.projects?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Target Warehouse
                    </label>
                    <select
                      value={materialForm.warehouse_id}
                      onChange={(e) => setMaterialForm({ ...materialForm, warehouse_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="">Auto-route (Main Warehouse)</option>
                      {lookups.warehouses?.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Product / Material
                    </label>
                    <select
                      value={materialForm.product_id}
                      onChange={(e) => setMaterialForm({ ...materialForm, product_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="">Select product</option>
                      {lookups.products?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Quantity Needed
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={materialForm.quantity}
                      onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Required By Date
                    </label>
                    <input
                      type="date"
                      required
                      value={materialForm.required_date}
                      onChange={(e) => setMaterialForm({ ...materialForm, required_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={materialForm.priority}
                      onChange={(e) => setMaterialForm({ ...materialForm, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent (Line Down)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Site Delivery Location
                  </label>
                  <input
                    type="text"
                    required
                    value={materialForm.site_location}
                    onChange={(e) => setMaterialForm({ ...materialForm, site_location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                  >
                    {submitting ? 'Submitting...' : 'Send Request to Store'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: ENTER TIMESHEET */}
      <AnimatePresence>
        {modalType === 'timesheet' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-purple-600" />
                  Log Engineering Timesheet
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEnterTimesheet} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Project
                  </label>
                  <select
                    value={timesheetForm.project_id}
                    onChange={(e) => setTimesheetForm({ ...timesheetForm, project_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select project</option>
                    {lookups.projects?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={timesheetForm.date}
                      onChange={(e) => setTimesheetForm({ ...timesheetForm, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hours Spent
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      required
                      value={timesheetForm.hours}
                      onChange={(e) => setTimesheetForm({ ...timesheetForm, hours: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Activity Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={timesheetForm.description}
                    onChange={(e) => setTimesheetForm({ ...timesheetForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
                  >
                    {submitting ? 'Saving...' : 'Log Hours'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 6: SUBMIT TECHNICAL REVIEW */}
      <AnimatePresence>
        {modalType === 'tech_review' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-teal-600" />
                  Submit Technical Review Deliverable
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitTechnicalReview} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Project
                  </label>
                  <select
                    value={reviewForm.project_id}
                    onChange={(e) => setReviewForm({ ...reviewForm, project_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select project</option>
                    {lookups.projects?.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Deliverable Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electrical Layout Diagram Revision 2"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Deliverable Type
                    </label>
                    <select
                      value={reviewForm.deliverable_type}
                      onChange={(e) => setReviewForm({ ...reviewForm, deliverable_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="drawing">Drawing / CAD</option>
                      <option value="calculation">Structural Calculation</option>
                      <option value="specification">Equipment Specification</option>
                      <option value="site_plan">Site Execution Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={reviewForm.version}
                      onChange={(e) => setReviewForm({ ...reviewForm, version: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Submission & Scope Notes
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={reviewForm.submission_notes}
                    onChange={(e) => setReviewForm({ ...reviewForm, submission_notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                  >
                    {submitting ? 'Submitting...' : 'Submit Deliverable'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
