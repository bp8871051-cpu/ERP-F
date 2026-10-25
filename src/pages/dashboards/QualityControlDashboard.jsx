import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  ClipboardList,
  AlertOctagon,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileCheck,
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
  Warehouse,
  PackageCheck,
  Sliders,
  AlertTriangle
} from 'lucide-react';
import { roleDashboardService } from '../../services/roleDashboardService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';

export default function QualityControlDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter / Tab State
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'incoming' | 'results' | 'ncrs' | 'reinspections' | 'analytics'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalType, setModalType] = useState(null); // 'view' | 'start' | 'measure' | 'decision' | 'ncr' | 'reinspection'
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [startForm, setStartForm] = useState({ inspection_id: '' });
  const [measureForm, setMeasureForm] = useState({
    inspection_id: '',
    dimension_check: 'Passed',
    surface_finish: 'Smooth (Ra < 1.6um)',
    weight_tolerance: 'Within +/- 0.5%',
    tensile_hardness: '45 HRC (Conforms)',
    notes: '',
  });
  const [decisionForm, setDecisionForm] = useState({
    inspection_id: '',
    decision: 'passed',
    defect_count: 0,
    reinspection_date: '',
    notes: '',
  });
  const [ncrForm, setNcrForm] = useState({
    inspection_id: '',
    product_id: '',
    title: '',
    description: '',
    severity: 'major',
    root_cause: '',
    corrective_action: '',
    action_due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });
  const [reinspectionForm, setReinspectionForm] = useState({
    inspection_id: '',
    reinspection_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    notes: '',
  });

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await roleDashboardService.qualityControl.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load Quality Control dashboard:', err);
      setError(err.response?.data?.message || 'Unable to connect to Quality Control API.');
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
  const handleStartInspection = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.qualityControl.startInspection(startForm);
      showToast(res.message || 'Inspection started successfully');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start inspection', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordMeasurements = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const measurements = {
        dimension_check: measureForm.dimension_check,
        surface_finish: measureForm.surface_finish,
        weight_tolerance: measureForm.weight_tolerance,
        tensile_hardness: measureForm.tensile_hardness,
      };
      const res = await roleDashboardService.qualityControl.recordMeasurements({
        inspection_id: measureForm.inspection_id,
        measurements: measurements,
        notes: measureForm.notes,
      });
      showToast(res.message || 'Measurements recorded successfully');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record measurements', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.qualityControl.submitDecision(decisionForm);
      showToast(res.message || 'Inspection decision finalized');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit inspection decision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNcr = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.qualityControl.createNcr(ncrForm);
      showToast(res.message || 'Non-conformance report created');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create NCR', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleReinspection = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.qualityControl.scheduleReinspection(reinspectionForm);
      showToast(res.message || 'Reinspection scheduled successfully');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule reinspection', 'error');
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
          title="Quality Control System Error"
          message={error}
          onRetry={() => fetchDashboard(false)}
        />
      </div>
    );
  }

  const { cards = {}, sections = {}, lookups = {} } = data || {};
  const {
    pending_inspection_queue = [],
    incoming_material_inspections = [],
    recent_inspection_results = [],
    failed_held_items = [],
    open_defects = [],
    corrective_action_tracking = [],
    reinspection_schedule = [],
    quality_trends_chart = {},
    recent_activities = [],
  } = sections;

  // Filter pending queue
  const filteredQueue = pending_inspection_queue.filter((insp) => {
    const matchesSearch =
      (insp.inspection_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insp.product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (insp.lot_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || insp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      case 'quality_hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            <PauseCircle className="w-3.5 h-3.5" /> Quality Hold
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800">
            <Clock className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 border border-red-300">
            CRITICAL
          </span>
        );
      case 'major':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400 border border-orange-300">
            MAJOR
          </span>
        );
      case 'minor':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">
            Minor
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
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              Quality Assurance & Inspection
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Quality Control Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Incoming material inspection, Non-Conformance Reports (NCR), defect triage, and authorized release control.
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
              const pendingOne = pending_inspection_queue[0];
              setDecisionForm({
                inspection_id: pendingOne ? pendingOne.id : '',
                decision: 'passed',
                defect_count: 0,
                reinspection_date: '',
                notes: '',
              });
              setModalType('decision');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition"
          >
            <FileCheck className="w-4 h-4" />
            Submit Decision
          </button>

          <button
            onClick={() => {
              setNcrForm({
                inspection_id: '',
                product_id: lookups.products?.[0]?.id || '',
                title: '',
                description: '',
                severity: 'major',
                root_cause: '',
                corrective_action: '',
                action_due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              });
              setModalType('ncr');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition"
          >
            <AlertOctagon className="w-4 h-4" />
            Raise NCR / Defect
          </button>
        </div>
      </div>

      {/* 8 Dashboard Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Requests */}
        <div
          onClick={() => {
            setActiveTab('queue');
            setStatusFilter('all');
          }}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Requests</span>
            <ClipboardList className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {cards.total_inspection_requests ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Overall log</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Pending Inspections */}
        <div
          onClick={() => {
            setActiveTab('queue');
            setStatusFilter('pending');
          }}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {cards.pending_inspections ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Awaiting check</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => {
            setActiveTab('queue');
            setStatusFilter('in_progress');
          }}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">In Progress</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {cards.inspections_in_progress ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Being tested</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Passed Inspections */}
        <div
          onClick={() => {
            setActiveTab('results');
            setStatusFilter('passed');
          }}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Passed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {cards.passed_inspections ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Released stock</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Failed Inspections */}
        <div
          onClick={() => {
            setActiveTab('results');
            setStatusFilter('failed');
          }}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Failed</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {cards.failed_inspections ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Rejected lots</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Quality Hold */}
        <div
          onClick={() => {
            setActiveTab('results');
            setStatusFilter('quality_hold');
          }}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">On Hold</span>
            <PauseCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {cards.items_on_quality_hold ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Quarantine</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Open Defects / NCRs */}
        <div
          onClick={() => setActiveTab('ncrs')}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Open NCRs</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {cards.open_defects_ncrs ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Active defects</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>

        {/* Pending CAPA */}
        <div
          onClick={() => setActiveTab('ncrs')}
          className="cursor-pointer bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-600 rounded-xl p-3.5 transition shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold">Pending CAPA</span>
            <ShieldAlert className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
            {cards.pending_corrective_actions ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Corrective action</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-70" />
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-sm font-medium">
        <button
          onClick={() => {
            setActiveTab('queue');
            setStatusFilter('all');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'queue'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Pending Inspection Queue ({pending_inspection_queue.length})
        </button>

        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'incoming'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Incoming Material ({incoming_material_inspections.length})
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'results'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Recent Inspection Results ({recent_inspection_results.length})
        </button>

        <button
          onClick={() => setActiveTab('ncrs')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'ncrs'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          NCR & Defects ({open_defects.length})
        </button>

        <button
          onClick={() => setActiveTab('reinspections')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'reinspections'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Reinspection Schedule ({reinspection_schedule.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'analytics'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Quality Trends & Analytics
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 cols: Tab contents */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: PENDING QUEUE */}
          {activeTab === 'queue' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Inspection Queue (Pending & In Progress)
                  </h2>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search lot, code, product..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Queue</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>
              </div>

              {filteredQueue.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/70" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No inspections pending!</p>
                  <p className="text-xs text-slate-400 mt-1">All incoming lots and requests have been processed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Inspection #</th>
                        <th className="px-4 py-3">Material / Product</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Lot / Qty</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredQueue.map((insp) => (
                        <tr key={insp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-semibold text-purple-600 dark:text-purple-400">
                            {insp.inspection_number}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-white">
                              {insp.product?.name || 'Bulk Material'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              SKU: {insp.product?.sku || 'N/A'} • {insp.warehouse?.name || 'Main Warehouse'}
                            </div>
                          </td>
                          <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">
                            {insp.inspection_type?.replace('_', ' ') || 'Incoming'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            <div>Lot: {insp.lot_number || 'N/A'}</div>
                            <div className="text-[11px] text-slate-400">{insp.sample_size || insp.quantity_inspected || 1} units tested</div>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(insp.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {insp.status === 'pending' && (
                                <button
                                  onClick={() => {
                                    setStartForm({ inspection_id: insp.id });
                                    setModalType('start');
                                  }}
                                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                                >
                                  Start
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedInspection(insp);
                                  setMeasureForm({
                                    inspection_id: insp.id,
                                    dimension_check: 'Passed',
                                    surface_finish: 'Smooth (Ra < 1.6um)',
                                    weight_tolerance: 'Within +/- 0.5%',
                                    tensile_hardness: '45 HRC (Conforms)',
                                    notes: insp.notes || '',
                                  });
                                  setModalType('measure');
                                }}
                                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition"
                              >
                                Test Specs
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedInspection(insp);
                                  setDecisionForm({
                                    inspection_id: insp.id,
                                    decision: 'passed',
                                    defect_count: 0,
                                    reinspection_date: '',
                                    notes: insp.notes || '',
                                  });
                                  setModalType('decision');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 transition"
                              >
                                Finalize
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOMING MATERIAL INSPECTIONS */}
          {activeTab === 'incoming' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Incoming Material Inspections (Goods Receipt / POs)
                  </h2>
                </div>
              </div>

              {incoming_material_inspections.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <PackageCheck className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No incoming material inspections logged.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Inspection #</th>
                        <th className="px-4 py-3">PO / Supplier</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Batch / Lot</th>
                        <th className="px-4 py-3">Result</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {incoming_material_inspections.map((insp) => (
                        <tr key={insp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-semibold text-indigo-600 dark:text-indigo-400">
                            {insp.inspection_number}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {insp.purchase_order ? insp.purchase_order.order_number : 'PO-Direct'}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                            {insp.product?.name || 'Raw Material'}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {insp.lot_number || 'LOT-IN-001'}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(insp.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedInspection(insp);
                                setModalType('view');
                              }}
                              className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                            >
                              Details
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

          {/* TAB 3: RECENT INSPECTION RESULTS */}
          {activeTab === 'results' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Recent Inspection Results & Clearance Records
                  </h2>
                </div>
              </div>

              {recent_inspection_results.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No finalized inspection results yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Inspection #</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Decision</th>
                        <th className="px-4 py-3">Decision Date</th>
                        <th className="px-4 py-3">Inspector</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {recent_inspection_results.map((insp) => (
                        <tr key={insp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                            {insp.inspection_number}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                            {insp.product?.name || 'Finished Component'}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(insp.status)}</td>
                          <td className="px-4 py-3 text-slate-500">
                            {insp.decision_date ? new Date(insp.decision_date).toLocaleDateString() : 'Today'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {insp.inspector?.name || 'QC Inspector'}
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                            {insp.notes || 'Meets standard ISO-9001 specs.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DEFECTS & NCRs */}
          {activeTab === 'ncrs' && (
            <div className="space-y-6">
              {/* Failed / Held Alert Banner */}
              {failed_held_items.length > 0 && (
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-rose-900 dark:text-rose-300">
                      Restricted Quarantine Policy:
                    </span>{' '}
                    <span className="text-rose-700 dark:text-rose-400">
                      {failed_held_items.length} lots are currently marked as FAILED or QUALITY HOLD. Store Executive cannot
                      release these items to production until authorized release clearance is signed by Quality Control.
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-rose-600" />
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                      Non-Conformance Reports (NCR) & Defect Log
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setNcrForm({
                        inspection_id: '',
                        product_id: lookups.products?.[0]?.id || '',
                        title: '',
                        description: '',
                        severity: 'major',
                        root_cause: '',
                        corrective_action: '',
                        action_due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                      });
                      setModalType('ncr');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log NCR
                  </button>
                </div>

                {open_defects.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/70" />
                    <p className="font-medium text-slate-700 dark:text-slate-300">No open defects or NCRs!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3">NCR #</th>
                          <th className="px-4 py-3">Title / Defect</th>
                          <th className="px-4 py-3">Severity</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">CAPA Due Date</th>
                          <th className="px-4 py-3">Corrective Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {open_defects.map((ncr) => (
                          <tr key={ncr.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3 font-semibold text-rose-600 dark:text-rose-400">
                              {ncr.ncr_number}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900 dark:text-white">{ncr.title}</div>
                              <div className="text-[11px] text-slate-400 max-w-sm truncate">{ncr.description}</div>
                            </td>
                            <td className="px-4 py-3">{getSeverityBadge(ncr.severity)}</td>
                            <td className="px-4 py-3">
                              <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {ncr.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {ncr.action_due_date || 'Within 7 days'}
                            </td>
                            <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                              {ncr.corrective_action || 'Root cause investigation in progress'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: REINSPECTION SCHEDULE */}
          {activeTab === 'reinspections' && (
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Scheduled Reinspections for Held & Reworked Items
                  </h2>
                </div>
              </div>

              {reinspection_schedule.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No pending reinspections scheduled.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Inspection #</th>
                        <th className="px-4 py-3">Scheduled Date</th>
                        <th className="px-4 py-3">Product / Lot</th>
                        <th className="px-4 py-3">Previous Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reinspection_schedule.map((insp) => (
                        <tr key={insp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-semibold text-purple-600">{insp.inspection_number}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {new Date(insp.reinspection_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {insp.product?.name || 'Reworked Lot'} (Lot: {insp.lot_number || 'N/A'})
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(insp.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedInspection(insp);
                                setDecisionForm({
                                  inspection_id: insp.id,
                                  decision: 'passed',
                                  defect_count: 0,
                                  reinspection_date: '',
                                  notes: 'Cleared after rework and reinspection.',
                                });
                                setModalType('decision');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            >
                              Clear & Release
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

          {/* TAB 6: QUALITY TRENDS & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                  Quality Yield & Inspection Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Aggregate distribution across Passed, Failed, Quality Hold, and Pending reviews.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Passed & Cleared</span>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {quality_trends_chart['Passed'] ?? 0}
                    </div>
                    <div className="text-[11px] text-emerald-600/80 mt-1">First-pass yield approved</div>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                    <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Rejected / Failed</span>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                      {quality_trends_chart['Failed'] ?? 0}
                    </div>
                    <div className="text-[11px] text-rose-600/80 mt-1">Scrap or vendor return</div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">On Quarantine Hold</span>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                      {quality_trends_chart['Quality Hold'] ?? 0}
                    </div>
                    <div className="text-[11px] text-amber-600/80 mt-1">Pending engineering review</div>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                    <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">Under Inspection</span>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {quality_trends_chart['Pending Review'] ?? 0}
                    </div>
                    <div className="text-[11px] text-purple-600/80 mt-1">In active lab workflow</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 col: Quick Actions panel & Recent Activities */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              QC Quick Actions
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  const firstPending = pending_inspection_queue[0];
                  if (firstPending) {
                    setStartForm({ inspection_id: firstPending.id });
                    setModalType('start');
                  } else {
                    showToast('No pending inspection found in queue', 'error');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Start Inspection</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  const first = pending_inspection_queue[0] || recent_inspection_results[0];
                  if (first) {
                    setSelectedInspection(first);
                    setMeasureForm({
                      inspection_id: first.id,
                      dimension_check: 'Passed',
                      surface_finish: 'Smooth (Ra < 1.6um)',
                      weight_tolerance: 'Within +/- 0.5%',
                      tensile_hardness: '45 HRC (Conforms)',
                      notes: first.notes || '',
                    });
                    setModalType('measure');
                  } else {
                    showToast('No inspection available to test', 'error');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 text-purple-500" />
                  <span>Record Test Measurements</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  const first = pending_inspection_queue[0] || recent_inspection_results[0];
                  if (first) {
                    setSelectedInspection(first);
                    setDecisionForm({
                      inspection_id: first.id,
                      decision: 'passed',
                      defect_count: 0,
                      reinspection_date: '',
                      notes: '',
                    });
                    setModalType('decision');
                  } else {
                    showToast('No inspection available', 'error');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  <span>Mark Pass / Fail / Hold</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setNcrForm({
                    inspection_id: '',
                    product_id: lookups.products?.[0]?.id || '',
                    title: '',
                    description: '',
                    severity: 'major',
                    root_cause: '',
                    corrective_action: '',
                    action_due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                  });
                  setModalType('ncr');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-4 h-4 text-rose-500" />
                  <span>Create Non-Conformance Report</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  const first = failed_held_items[0] || pending_inspection_queue[0];
                  if (first) {
                    setReinspectionForm({
                      inspection_id: first.id,
                      reinspection_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
                      notes: '',
                    });
                    setModalType('reinspection');
                  } else {
                    showToast('No failed or held item found to reinspect', 'error');
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Schedule Reinspection</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Recent QC Activities */}
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Recent QC Activities
            </h3>

            {recent_activities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent activities recorded.</p>
            ) : (
              <div className="space-y-3.5">
                {recent_activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
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

      {/* MODAL 1: START INSPECTION */}
      <AnimatePresence>
        {modalType === 'start' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Start Inspection
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStartInspection} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select Inspection Request
                  </label>
                  <select
                    value={startForm.inspection_id}
                    onChange={(e) => setStartForm({ ...startForm, inspection_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select pending inspection</option>
                    {pending_inspection_queue
                      .filter((i) => i.status === 'pending')
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.inspection_number} - {i.product?.name || 'Item'} (Lot: {i.lot_number || 'N/A'})
                        </option>
                      ))}
                  </select>
                </div>

                <p className="text-slate-500 text-[11px]">
                  Setting this inspection to In Progress will assign your QC ID as the designated inspector and lock test entry.
                </p>

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
                    {submitting ? 'Starting...' : 'Confirm & Start'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: RECORD TEST MEASUREMENTS */}
      <AnimatePresence>
        {modalType === 'measure' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  Record Inspection Measurements & Checklist
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordMeasurements} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Inspection Request
                  </label>
                  <select
                    value={measureForm.inspection_id}
                    onChange={(e) => setMeasureForm({ ...measureForm, inspection_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select inspection</option>
                    {[...pending_inspection_queue, ...recent_inspection_results].map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.inspection_number} - {i.product?.name || 'Product'} (Lot: {i.lot_number || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Dimensional Verification
                    </label>
                    <input
                      type="text"
                      value={measureForm.dimension_check}
                      onChange={(e) => setMeasureForm({ ...measureForm, dimension_check: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Surface Finish / Visual
                    </label>
                    <input
                      type="text"
                      value={measureForm.surface_finish}
                      onChange={(e) => setMeasureForm({ ...measureForm, surface_finish: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Weight & Tolerance
                    </label>
                    <input
                      type="text"
                      value={measureForm.weight_tolerance}
                      onChange={(e) => setMeasureForm({ ...measureForm, weight_tolerance: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hardness / Material Grade
                    </label>
                    <input
                      type="text"
                      value={measureForm.tensile_hardness}
                      onChange={(e) => setMeasureForm({ ...measureForm, tensile_hardness: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Inspection Notes / Calibration Observations
                  </label>
                  <textarea
                    rows={2}
                    value={measureForm.notes}
                    onChange={(e) => setMeasureForm({ ...measureForm, notes: e.target.value })}
                    placeholder="Enter calibrated instrument readings..."
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
                    {submitting ? 'Saving...' : 'Save Measurements'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: FINAL DECISION (PASS / FAIL / HOLD) */}
      <AnimatePresence>
        {modalType === 'decision' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-purple-600" />
                  Authorized Inspection Decision
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitDecision} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Inspection Target
                  </label>
                  <select
                    value={decisionForm.inspection_id}
                    onChange={(e) => setDecisionForm({ ...decisionForm, inspection_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select inspection</option>
                    {[...pending_inspection_queue, ...recent_inspection_results].map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.inspection_number} - {i.product?.name || 'Product'} (Current: {i.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Authorized Decision
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDecisionForm({ ...decisionForm, decision: 'passed' })}
                      className={`p-2.5 rounded-lg border text-center font-bold flex flex-col items-center gap-1 transition ${
                        decisionForm.decision === 'passed'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      PASSED
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionForm({ ...decisionForm, decision: 'quality_hold' })}
                      className={`p-2.5 rounded-lg border text-center font-bold flex flex-col items-center gap-1 transition ${
                        decisionForm.decision === 'quality_hold'
                          ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <PauseCircle className="w-4 h-4 text-amber-500" />
                      QUALITY HOLD
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionForm({ ...decisionForm, decision: 'failed' })}
                      className={`p-2.5 rounded-lg border text-center font-bold flex flex-col items-center gap-1 transition ${
                        decisionForm.decision === 'failed'
                          ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                      FAILED
                    </button>
                  </div>
                </div>

                {decisionForm.decision !== 'passed' && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Defects Detected (Count)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={decisionForm.defect_count}
                        onChange={(e) => setDecisionForm({ ...decisionForm, defect_count: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Reinspection Due Date
                      </label>
                      <input
                        type="date"
                        value={decisionForm.reinspection_date}
                        onChange={(e) => setDecisionForm({ ...decisionForm, reinspection_date: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    QC Decision Certificate & Rationale Notes
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={decisionForm.notes}
                    onChange={(e) => setDecisionForm({ ...decisionForm, notes: e.target.value })}
                    placeholder="State disposition reasons, compliance standards, and release conditions..."
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
                    {submitting ? 'Authorizing...' : 'Authorize Decision'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: CREATE NCR / DEFECT */}
      <AnimatePresence>
        {modalType === 'ncr' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  Raise Non-Conformance Report (NCR)
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNcr} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Defect Title / Summary
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dimensions out of tolerance, surface oxidation"
                    value={ncrForm.title}
                    onChange={(e) => setNcrForm({ ...ncrForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Related Product
                    </label>
                    <select
                      value={ncrForm.product_id}
                      onChange={(e) => setNcrForm({ ...ncrForm, product_id: e.target.value })}
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
                      Severity Level
                    </label>
                    <select
                      value={ncrForm.severity}
                      onChange={(e) => setNcrForm({ ...ncrForm, severity: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="minor">Minor (Rework possible)</option>
                      <option value="major">Major (Performance impacted)</option>
                      <option value="critical">Critical (Safety / Scrap)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Defect Description & Root Cause
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={ncrForm.description}
                    onChange={(e) => setNcrForm({ ...ncrForm, description: e.target.value })}
                    placeholder="Describe specific failure mode..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Proposed Corrective Action (CAPA)
                    </label>
                    <input
                      type="text"
                      value={ncrForm.corrective_action}
                      onChange={(e) => setNcrForm({ ...ncrForm, corrective_action: e.target.value })}
                      placeholder="e.g. Supplier recalibration / Vendor return"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Action Due Date
                    </label>
                    <input
                      type="date"
                      value={ncrForm.action_due_date}
                      onChange={(e) => setNcrForm({ ...ncrForm, action_due_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
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
                    {submitting ? 'Logging...' : 'Submit NCR'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: SCHEDULE REINSPECTION */}
      <AnimatePresence>
        {modalType === 'reinspection' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Schedule Reinspection
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleReinspection} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Select Held / Failed Item
                  </label>
                  <select
                    value={reinspectionForm.inspection_id}
                    onChange={(e) => setReinspectionForm({ ...reinspectionForm, inspection_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="">Select item</option>
                    {[...failed_held_items, ...pending_inspection_queue].map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.inspection_number} - {i.product?.name || 'Lot'} ({i.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Reinspection Date
                  </label>
                  <input
                    type="date"
                    required
                    value={reinspectionForm.reinspection_date}
                    onChange={(e) => setReinspectionForm({ ...reinspectionForm, reinspection_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rework Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={reinspectionForm.notes}
                    onChange={(e) => setReinspectionForm({ ...reinspectionForm, notes: e.target.value })}
                    placeholder="Specify rework or reprocessing criteria..."
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
                    className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
                  >
                    {submitting ? 'Saving...' : 'Set Date'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 6: VIEW INSPECTION DETAILS */}
      <AnimatePresence>
        {modalType === 'view' && selectedInspection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedInspection.inspection_number}
                  </h3>
                  <span className="text-[11px] text-slate-400 capitalize">
                    {selectedInspection.inspection_type?.replace('_', ' ') || 'Incoming Material Inspection'}
                  </span>
                </div>
                {getStatusBadge(selectedInspection.status)}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Product</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedInspection.product?.name || 'Raw Material Lot'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Lot Number</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedInspection.lot_number || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Warehouse Location</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {selectedInspection.warehouse?.name || 'Quarantine Bay'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Sample Tested</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {selectedInspection.sample_size || 1} units
                  </span>
                </div>
              </div>

              {selectedInspection.measurements && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-900 dark:text-white">Test Measurements</span>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                    {Object.entries(selectedInspection.measurements).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[11px]">
                        <span className="text-slate-500 capitalize">{k.replace('_', ' ')}:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedInspection.notes && (
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-1">Inspector Notes</span>
                  <p className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                    {selectedInspection.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
