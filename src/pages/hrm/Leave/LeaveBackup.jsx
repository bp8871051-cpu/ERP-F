import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, ArrowLeft, Search, Calendar, Download, RefreshCw,
  Filter, Heart, AlertTriangle, Coffee, Briefcase, User,
  CheckCircle, XCircle, Clock, Users, BarChart2, ChevronDown,
  FileDown, SlidersHorizontal,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';
import { useAuth } from '../../../context/AuthContext';

const LEAVE_TYPE_META = {
  sick:      { label: 'Sick Leave',      icon: Heart,         color: 'text-rose-600',   bg: 'bg-rose-50',   badge: 'danger' },
  personal:  { label: 'Personal Leave',  icon: User,          color: 'text-violet-600', bg: 'bg-violet-50', badge: 'info' },
  emergency: { label: 'Emergency Leave', icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50',  badge: 'warning' },
  casual:    { label: 'Casual Leave',    icon: Coffee,        color: 'text-teal-600',   bg: 'bg-teal-50',   badge: 'teal' },
  official:  { label: 'Official Leave',  icon: Briefcase,     color: 'text-blue-600',   bg: 'bg-blue-50',   badge: 'info' },
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

const StatusBadge = ({ status }) => {
  if (status === 'approved') return <Badge variant="success">Approved</Badge>;
  if (status === 'rejected') return <Badge variant="danger">Rejected</Badge>;
  return <Badge variant="warning">Pending</Badge>;
};

export const LeaveBackup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leaves, setLeaves]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Filters
  const [searchTerm,    setSearchTerm]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [typeFilter,    setTypeFilter]    = useState('');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [deptFilter,    setDeptFilter]    = useState('');
  const [showFilters,   setShowFilters]   = useState(true);

  // Derived
  const departments = [...new Set(leaves.map(l => l.employee?.department?.name).filter(Boolean))].sort();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmService.getLeaveRequests({
        status:     statusFilter || undefined,
        leave_type: typeFilter   || undefined,
        date_from:  dateFrom     || undefined,
        date_to:    dateTo       || undefined,
        per_page:   500,
      });
      const raw = res?.data || res || [];
      setLeaves(Array.isArray(raw) ? raw : (raw.data || []));
    } catch (err) {
      setError('Unable to load leave backup data.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Client-side additional filters
  const filtered = leaves.filter((l) => {
    const q    = searchTerm.toLowerCase();
    const name = `${l.employee?.first_name || ''} ${l.employee?.last_name || ''}`.toLowerCase();
    const type = (l.leave_type?.name || l.leave_type || '').toLowerCase();
    const dept = (l.employee?.department?.name || '').toLowerCase();
    const matchSearch = !q || name.includes(q) || type.includes(q) || dept.includes(q) || (l.reason || '').toLowerCase().includes(q);
    const matchDept   = !deptFilter || dept === deptFilter.toLowerCase();
    return matchSearch && matchDept;
  });

  // Summary stats
  const stats = {
    total:    filtered.length,
    pending:  filtered.filter(l => l.status === 'pending').length,
    approved: filtered.filter(l => l.status === 'approved').length,
    rejected: filtered.filter(l => l.status === 'rejected').length,
    totalDays: filtered.reduce((sum, l) => sum + (l.days_count || l.days || 0), 0),
  };

  // Type breakdown
  const typeBreakdown = Object.entries(LEAVE_TYPE_META).map(([key, meta]) => ({
    ...meta,
    count: filtered.filter(l => {
      const n = (l.leave_type?.name || l.leave_type || '').toLowerCase();
      return n.includes(key);
    }).length,
  }));

  // Export CSV
  const exportCSV = () => {
    const headers = ['ID', 'Employee', 'Employee Code', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Approved By', 'Approved At', 'Rejection Reason'];
    const rows = filtered.map(l => [
      l.id,
      `${l.employee?.first_name || ''} ${l.employee?.last_name || ''}`.trim(),
      l.employee?.employee_code || '',
      l.employee?.department?.name || '',
      l.leave_type?.name || l.leave_type || '',
      l.start_date || '',
      l.end_date   || '',
      l.days_count || l.days || '',
      (l.reason || '').replace(/,/g, ';'),
      l.status || '',
      l.approver?.name || '',
      l.approved_at   || '',
      (l.rejection_reason || '').replace(/,/g, ';'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `leave_backup_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setDeptFilter('');
  };

  const hasActiveFilters = searchTerm || statusFilter || typeFilter || dateFrom || dateTo || deptFilter;

  if (loading) return <LoadingSkeleton type="table" />;
  if (error)   return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-5 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/hrm/leave')}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-600" />
              All Leaves — Backup
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete history of all leave requests across all employees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${showFilters ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters {hasActiveFilters ? `(active)` : ''}
          </button>
          <button
            onClick={fetchData}
            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Records', value: stats.total,    color: 'text-slate-700',   bg: 'bg-slate-50' },
          { label: 'Pending',       value: stats.pending,  color: 'text-amber-700',   bg: 'bg-amber-50' },
          { label: 'Approved',      value: stats.approved, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Rejected',      value: stats.rejected, color: 'text-rose-700',    bg: 'bg-rose-50' },
          { label: 'Total Days',    value: stats.totalDays, color: 'text-indigo-700',  bg: 'bg-indigo-50' },
        ].map((s) => (
          <Card key={s.label} className={`p-4 ${s.bg} border border-slate-200 shadow-xs`}>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Type Breakdown */}
      <Card className="p-4 border border-slate-200 bg-white shadow-xs">
        <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-slate-400" />
          Leave Type Breakdown
        </p>
        <div className="flex flex-wrap gap-3">
          {typeBreakdown.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${t.bg} border border-current/10`}>
                <Icon className={`w-4 h-4 ${t.color}`} />
                <div>
                  <p className={`text-xs font-semibold ${t.color}`}>{t.count}</p>
                  <p className="text-[9px] text-slate-500">{t.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4 border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              Filter Options
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] text-rose-500 hover:text-rose-700 cursor-pointer underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search employee, dept, reason..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Leave Type */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="">All Leave Types</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="official">Official Leave</option>
            </select>

            {/* Date From */}
            <div>
              <label className="block text-[10px] text-slate-500 font-medium mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[10px] text-slate-500 font-medium mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Department */}
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchTerm    && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] border border-blue-200">Search: "{searchTerm}"</span>}
              {statusFilter  && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] border border-blue-200">Status: {statusFilter}</span>}
              {typeFilter    && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] border border-blue-200">Type: {typeFilter}</span>}
              {dateFrom      && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] border border-blue-200">From: {dateFrom}</span>}
              {dateTo        && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] border border-blue-200">To: {dateTo}</span>}
              {deptFilter    && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] border border-blue-200">Dept: {deptFilter}</span>}
            </div>
          )}
        </Card>
      )}

      {/* Data Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400" />
            Leave Records
          </h3>
          <span className="text-[10px] text-slate-400">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4 text-center">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Reviewed By</th>
                <th className="py-3 px-4">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No records found</p>
                    <p className="text-[10px] mt-1">Adjust your filters or date range</p>
                  </td>
                </tr>
              ) : (
                filtered.map((l, index) => {
                  const meta = getTypeMeta(l.leave_type?.name || l.leave_type);
                  const Icon = meta.icon;
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400">{index + 1}</td>
                      <td className="py-2.5 px-4">
                        <p className="font-semibold text-slate-900">
                          {l.employee?.first_name} {l.employee?.last_name}
                        </p>
                        <p className="text-[10px] text-slate-400">{l.employee?.employee_code}</p>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {l.employee?.department?.name || '—'}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${meta.bg} ${meta.color}`}>
                          <Icon className="w-2.5 h-2.5" />
                          {l.leave_type?.name || meta.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[10px] text-slate-700">{l.start_date}</td>
                      <td className="py-2.5 px-4 font-mono text-[10px] text-slate-700">{l.end_date}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-900">
                        {l.days_count || l.days || '—'}
                      </td>
                      <td className="py-2.5 px-4 max-w-[150px]">
                        <p className="truncate text-slate-600" title={l.reason}>{l.reason || '—'}</p>
                        {l.rejection_reason && (
                          <p className="text-[9px] text-rose-500 truncate" title={l.rejection_reason}>✕ {l.rejection_reason}</p>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {l.approver?.name || '—'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400">
                        {l.created_at ? new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={6} className="py-2.5 px-4 text-xs font-semibold text-slate-600">
                    Totals ({filtered.length} records)
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-slate-900 text-sm">
                    {stats.totalDays}
                  </td>
                  <td colSpan={4} className="py-2.5 px-4 text-[10px] text-slate-400">
                    Approved: {stats.approved} · Pending: {stats.pending} · Rejected: {stats.rejected}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

      <div className="text-center text-[10px] text-slate-400">
        Leave Backup — Generated on {new Date().toLocaleString('en-IN')}
      </div>
    </div>
  );
};

export default LeaveBackup;

