import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle, XCircle, Clock, ArrowLeft,
  Search, Filter, User, Calendar, Heart, AlertTriangle,
  Coffee, Briefcase, RefreshCw, Eye, CheckCheck, X,
  UserCheck, ChevronRight, AlertCircle,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';
import { useAuth } from '../../../context/AuthContext';

const LEAVE_TYPE_META = {
  sick:      { label: 'Sick Leave',      icon: Heart,         color: 'text-rose-600',   bg: 'bg-rose-50' },
  personal:  { label: 'Personal Leave',  icon: User,          color: 'text-violet-600', bg: 'bg-violet-50' },
  emergency: { label: 'Emergency Leave', icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50' },
  casual:    { label: 'Casual Leave',    icon: Coffee,        color: 'text-teal-600',   bg: 'bg-teal-50' },
  official:  { label: 'Official Leave',  icon: Briefcase,     color: 'text-blue-600',   bg: 'bg-blue-50' },
};

const getTypeMeta = (name) => {
  if (!name) return LEAVE_TYPE_META.casual;
  const l = name.toLowerCase();
  if (l.includes('sick'))      return LEAVE_TYPE_META.sick;
  if (l.includes('personal'))  return LEAVE_TYPE_META.personal;
  if (l.includes('emergency')) return LEAVE_TYPE_META.emergency;
  if (l.includes('official'))  return LEAVE_TYPE_META.official;
  return LEAVE_TYPE_META.casual;
};

// Two-level workflow card
const WorkflowBadge = ({ status, stage }) => {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <CheckCheck className="w-3 h-3" /> Fully Approved
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
        <X className="w-3 h-3" /> Rejected
      </span>
    );
  }
  if (stage === 'hr_review') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
        <ShieldCheck className="w-3 h-3" /> Awaiting HR Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3 animate-pulse" /> Awaiting Manager
    </span>
  );
};

export const LeaveApproval = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leaves, setLeaves]    = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id being actioned
  const [successMsg, setSuccessMsg]       = useState('');

  const [searchTerm,   setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter,   setTypeFilter]   = useState('');

  const isAdmin     = user?.role === 'Super Admin' || user?.role === 'Admin';
  const isHRManager = user?.role === 'HR Manager' || isAdmin;
  const isManager   = user?.is_manager || isAdmin;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getLeaveRequests({
        status:     statusFilter || undefined,
        leave_type: typeFilter   || undefined,
        per_page:   100,
      });
      const raw = res?.data || res || [];
      setLeaves(Array.isArray(raw) ? raw : (raw.data || []));
    } catch (err) {
      setError('Unable to load leave requests for approval.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await hrmService.approveLeave(id);
      showSuccess('✅ Leave approved successfully. Balance updated.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (required):');
    if (!reason?.trim()) return;
    setActionLoading(id);
    try {
      await hrmService.rejectLeave(id, reason);
      showSuccess('Leave request rejected.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = leaves.filter((l) => {
    const q    = searchTerm.toLowerCase();
    const name = `${l.employee?.first_name || ''} ${l.employee?.last_name || ''}`.toLowerCase();
    const type = (l.leave_type?.name || l.leave_type || '').toLowerCase();
    return (!q || name.includes(q) || type.includes(q) || (l.reason || '').toLowerCase().includes(q)) &&
           (!typeFilter || type.includes(typeFilter.toLowerCase()));
  });

  const pending    = leaves.filter(l => l.status === 'pending').length;
  const hrPending  = leaves.filter(l => l.status === 'pending' && l.approval_stage === 'hr_review').length;

  if (loading) return <LoadingSkeleton type="table" />;
  if (error)   return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-5 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app/hrm/leave')} className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              Leave Approvals
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHRManager ? 'HR Manager view — final authority' : 'Manager view — first level approval'}
            </p>
          </div>
        </div>
        <button onClick={fetchData} className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg border border-slate-200 transition-colors cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Approval Flow Explanation */}
      <Card className="p-4 bg-blue-50 border border-blue-100">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <p className="font-semibold mb-1">Two-Level Approval Workflow</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-medium">1. Employee submits request</span>
              <ChevronRight className="w-3 h-3 text-blue-400" />
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-medium">2. Manager reviews & approves</span>
              <ChevronRight className="w-3 h-3 text-blue-400" />
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-medium">3. HR Manager gives final approval</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',           value: leaves.length,       color: 'text-slate-700',   bg: 'bg-slate-50' },
          { label: 'Awaiting Action', value: pending,             color: 'text-amber-700',   bg: 'bg-amber-50' },
          { label: 'At HR Stage',     value: hrPending,           color: 'text-blue-700',    bg: 'bg-blue-50' },
          { label: 'Approved Today',  value: leaves.filter(l => l.status === 'approved' && l.approved_at?.startsWith(new Date().toISOString().slice(0,10))).length,
            color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map((s) => (
          <Card key={s.label} className={`p-4 ${s.bg} border border-slate-200 shadow-xs`}>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search employee, leave type, reason..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="">All Leave Types</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="emergency">Emergency Leave</option>
            <option value="casual">Casual Leave</option>
            <option value="official">Official Leave</option>
          </select>
        </div>
      </Card>

      {/* Approval Cards */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border border-slate-200">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">No leave requests found</p>
          <p className="text-xs text-slate-400 mt-1">All caught up! Check back later.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => {
            const meta  = getTypeMeta(l.leave_type?.name || l.leave_type);
            const Icon  = meta.icon;
            const days  = l.days_count || l.days || '?';
            const canAct = l.status === 'pending' && (
              (l.approval_stage !== 'hr_review' && isManager) ||
              (l.approval_stage === 'hr_review' && isHRManager)
            );
            return (
              <Card key={l.id} className={`border ${l.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : l.status === 'approved' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-white'}`}>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Employee */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-teal-700">
                        {(l.employee?.first_name?.[0] || '?')}{(l.employee?.last_name?.[0] || '')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {l.employee?.first_name} {l.employee?.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {l.employee?.employee_code} • {l.employee?.department?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${meta.bg} ${meta.color} border border-current/20`}>
                      <Icon className="w-3 h-3" />
                      {l.leave_type?.name || meta.label}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="text-xs">
                    <p className="font-medium text-slate-800">{l.start_date} → {l.end_date}</p>
                    <p className="text-slate-400">{days} day{days !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Workflow Status */}
                  <div className="min-w-[140px]">
                    <WorkflowBadge status={l.status} stage={l.approval_stage} />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {canAct ? (
                      <>
                        <button
                          onClick={() => handleApprove(l.id)}
                          disabled={actionLoading === l.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {actionLoading === l.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(l.id)}
                          disabled={actionLoading === l.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic px-2">
                        {l.status !== 'pending' ? '— Closed —' : '— Not your stage —'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reason */}
                {l.reason && (
                  <div className="px-4 pb-3 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <span className="font-medium text-slate-600">Reason: </span>{l.reason}
                    {l.rejection_reason && (
                      <span className="ml-3 text-rose-500"><span className="font-medium">Rejection: </span>{l.rejection_reason}</span>
                    )}
                    {l.approver && (
                      <span className="ml-3 text-slate-400">
                        · Reviewed by <span className="font-medium">{l.approver?.name}</span>
                      </span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-center text-[10px] text-slate-400 pt-2">
        Showing {filtered.length} of {leaves.length} requests
      </div>
    </div>
  );
};

export default LeaveApproval;

