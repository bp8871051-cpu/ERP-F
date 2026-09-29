import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const LeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Apply Leave Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type_id: '1',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    days: 1,
    reason: '',
  });

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [lvRes, empRes, balRes] = await Promise.all([
        hrmService.getLeaveRequests({ status: statusFilter || undefined }),
        hrmService.getEmployees(),
        hrmService.getLeaveBalances(),
      ]);
      setLeaves(lvRes || []);
      setEmployees(empRes || []);
      setLeaveBalances(balRes || []);
      if (empRes && empRes.length > 0 && !formData.employee_id) {
        setFormData((prev) => ({ ...prev, employee_id: empRes[0].id }));
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setError('Unable to load leave requests and allocations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await hrmService.approveLeave(id);
      setSuccessMessage('Leave application approved & balance updated.');
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchLeaveData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Specify justification for leave rejection:');
    if (!reason) return;
    try {
      setActionLoading(true);
      await hrmService.rejectLeave(id, reason);
      setSuccessMessage('Leave request rejected.');
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchLeaveData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.createLeaveRequest(formData);
      setSuccessMessage('Leave request submitted for managerial review.');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      fetchLeaveData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const q = searchTerm.toLowerCase();
    const name = `${l.employee?.first_name || ''} ${l.employee?.last_name || ''}`.toLowerCase();
    const type = l.leave_type?.name?.toLowerCase() || '';
    const reason = l.reason?.toLowerCase() || '';
    return name.includes(q) || type.includes(q) || reason.includes(q);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="warning">Pending Review</Badge>;
    }
  };

  if (loading && leaves.length === 0) return <LoadingSkeleton type="table" />;
  if (error && leaves.length === 0) return <ErrorState message={error} onRetry={fetchLeaveData} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Management & Time Off</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track annual quotas, sick leaves, manager approvals, and automated calendar adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Apply For Leave
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Leave Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { name: 'Casual Leave (CL)', allocated: 12, used: 4, remaining: 8, color: 'text-teal-600' },
          { name: 'Sick Leave (SL)', allocated: 10, used: 2, remaining: 8, color: 'text-blue-600' },
          { name: 'Paid / Earned Leave', allocated: 18, used: 5, remaining: 13, color: 'text-indigo-600' },
          { name: 'Compensatory Off', allocated: 5, used: 1, remaining: 4, color: 'text-amber-600' },
        ].map((bal, idx) => (
          <Card key={idx} className="p-4 bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">{bal.name}</span>
              <Calendar className={`w-4 h-4 ${bal.color}`} />
            </div>
            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">Remaining</span>
                <span className="text-xl font-bold text-slate-900">{bal.remaining} Days</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {bal.used} used of {bal.allocated}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4 bg-white shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff, leave type, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            >
              <option value="">All Applications</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Leave Requests Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Timeframe</th>
                <th className="py-3 px-4 text-center">Days</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Manager Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No leave requests found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {l.employee?.first_name} {l.employee?.last_name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {l.employee?.employee_code} • {l.employee?.department?.name || 'Staff'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {l.leave_type?.name || 'Casual Leave'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {l.start_date} to {l.end_date}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {l.days} {l.days === 1 ? 'day' : 'days'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{l.reason || '—'}</td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(l.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {l.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(l.id)}
                            title="Approve Leave"
                            disabled={actionLoading}
                            className="p-1 rounded text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(l.id)}
                            title="Reject Leave"
                            disabled={actionLoading}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Submit Leave Application</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Staff Member *</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.employee_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Leave Category *</label>
                <select
                  value={formData.leave_type_id}
                  onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  <option value="1">Casual Leave (CL)</option>
                  <option value="2">Sick Leave (SL)</option>
                  <option value="3">Paid / Earned Leave</option>
                  <option value="4">Compensatory Off</option>
                  <option value="5">Maternity / Paternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Total Days *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason / Justification</label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g. Medical doctor consultation, personal commitments..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveList;
