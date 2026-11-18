import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Plus, Search, CheckCircle, XCircle, Clock,
  User, AlertCircle, X, Check, Filter, Trash2, Eye,
  Briefcase, Heart, AlertTriangle, Coffee, FileText,
  ChevronRight, ArchiveRestore, Download, RefreshCw,
  ShieldCheck, Users, Database,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';
import { useAuth } from '../../../context/AuthContext';

// ─── Leave type config ──────────────────────────────────────────────────────
const LEAVE_TYPES = [
  { id: 'sick',      label: 'Sick Leave',      icon: Heart,        color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-200' },
  { id: 'personal',  label: 'Personal Leave',  icon: User,         color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  { id: 'emergency', label: 'Emergency Leave', icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  { id: 'casual',    label: 'Casual Leave',    icon: Coffee,       color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-200' },
  { id: 'official',  label: 'Official Leave',  icon: Briefcase,    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
];

const LEAVE_TYPE_MAP = Object.fromEntries(LEAVE_TYPES.map(t => [t.id, t]));

const getLeaveTypeMeta = (leaveTypeName) => {
  if (!leaveTypeName) return LEAVE_TYPE_MAP['casual'];
  const lower = leaveTypeName.toLowerCase();
  if (lower.includes('sick'))      return LEAVE_TYPE_MAP['sick'];
  if (lower.includes('personal'))  return LEAVE_TYPE_MAP['personal'];
  if (lower.includes('emergency')) return LEAVE_TYPE_MAP['emergency'];
  if (lower.includes('official'))  return LEAVE_TYPE_MAP['official'];
  return LEAVE_TYPE_MAP['casual'];
};

// ─── Status badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status, stage }) => {
  if (status === 'approved') return <Badge variant="success">Approved</Badge>;
  if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
  if (stage === 'hr_review') return <Badge variant="info">HR Review</Badge>;
  return <Badge variant="warning">Pending</Badge>;
};

// ─── Approval stage indicator ────────────────────────────────────────────────
const ApprovalTrail = ({ status, approvalStage }) => {
  const stages = [
    { key: 'submitted',  label: 'Submitted' },
    { key: 'manager',    label: 'Manager' },
    { key: 'hr',         label: 'HR Manager' },
    { key: 'done',       label: 'Final' },
  ];

  const getStageIndex = () => {
    if (status === 'rejected') return -1;
    if (status === 'approved') return 4;
    if (approvalStage === 'hr_review') return 2;
    return 1; // pending = at manager
  };

  const currentIndex = getStageIndex();

  return (
    <div className="flex items-center gap-1">
      {stages.map((s, i) => (
        <React.Fragment key={s.key}>
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'rejected'
                ? 'bg-slate-200'
                : i <= currentIndex
                ? i === currentIndex && status !== 'approved'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-500'
                : 'bg-slate-200'
            }`}
            title={s.label}
          />
          {i < stages.length - 1 && (
            <div className={`w-3 h-0.5 ${i < currentIndex && status !== 'rejected' ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const LeaveList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leaves, setLeaves]       = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dbLeaveTypes, setDbLeaveTypes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm]   = useState(null);

  // Filters
  const [statusFilter,    setStatusFilter]    = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [searchTerm,      setSearchTerm]      = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id:   '',
    leave_type:    'sick',
    start_date:    new Date().toISOString().slice(0, 10),
    end_date:      new Date().toISOString().slice(0, 10),
    reason:        '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Role helpers
  const isAdmin      = user?.role === 'Super Admin' || user?.role === 'Admin';
  const isHRManager  = user?.role === 'HR Manager'  || isAdmin;
  const isManager    = user?.is_manager || isAdmin;
  const canApprove   = isManager || isHRManager;
  const canDelete    = isHRManager;

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [lvRes, empRes, ltRes] = await Promise.all([
        hrmService.getLeaveRequests({
          status:     statusFilter     || undefined,
          leave_type: leaveTypeFilter  || undefined,
        }),
        hrmService.getEmployees({ all: true }),
        hrmService.getLeaveTypes(),
      ]);
      const raw = lvRes?.data || lvRes || [];
      const empList = Array.isArray(empRes) ? empRes : (empRes?.data || []);
      setLeaves(Array.isArray(raw) ? raw : (raw.data || []));
      setEmployees(empList);
      setDbLeaveTypes(Array.isArray(ltRes) ? ltRes : (ltRes?.data || []));
      if (empList?.length > 0 && !formData.employee_id) {
        setFormData(prev => ({ ...prev, employee_id: empList[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, leaveTypeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // ── validate ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const errs = {};
    if (!formData.employee_id) errs.employee_id = 'Staff member is required';
    if (!formData.leave_type)  errs.leave_type  = 'Leave type is required';
    if (!formData.start_date)  errs.start_date  = 'Start date is required';
    if (!formData.end_date)    errs.end_date    = 'End date is required';
    if (!formData.reason.trim()) errs.reason   = 'Reason is required';
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      errs.end_date = 'End date must be after start date';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setActionLoading(true);
      // Find the matching DB leave type by name keyword
      const leaveTypeKeywords = {
        sick:      ['sick', 'medical'],
        personal:  ['personal'],
        emergency: ['emergency', 'bereav'],
        casual:    ['casual'],
        official:  ['official', 'study', 'earned', 'paid'],
      };
      let matchedTypeId = null;
      if (dbLeaveTypes.length > 0) {
        const keywords = leaveTypeKeywords[formData.leave_type] || [formData.leave_type];
        const matched = dbLeaveTypes.find(lt =>
          keywords.some(kw => lt.name.toLowerCase().includes(kw))
        );
        matchedTypeId = matched?.id;
      }
      const payload = {
        employee_id:   formData.employee_id,
        leave_type_id: matchedTypeId || 1,
        start_date:    formData.start_date,
        end_date:      formData.end_date,
        reason:        formData.reason,
      };
      await hrmService.createLeaveRequest(payload);
      showSuccess('✅ Leave request submitted. Awaiting manager review.');
      setIsModalOpen(false);
      setFormData(prev => ({ ...prev, leave_type: 'sick', start_date: new Date().toISOString().slice(0,10), end_date: new Date().toISOString().slice(0,10), reason: '' }));
      setFormErrors({});
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response.data.errors || {}).flat().join(' ')
        : 'Failed to submit request';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // ── approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await hrmService.approveLeave(id);
      showSuccess('✅ Leave request approved & balances updated.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve leave');
    } finally {
      setActionLoading(false);
    }
  };

  // ── reject ────────────────────────────────────────────────────────────────
  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason?.trim()) return;
    try {
      setActionLoading(true);
      await hrmService.rejectLeave(id, reason);
      showSuccess('Leave request has been rejected.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      await hrmService.deleteLeave(id);
      setDeleteConfirm(null);
      showSuccess('Leave request deleted.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  // ── filter ────────────────────────────────────────────────────────────────
  const filteredLeaves = leaves.filter((l) => {
    const q    = searchTerm.toLowerCase();
    const name = `${l.employee?.first_name || ''} ${l.employee?.last_name || ''}`.toLowerCase();
    const type = (l.leave_type?.name || l.leave_type || '').toLowerCase();
    const dept = (l.employee?.department?.name || '').toLowerCase();
    const reason = (l.reason || '').toLowerCase();
    const matchesSearch = !q || name.includes(q) || type.includes(q) || dept.includes(q) || reason.includes(q);
    const matchesType   = !leaveTypeFilter || type.includes(leaveTypeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  // ── stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:    leaves.length,
    pending:  leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  if (loading && leaves.length === 0) return <LoadingSkeleton type="table" />;
  if (error && leaves.length === 0)   return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-5 pb-12">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" />
            Leave Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit & track leave requests — Sick, Personal, Emergency, Casual, Official
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              icon={Database}
              onClick={() => navigate('/app/hrm/leave/backup')}
            >
              All Leaves Backup
            </Button>
          )}
          {canApprove && (
            <Button
              variant="outline"
              size="sm"
              icon={ShieldCheck}
              onClick={() => navigate('/app/hrm/leave/approvals')}
            >
              Approvals
            </Button>
          )}
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Request
          </Button>
        </div>
      </div>

      {/* ── Success banner ──────────────────────────────────────────────────── */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── Stats Overview ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Requests', value: stats.total,    color: 'text-slate-700',   bg: 'bg-slate-50',   border: 'border-slate-200' },
          { label: 'Pending',        value: stats.pending,  color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
          { label: 'Approved',       value: stats.approved, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Rejected',       value: stats.rejected, color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200' },
        ].map((s) => (
          <Card key={s.label} className={`p-4 ${s.bg} border ${s.border} shadow-xs`}>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* ── Leave Type Quick Filters ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setLeaveTypeFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
            !leaveTypeFilter ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
          }`}
        >
          All Types
        </button>
        {LEAVE_TYPES.map((lt) => {
          const Icon = lt.icon;
          const active = leaveTypeFilter === lt.id;
          return (
            <button
              key={lt.id}
              onClick={() => setLeaveTypeFilter(active ? '' : lt.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                active ? `${lt.bg} ${lt.color} ${lt.border}` : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              <Icon className="w-3 h-3" />
              {lt.label}
            </button>
          );
        })}
      </div>

      {/* ── Filters Toolbar ──────────────────────────────────────────────────── */}
      <Card className="p-4 bg-white shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by employee, department, reason..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 focus:bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchData}
            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-center">Approval Trail</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No leave requests found</p>
                    <p className="text-[10px] mt-1">Try adjusting your filters or add a new request</p>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => {
                  const meta = getLeaveTypeMeta(l.leave_type?.name || l.leave_type);
                  const Icon = meta.icon;
                  const days = l.days_count || l.days || '—';
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-teal-700">
                              {(l.employee?.first_name?.[0] || '?')}{(l.employee?.last_name?.[0] || '')}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {l.employee?.first_name} {l.employee?.last_name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {l.employee?.employee_code} • {l.employee?.department?.name || 'Staff'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${meta.bg} ${meta.color} ${meta.border} border`}>
                          <Icon className="w-3 h-3" />
                          {l.leave_type?.name || (LEAVE_TYPE_MAP[l.leave_type]?.label) || 'Leave'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">{l.start_date} → {l.end_date}</span>
                        <span className="text-[10px] text-slate-400">{days} day{days !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="py-3 px-4 max-w-[180px]">
                        <p className="truncate text-slate-600" title={l.reason}>{l.reason || '—'}</p>
                        {l.rejection_reason && (
                          <p className="text-[10px] text-rose-500 truncate mt-0.5" title={l.rejection_reason}>
                            ✕ {l.rejection_reason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ApprovalTrail status={l.status} approvalStage={l.approval_stage} />
                        <p className="text-[9px] text-slate-400 mt-1">
                          {l.status === 'pending' ? (l.approval_stage === 'hr_review' ? 'At HR Manager' : 'At Manager') :
                           l.status === 'approved' ? 'Fully Approved' : 'Rejected'}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={l.status} stage={l.approval_stage} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {l.status === 'pending' && canApprove && (
                            <>
                              <button
                                onClick={() => handleApprove(l.id)}
                                disabled={actionLoading}
                                title="Approve"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(l.id)}
                                disabled={actionLoading}
                                title="Reject"
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteConfirm(l)}
                              disabled={actionLoading}
                              title="Delete"
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {!canApprove && !canDelete && (
                            <span className="text-[11px] text-slate-400 italic">
                              {l.status === 'pending' ? 'In Review' : 'Closed'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredLeaves.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-400">
            <span>Showing {filteredLeaves.length} of {leaves.length} leave requests</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" /> Pending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Approved</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Rejected</span>
            </div>
          </div>
        )}
      </Card>

      {/* ── New Request Modal ─────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">New Leave Request</h3>
                  <p className="text-[10px] text-slate-400">Request goes to Manager → HR Manager</p>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setFormErrors({}); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">

              {/* Approval flow info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-blue-700 text-[11px]">
                  Your request will first go to your <strong>Manager</strong>, then to the <strong>HR Manager</strong> for final approval.
                </p>
              </div>

              {/* Staff */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Staff Member <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white text-xs ${formErrors.employee_id ? 'border-rose-400' : 'border-slate-200'}`}
                >
                  <option value="">Select employee...</option>
                  {(employees || []).map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} — {emp.employee_code}
                    </option>
                  ))}
                </select>
                {formErrors.employee_id && <p className="text-rose-500 text-[10px] mt-1">{formErrors.employee_id}</p>}
              </div>

              {/* Leave Type */}
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  Leave Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LEAVE_TYPES.map((lt) => {
                    const Icon = lt.icon;
                    const sel  = formData.leave_type === lt.id;
                    return (
                      <button
                        key={lt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, leave_type: lt.id })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          sel ? `${lt.bg} ${lt.color} ${lt.border} ring-2 ring-offset-1 ${lt.border.replace('border-', 'ring-')}` : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${sel ? lt.color : 'text-slate-400'}`} />
                        {lt.label}
                      </button>
                    );
                  })}
                </div>
                {formErrors.leave_type && <p className="text-rose-500 text-[10px] mt-1">{formErrors.leave_type}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white text-xs ${formErrors.start_date ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                  {formErrors.start_date && <p className="text-rose-500 text-[10px] mt-1">{formErrors.start_date}</p>}
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    min={formData.start_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white text-xs ${formErrors.end_date ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                  {formErrors.end_date && <p className="text-rose-500 text-[10px] mt-1">{formErrors.end_date}</p>}
                </div>
              </div>
              {formData.start_date && formData.end_date && formData.end_date >= formData.start_date && (
                <p className="text-[10px] text-teal-600 -mt-2">
                  📅 Duration:{' '}
                  {Math.floor((new Date(formData.end_date) - new Date(formData.start_date)) / 86400000) + 1} day(s)
                </p>
              )}

              {/* Reason */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Reason / Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe the reason for your leave request..."
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white text-xs resize-none ${formErrors.reason ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {formErrors.reason && <p className="text-rose-500 text-[10px] mt-1">{formErrors.reason}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsModalOpen(false); setFormErrors({}); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" loading={actionLoading}>
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 p-6">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-center font-semibold text-slate-900 mb-2">Delete Leave Request?</h3>
            <p className="text-center text-xs text-slate-500 mb-5">
              This will permanently delete the leave request for <strong>{deleteConfirm.employee?.first_name} {deleteConfirm.employee?.last_name}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                loading={actionLoading}
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveList;
