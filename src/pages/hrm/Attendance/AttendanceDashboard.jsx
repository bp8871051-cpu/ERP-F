import React, { useState, useEffect } from 'react';
import {
  Clock,
  UserCheck,
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  Check,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const AttendanceDashboard = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Manual Mark Attendance Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    check_in: '09:00',
    check_out: '18:00',
    status: 'present',
    remarks: '',
  });

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const [attRes, empRes] = await Promise.all([
        hrmService.getAttendance({
          date: dateFilter || undefined,
          status: statusFilter || undefined,
        }),
        hrmService.getEmployees(),
      ]);
      setAttendances(attRes || []);
      setEmployees(empRes || []);
      if (empRes && empRes.length > 0 && !formData.employee_id) {
        setFormData((prev) => ({ ...prev, employee_id: empRes[0].id }));
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Unable to load attendance telemetry from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, [dateFilter, statusFilter]);

  const handleSelfCheckIn = async () => {
    try {
      setActionLoading(true);
      await hrmService.checkIn();
      setSuccessMessage('Check-in timestamp recorded successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchAttendanceRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed or already recorded for today');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelfCheckOut = async () => {
    try {
      setActionLoading(true);
      await hrmService.checkOut();
      setSuccessMessage('Check-out timestamp recorded. Working hours tabulated!');
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchAttendanceRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.markAttendance(formData);
      setSuccessMessage('Attendance override recorded.');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      fetchAttendanceRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAttendances = attendances.filter((att) => {
    const q = searchTerm.toLowerCase();
    const name = `${att.employee?.first_name || ''} ${att.employee?.last_name || ''}`.toLowerCase();
    const code = att.employee?.employee_code?.toLowerCase() || '';
    return name.includes(q) || code.includes(q);
  });

  const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);
  const displayedAttendances = filteredAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge variant="success">Present</Badge>;
      case 'late':
        return <Badge variant="warning">Late Arrival</Badge>;
      case 'half_day':
        return <Badge variant="teal">Half Day</Badge>;
      case 'absent':
        return <Badge variant="danger">Absent</Badge>;
      case 'leave':
        return <Badge variant="neutral">On Leave</Badge>;
      case 'holiday':
        return <Badge variant="info">Holiday</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee', 'Code', 'Date', 'Check In', 'Check Out', 'Hours', 'Late (min)', 'Overtime (min)', 'Status'];
    const rows = filteredAttendances.map((a) => [
      `${a.employee?.first_name} ${a.employee?.last_name}`,
      a.employee?.employee_code || 'N/A',
      a.date,
      a.check_in || '—',
      a.check_out || '—',
      (a.working_minutes / 60).toFixed(2),
      a.late_minutes || 0,
      a.overtime_minutes || 0,
      a.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `attendance_export_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && attendances.length === 0) return <LoadingSkeleton type="table" />;
  if (error && attendances.length === 0) return <ErrorState message={error} onRetry={fetchAttendanceRecords} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Attendance & Shifts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric check-in timestamps, automated late detection, overtime, and work duration tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Check-in/out */}
          <Button
            variant="teal"
            size="sm"
            icon={Play}
            loading={actionLoading}
            onClick={handleSelfCheckIn}
          >
            Check In
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Square}
            loading={actionLoading}
            onClick={handleSelfCheckOut}
          >
            Check Out
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Mark Entry
          </Button>
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Toolbar */}
      <Card className="p-4 bg-white shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late Arrival</option>
              <option value="absent">Absent</option>
              <option value="half_day">Half Day</option>
              <option value="leave">On Leave</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4 text-center">Working Hours</th>
                <th className="py-3 px-4 text-center">Late (Min)</th>
                <th className="py-3 px-4 text-center">Overtime</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedAttendances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No attendance logs recorded for this day.
                  </td>
                </tr>
              ) : (
                displayedAttendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {att.employee?.first_name} {att.employee?.last_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {att.employee?.employee_code} • {att.employee?.department?.name || 'Staff'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">{att.date}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {att.check_in || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {att.check_out || '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {att.working_minutes > 0
                        ? `${Math.floor(att.working_minutes / 60)}h ${att.working_minutes % 60}m`
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {att.late_minutes > 0 ? (
                        <span className="text-amber-600 font-semibold">{att.late_minutes}m late</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {att.overtime_minutes > 0 ? (
                        <span className="text-emerald-600 font-semibold">
                          +{att.overtime_minutes}m OT
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(att.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Manual Mark Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Log Attendance Entry</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkAttendance} className="p-5 space-y-4 text-xs">
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
                <label className="block font-medium text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Check In Time</label>
                  <input
                    type="time"
                    value={formData.check_in}
                    onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Check Out Time</label>
                  <input
                    type="time"
                    value={formData.check_out}
                    onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Attendance Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs capitalize"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="absent">Absent</option>
                  <option value="leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Approved shift adjustment"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
                  Record Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;
