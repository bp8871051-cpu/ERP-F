import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Package,
  FileText,
  MapPin,
  Phone,
  Plus,
  PlusCircle,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { roleDashboardService } from '../../services/roleDashboardService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';

export default function ServiceEngineerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter / Tab state
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'visits' | 'reports' | 'parts'
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Action Modal states
  const [modalType, setModalType] = useState(null); // 'status' | 'visit' | 'report' | 'parts' | 'complete' | 'view_ticket'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [ticketForm, setTicketForm] = useState({
    customer_id: '',
    subject: '',
    description: '',
    priority: 'medium',
    resolution_due_at: '',
  });
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    type: null, // 'ticket' | 'visit' | 'report' | 'parts'
    id: null,
    title: '',
  });
  const [statusForm, setStatusForm] = useState({ ticket_id: '', status: 'in_progress', notes: '' });
  const [visitForm, setVisitForm] = useState({
    ticket_id: '',
    customer_id: '',
    customer_name: '',
    site_address: '',
    contact_phone: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '11:00 AM',
    service_type: 'breakdown_repair',
    notes: '',
  });
  const [reportForm, setReportForm] = useState({
    ticket_id: '',
    customer_id: '',
    customer_name: '',
    equipment_name: '',
    serial_number: '',
    work_performed: '',
    hours_spent: 2.0,
    recommendations: '',
    customer_confirmation_status: 'pending',
  });
  const [partsForm, setPartsForm] = useState({
    ticket_id: '',
    warehouse_id: '',
    priority: 'high',
    required_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    site_location: '',
    notes: '',
    product_id: '',
    quantity: 1,
    item_notes: '',
  });
  const [completeForm, setCompleteForm] = useState({
    ticket_id: '',
    resolution_summary: '',
    sign_off_status: 'signed_off',
  });

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await roleDashboardService.serviceEngineer.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load Service Engineer dashboard:', err);
      setError(err.response?.data?.message || 'Unable to connect to Service Engineer API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    // Auto-refresh on window focus and periodic background sync every 25 seconds
    const handleFocus = () => fetchDashboard(true);
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => fetchDashboard(true), 25000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Quick Action Handlers
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.serviceEngineer.createTicket(ticketForm);
      showToast(res.message || 'Service request ticket created successfully');
      setModalType(null);
      setTicketForm({ customer_id: '', subject: '', description: '', priority: 'medium', resolution_due_at: '' });
      await fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create service request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id || !confirmDelete.type) return;
    try {
      setSubmitting(true);
      let res;
      if (confirmDelete.type === 'ticket') {
        res = await roleDashboardService.serviceEngineer.deleteTicket(confirmDelete.id);
      } else if (confirmDelete.type === 'visit') {
        res = await roleDashboardService.serviceEngineer.deleteVisit(confirmDelete.id);
      } else if (confirmDelete.type === 'report') {
        res = await roleDashboardService.serviceEngineer.deleteReport(confirmDelete.id);
      } else if (confirmDelete.type === 'parts') {
        res = await roleDashboardService.serviceEngineer.deleteSpareParts(confirmDelete.id);
      }
      showToast(res?.message || 'Record deleted successfully');
      setConfirmDelete({ open: false, type: null, id: null, title: '' });
      await fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOffReport = async (reportId) => {
    try {
      setSubmitting(true);
      const res = await roleDashboardService.serviceEngineer.signOffReport(reportId);
      showToast(res.message || 'Customer sign-off recorded successfully');
      await fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record sign-off', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.serviceEngineer.updateStatus(statusForm);
      showToast(res.message || 'Ticket status updated successfully');
      setModalType(null);
      await fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.serviceEngineer.scheduleVisit(visitForm);
      showToast(res.message || 'Site visit scheduled successfully');
      setModalType(null);
      await fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule visit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.serviceEngineer.createReport(reportForm);
      showToast(res.message || 'Service report created successfully');
      setModalType(null);
      await fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit service report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestParts = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ticket_id: partsForm.ticket_id || undefined,
        warehouse_id: partsForm.warehouse_id || undefined,
        priority: partsForm.priority,
        required_date: partsForm.required_date,
        site_location: partsForm.site_location,
        notes: partsForm.notes,
        items: [
          {
            product_id: parseInt(partsForm.product_id, 10),
            quantity: parseInt(partsForm.quantity, 10),
            notes: partsForm.item_notes,
          },
        ],
      };
      const res = await roleDashboardService.serviceEngineer.requestSpareParts(payload);
      showToast(res.message || 'Spare parts requisition submitted to Store Executive');
      setModalType(null);
      await fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit spare parts request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteJob = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.serviceEngineer.completeJob(completeForm);
      showToast(res.message || 'Service job marked as completed');
      setModalType(null);
      await fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete job', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={() => fetchDashboard()} />;

  const { cards, sections, lookups } = data;

  // Filtered tickets
  const filteredTickets = (sections.my_assigned_tickets || []).filter((t) => {
    const matchesStatus = ticketStatusFilter === 'all' || t.status === ticketStatusFilter;
    const matchesSearch =
      !searchQuery ||
      t.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /> : <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Wrench className="w-4 h-4 text-blue-400" />
            Field Operations & Technical Service
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Service Engineer Dashboard</h1>
          <p className="text-xs text-blue-100/80 mt-1">
            Manage your field service requests, scheduled customer site visits, maintenance logs, and spare parts requisitions.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setTicketForm({
                customer_id: lookups.customers?.[0]?.id || '',
                subject: '',
                description: '',
                priority: 'medium',
                resolution_due_at: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
              });
              setModalType('new_ticket');
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Service Request
          </button>

          <button
            onClick={() => {
              setVisitForm({
                ticket_id: sections.my_assigned_tickets?.[0]?.id || '',
                customer_id: lookups.customers?.[0]?.id || '',
                customer_name: lookups.customers?.[0]?.name || '',
                site_address: 'Client Factory Site',
                contact_phone: lookups.customers?.[0]?.phone || '',
                visit_date: new Date().toISOString().split('T')[0],
                visit_time: '11:00 AM',
                service_type: 'breakdown_repair',
                notes: '',
              });
              setModalType('visit');
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            Schedule Site Visit
          </button>

          <button
            onClick={() => {
              setReportForm({
                ticket_id: sections.my_assigned_tickets?.[0]?.id || '',
                customer_id: lookups.customers?.[0]?.id || '',
                customer_name: lookups.customers?.[0]?.name || '',
                equipment_name: 'Main Booster Pump Unit',
                serial_number: 'SN-ENG-' + Math.floor(1000 + Math.random() * 9000),
                work_performed: '',
                hours_spent: 2.5,
                recommendations: '',
                customer_confirmation_status: 'pending',
              });
              setModalType('report');
            }}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Create Service Report
          </button>

          <button
            onClick={() => {
              setPartsForm({
                ticket_id: sections.my_assigned_tickets?.[0]?.id || '',
                warehouse_id: lookups.warehouses?.[0]?.id || '',
                priority: 'high',
                required_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                site_location: 'Client Plant Site',
                notes: '',
                product_id: lookups.products?.[0]?.id || '',
                quantity: 1,
                item_notes: '',
              });
              setModalType('parts');
            }}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <Package className="w-3.5 h-3.5" />
            Request Spare Parts
          </button>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 7 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* 1. Total Assigned */}
        <div
          onClick={() => {
            setActiveTab('tickets');
            setTicketStatusFilter('all');
          }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-blue-400 hover:shadow-md cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Assigned</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{cards.total_assigned_tickets}</div>
          <div className="text-[11px] text-slate-400">Total tickets assigned</div>
        </div>

        {/* 2. Pending Requests */}
        <div
          onClick={() => {
            setActiveTab('tickets');
            setTicketStatusFilter('open');
          }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-amber-400 hover:shadow-md cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pending</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{cards.pending_service_requests}</div>
          <div className="text-[11px] text-amber-600 font-medium">Awaiting response</div>
        </div>

        {/* 3. In Progress */}
        <div
          onClick={() => {
            setActiveTab('tickets');
            setTicketStatusFilter('in_progress');
          }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-indigo-400 hover:shadow-md cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">In Progress</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{cards.in_progress_services}</div>
          <div className="text-[11px] text-indigo-600 font-medium">Currently active</div>
        </div>

        {/* 4. Completed */}
        <div
          onClick={() => {
            setActiveTab('tickets');
            setTicketStatusFilter('completed');
          }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-emerald-400 hover:shadow-md cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Completed</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{cards.completed_services}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Resolved & closed</div>
        </div>

        {/* 5. Today's Scheduled Visits */}
        <div
          onClick={() => setActiveTab('visits')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-blue-400 hover:shadow-md cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Today Visits</span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{cards.today_scheduled_visits}</div>
          <div className="text-[11px] text-sky-600 font-medium">Scheduled for today</div>
        </div>

        {/* 6. Overdue Tasks */}
        <div
          onClick={() => {
            setActiveTab('tickets');
            setTicketStatusFilter('all');
          }}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-rose-400 hover:shadow-md cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Overdue</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">{cards.overdue_service_tasks}</div>
          <div className="text-[11px] text-rose-600 font-medium">Requires immediate action</div>
        </div>

        {/* 7. Pending Spare Parts Requests */}
        <div
          onClick={() => setActiveTab('parts')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-purple-400 hover:shadow-md cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Parts Req</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{cards.pending_spare_parts_requests}</div>
          <div className="text-[11px] text-purple-600 font-medium">Awaiting store issue</div>
        </div>
      </div>

      {/* Main Grid: Status Chart + Pending Confirmations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Service Status & Work Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Service Tickets Status Distribution</h2>
            </div>
            <span className="text-xs text-slate-400">Live Database Overview</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(sections.service_status_chart || {}).map(([label, count]) => (
              <div key={label} className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl text-center">
                <p className="text-[11px] font-semibold text-slate-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-slate-900">{count}</p>
              </div>
            ))}
          </div>

          {/* Today's Scheduled Visits Summary */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                Today's Field Visits ({sections.today_site_visits?.length || 0})
              </h3>
              <button
                onClick={() => setActiveTab('visits')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {sections.today_site_visits && sections.today_site_visits.length > 0 ? (
              <div className="space-y-2">
                {sections.today_site_visits.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{v.customer_name}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold uppercase">
                          {v.service_type?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {v.site_address}
                        {v.contact_phone && (
                          <span className="ml-2 flex items-center gap-1 text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" /> {v.contact_phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 font-bold rounded-lg text-xs">
                        {v.visit_time}
                      </span>
                      <button
                        onClick={() => {
                          setReportForm({
                            ticket_id: v.ticket_id || '',
                            customer_id: v.customer_id || '',
                            customer_name: v.customer_name || '',
                            equipment_name: 'Field Equipment',
                            serial_number: '',
                            work_performed: '',
                            hours_spent: 2.0,
                            recommendations: '',
                            customer_confirmation_status: 'pending',
                          });
                          setModalType('report');
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition"
                      >
                        Record Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                No scheduled site visits for today.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Pending Customer Confirmations & Recent Activity */}
        <div className="space-y-6">
          {/* Pending Confirmations */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Pending Customer Confirmations
              </h3>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-full">
                {sections.pending_customer_confirmations?.length || 0}
              </span>
            </div>

            {sections.pending_customer_confirmations && sections.pending_customer_confirmations.length > 0 ? (
              <div className="space-y-2.5">
                {sections.pending_customer_confirmations.slice(0, 4).map((r) => (
                  <div key={r.id} className="p-2.5 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{r.report_number}</span>
                      <span className="text-amber-700 text-[10px] uppercase font-bold">Awaiting Sign-off</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{r.customer_name} • {r.equipment_name}</p>
                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-amber-100">
                      <span className="text-[10px] text-slate-400">{r.hours_spent} hrs logged</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSignOffReport(r.id)}
                          disabled={submitting}
                          className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          Sign Off <CheckCircle className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ open: true, type: 'report', id: r.id, title: `Report ${r.report_number}` })}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                All completed jobs have been confirmed by clients.
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Recent Field Activities
            </h3>
            <div className="space-y-3">
              {(sections.recent_activities || []).slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{act.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 p-4 gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              My Assigned Service Tickets ({sections.my_assigned_tickets?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('visits')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'visits' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Site Visits Schedule ({sections.today_site_visits?.length + (sections.upcoming_maintenance_schedule?.length || 0)})
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'reports' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Service Reports ({sections.recent_service_reports?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('parts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'parts' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Spare Parts Requests ({sections.recent_spare_parts_requests?.length || 0})
            </button>
          </div>

          {/* Search bar inside tab header */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Assigned Tickets */}
        {activeTab === 'tickets' && (
          <div className="p-4">
            {/* Status Filter Chips */}
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 overflow-x-auto text-xs">
              <span className="text-slate-400 font-medium">Filter by status:</span>
              {['all', 'open', 'in_progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setTicketStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] transition ${
                    ticketStatusFilter === status
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Ticket #</th>
                    <th className="p-3">Customer & Subject</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-bold text-blue-600 font-mono">{t.ticket_number}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{t.subject}</div>
                          <div className="text-[11px] text-slate-400">{t.customer?.name || 'Customer'}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : t.priority === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              t.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">
                          {t.resolution_due_at ? new Date(t.resolution_due_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedTicket(t);
                                setModalType('view_ticket');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                setStatusForm({ ticket_id: t.id, status: t.status, notes: '' });
                                setModalType('status');
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-semibold transition"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => {
                                setCompleteForm({
                                  ticket_id: t.id,
                                  resolution_summary: 'Service work completed on site',
                                  sign_off_status: 'signed_off',
                                });
                                setModalType('complete');
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-semibold transition"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ open: true, type: 'ticket', id: t.id, title: `Service Ticket ${t.ticket_number}` })}
                              className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              title="Delete Service Ticket"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">
                        No service tickets found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Site Visits Schedule */}
        {activeTab === 'visits' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Scheduled Customer Site Visits
              </h3>
              <button
                onClick={() => setModalType('visit')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule New Visit
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Visit Date & Time</th>
                    <th className="p-3">Customer / Plant</th>
                    <th className="p-3">Site Location Address</th>
                    <th className="p-3">Service Type</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...(sections.today_site_visits || []), ...(sections.upcoming_maintenance_schedule || [])].map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-semibold text-slate-900">
                        {v.visit_date} • <span className="text-blue-600">{v.visit_time}</span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{v.customer_name}</td>
                      <td className="p-3 text-slate-500">{v.site_address}</td>
                      <td className="p-3 font-semibold text-slate-700 uppercase text-[10px]">
                        {v.service_type?.replace('_', ' ')}
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{v.contact_phone || 'N/A'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                          {v.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setConfirmDelete({ open: true, type: 'visit', id: v.id, title: `Visit for ${v.customer_name}` })}
                          className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                          title="Cancel & Delete Visit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Recent Service Reports */}
        {activeTab === 'reports' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Field Service Reports
              </h3>
              <button
                onClick={() => setModalType('report')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> File Service Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Report #</th>
                    <th className="p-3">Customer & Equipment</th>
                    <th className="p-3">Work Performed</th>
                    <th className="p-3">Hours Spent</th>
                    <th className="p-3">Client Confirmation</th>
                    <th className="p-3">Date Completed</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(sections.recent_service_reports || []).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-emerald-700 font-mono">{r.report_number}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{r.customer_name}</div>
                        <div className="text-[11px] text-slate-400">{r.equipment_name} {r.serial_number ? `(${r.serial_number})` : ''}</div>
                      </td>
                      <td className="p-3 max-w-xs truncate text-slate-600">{r.work_performed}</td>
                      <td className="p-3 font-semibold text-slate-800">{r.hours_spent} hrs</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.customer_confirmation_status === 'signed_off'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.customer_confirmation_status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {r.completed_at ? new Date(r.completed_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.customer_confirmation_status !== 'signed_off' && (
                            <button
                              onClick={() => handleSignOffReport(r.id)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                            >
                              Sign Off
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDelete({ open: true, type: 'report', id: r.id, title: `Report ${r.report_number}` })}
                            className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Spare Parts Requests */}
        {activeTab === 'parts' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Spare Parts Requisitions (Sent to Store Executive)
              </h3>
              <button
                onClick={() => setModalType('parts')}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Request Spare Parts
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Requisition #</th>
                    <th className="p-3">Required Items</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Site Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Required Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(sections.recent_spare_parts_requests || []).map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-purple-700 font-mono">{pr.request_number}</td>
                      <td className="p-3">
                        {pr.items && pr.items.length > 0 ? (
                          pr.items.map((it, idx) => (
                            <div key={idx} className="font-semibold text-slate-800">
                              {it.product?.name || 'Part'} × {it.quantity_requested} {it.unit}
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400">No items listed</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            pr.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pr.priority}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{pr.site_location || 'Customer Site'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            pr.status === 'issued'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pr.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{pr.required_date || 'ASAP'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setConfirmDelete({ open: true, type: 'parts', id: pr.id, title: `Requisition ${pr.request_number}` })}
                          className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                          title="Cancel & Delete Requisition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* QUICK ACTION MODALS */}

      {/* Modal 1: Update Status */}
      <AnimatePresence>
        {modalType === 'status' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" /> Update Service Status
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Service Ticket *</label>
                  <select
                    value={statusForm.ticket_id}
                    onChange={(e) => setStatusForm({ ...statusForm, ticket_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose ticket...</option>
                    {(sections.my_assigned_tickets || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.ticket_number} - {t.subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Service Status *</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  >
                    <option value="open">Open (Pending Engineer)</option>
                    <option value="in_progress">In Progress (Active On-Site)</option>
                    <option value="completed">Completed / Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Notes</label>
                  <textarea
                    rows="3"
                    value={statusForm.notes}
                    onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                    placeholder="Details about work in progress, findings..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Updating...' : 'Save Status'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Schedule Visit */}
      <AnimatePresence>
        {modalType === 'visit' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Schedule Field Site Visit
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleScheduleVisit} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Client *</label>
                  <input
                    type="text"
                    value={visitForm.customer_name}
                    onChange={(e) => setVisitForm({ ...visitForm, customer_name: e.target.value })}
                    placeholder="Company or client name"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Visit Date *</label>
                    <input
                      type="date"
                      value={visitForm.visit_date}
                      onChange={(e) => setVisitForm({ ...visitForm, visit_date: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Visit Time *</label>
                    <input
                      type="text"
                      value={visitForm.visit_time}
                      onChange={(e) => setVisitForm({ ...visitForm, visit_time: e.target.value })}
                      placeholder="e.g. 10:30 AM"
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                    <select
                      value={visitForm.service_type}
                      onChange={(e) => setVisitForm({ ...visitForm, service_type: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="breakdown_repair">Breakdown Repair</option>
                      <option value="preventive_maintenance">Preventive Maintenance</option>
                      <option value="installation">Installation</option>
                      <option value="warranty_inspection">Warranty Inspection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={visitForm.contact_phone}
                      onChange={(e) => setVisitForm({ ...visitForm, contact_phone: e.target.value })}
                      placeholder="+91 98200..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site Plant Address *</label>
                  <input
                    type="text"
                    value={visitForm.site_address}
                    onChange={(e) => setVisitForm({ ...visitForm, site_address: e.target.value })}
                    placeholder="Plant bay, industrial area, city..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visit Instructions & Tools Required</label>
                  <textarea
                    rows="2"
                    value={visitForm.notes}
                    onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                    placeholder="Specific calibration equipment, safety gear..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Create Service Report */}
      <AnimatePresence>
        {modalType === 'report' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> Create Field Service Report
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer / Client *</label>
                    <input
                      type="text"
                      value={reportForm.customer_name}
                      onChange={(e) => setReportForm({ ...reportForm, customer_name: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Equipment Name *</label>
                    <input
                      type="text"
                      value={reportForm.equipment_name}
                      onChange={(e) => setReportForm({ ...reportForm, equipment_name: e.target.value })}
                      placeholder="e.g. Hydraulic Pump #3"
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                    <input
                      type="text"
                      value={reportForm.serial_number}
                      onChange={(e) => setReportForm({ ...reportForm, serial_number: e.target.value })}
                      placeholder="e.g. SN-8821"
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hours Spent *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={reportForm.hours_spent}
                      onChange={(e) => setReportForm({ ...reportForm, hours_spent: parseFloat(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Performed & Diagnostics *</label>
                  <textarea
                    rows="3"
                    value={reportForm.work_performed}
                    onChange={(e) => setReportForm({ ...reportForm, work_performed: e.target.value })}
                    placeholder="Detailed breakdown of repairs, parts installed, tests passed..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recommendations for Client</label>
                  <input
                    type="text"
                    value={reportForm.recommendations}
                    onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })}
                    placeholder="Next lubrication in 90 days, monitor pressure..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Confirmation Status</label>
                  <select
                    value={reportForm.customer_confirmation_status}
                    onChange={(e) => setReportForm({ ...reportForm, customer_confirmation_status: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pending">Pending Client Verification</option>
                    <option value="signed_off">Signed Off On-Site</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Request Spare Parts */}
      <AnimatePresence>
        {modalType === 'parts' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" /> Requisition Spare Parts from Store
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRequestParts} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Spare Part Product *</label>
                  <select
                    value={partsForm.product_id}
                    onChange={(e) => setPartsForm({ ...partsForm, product_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold"
                    required
                  >
                    <option value="">Select item...</option>
                    {(lookups.products || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) - In Stock: {p.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity Needed *</label>
                    <input
                      type="number"
                      min="1"
                      value={partsForm.quantity}
                      onChange={(e) => setPartsForm({ ...partsForm, quantity: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                    <select
                      value={partsForm.priority}
                      onChange={(e) => setPartsForm({ ...partsForm, priority: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent Breakdown</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Required By Date *</label>
                    <input
                      type="date"
                      value={partsForm.required_date}
                      onChange={(e) => setPartsForm({ ...partsForm, required_date: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Issue Warehouse</label>
                    <select
                      value={partsForm.warehouse_id}
                      onChange={(e) => setPartsForm({ ...partsForm, warehouse_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Default Warehouse</option>
                      {(lookups.warehouses || []).map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Site Location *</label>
                  <input
                    type="text"
                    value={partsForm.site_location}
                    onChange={(e) => setPartsForm({ ...partsForm, site_location: e.target.value })}
                    placeholder="e.g. Unit 3 Valve Station, Hazira Complex"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Justification & Ticket Reference</label>
                  <textarea
                    rows="2"
                    value={partsForm.notes}
                    onChange={(e) => setPartsForm({ ...partsForm, notes: e.target.value })}
                    placeholder="Urgent replacement required to clear hydraulic fault..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Submitting...' : 'Send Request to Store'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 5: Complete Job */}
      <AnimatePresence>
        {modalType === 'complete' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Complete & Close Service Job
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCompleteJob} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resolution Summary *</label>
                  <textarea
                    rows="3"
                    value={completeForm.resolution_summary}
                    onChange={(e) => setCompleteForm({ ...completeForm, resolution_summary: e.target.value })}
                    placeholder="Replaced damaged seal, tested under 150 bar load, zero leakage verified."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Sign-off Verification</label>
                  <select
                    value={completeForm.sign_off_status}
                    onChange={(e) => setCompleteForm({ ...completeForm, sign_off_status: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="signed_off">Signed Off by Client Site Engineer</option>
                    <option value="pending">Pending Client Digital Signature</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Finalizing...' : 'Finalize & Close Job'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 6: View Ticket Details */}
      <AnimatePresence>
        {modalType === 'view_ticket' && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" /> Ticket Details: {selectedTicket.ticket_number}
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedTicket.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Customer</span>
                    <p className="font-bold text-slate-800">{selectedTicket.customer?.name || 'Customer'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Priority</span>
                    <p className="font-bold text-slate-800 uppercase">{selectedTicket.priority}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Status</span>
                    <p className="font-bold text-blue-600 uppercase">{selectedTicket.status?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Resolution Due</span>
                    <p className="font-semibold text-slate-700">
                      {selectedTicket.resolution_due_at ? new Date(selectedTicket.resolution_due_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                  <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedTicket.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setStatusForm({ ticket_id: selectedTicket.id, status: selectedTicket.status, notes: '' });
                      setModalType('status');
                    }}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setModalType(null)}
                    className="px-4 py-1.5 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 7: Create New Service Ticket / Request */}
      <AnimatePresence>
        {modalType === 'new_ticket' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-600" /> Create New Service Request
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Client *</label>
                  <select
                    value={ticketForm.customer_id}
                    onChange={(e) => setTicketForm({ ...ticketForm, customer_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  >
                    <option value="">Select customer...</option>
                    {(lookups.customers || []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.city ? `(${c.city})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Subject / Equipment Issue *</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="e.g. Hydraulic Ram Cylinder Oil Leakage & Pressure Loss"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Priority Level *</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                      required
                    >
                      <option value="low">Low (General Checkup)</option>
                      <option value="medium">Medium (Standard Maintenance)</option>
                      <option value="high">High (Production Impact)</option>
                      <option value="urgent">Urgent (Breakdown Emergency)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Resolution Date</label>
                    <input
                      type="date"
                      value={ticketForm.resolution_due_at}
                      onChange={(e) => setTicketForm({ ...ticketForm, resolution_due_at: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Detailed Problem Description *</label>
                  <textarea
                    rows="3"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    placeholder="Symptoms observed by operator, alarm codes, location on plant floor..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Service Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal: Delete Record */}
      <AnimatePresence>
        {confirmDelete.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to permanently delete <strong className="text-slate-800">{confirmDelete.title}</strong>?
                </p>
                <p className="text-[11px] text-rose-600 mt-2 bg-rose-50 p-2 rounded-lg font-medium">
                  This record will be permanently deleted from the database and dashboard metrics will update immediately.
                </p>

                <div className="flex items-center justify-center gap-2 mt-5">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete({ open: false, type: null, id: null, title: '' })}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={submitting}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
