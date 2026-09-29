import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Building,
  Mail,
  Phone,
  Briefcase,
  CheckCircle,
  Clock,
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

export const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchEmployeesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empRes, depRes, desRes] = await Promise.all([
        hrmService.getEmployees({
          department_id: departmentFilter || undefined,
          status: statusFilter || undefined,
          employment_type: employmentTypeFilter || undefined,
        }),
        hrmService.getDepartments(),
        hrmService.getDesignations(),
      ]);
      setEmployees(empRes || []);
      setDepartments(depRes || []);
      setDesignations(desRes || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Unable to load employee roster from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, [departmentFilter, statusFilter, employmentTypeFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to terminate/remove record for ${name}?`)) return;
    try {
      setActionLoading(true);
      await hrmService.deleteEmployee(id);
      setSuccessMessage(`Employee ${name} record updated.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchEmployeesData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee record');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    const name = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const code = emp.employee_code?.toLowerCase() || '';
    const email = emp.email?.toLowerCase() || '';
    const dept = emp.department?.name?.toLowerCase() || '';
    const des = emp.designation?.name?.toLowerCase() || '';
    return name.includes(q) || code.includes(q) || email.includes(q) || dept.includes(q) || des.includes(q);
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const displayedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'on_leave':
        return <Badge variant="warning">On Leave</Badge>;
      case 'terminated':
        return <Badge variant="danger">Terminated</Badge>;
      case 'resigned':
        return <Badge variant="neutral">Resigned</Badge>;
      case 'inactive':
      default:
        return <Badge variant="neutral">Inactive</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Email', 'Phone', 'Type', 'Joining Date', 'Status'];
    const rows = filteredEmployees.map((e) => [
      e.employee_code,
      `${e.first_name} ${e.last_name}`,
      e.department?.name || 'N/A',
      e.designation?.name || 'N/A',
      e.email,
      e.phone || 'N/A',
      e.employment_type,
      e.joining_date,
      e.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `employees_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && employees.length === 0) return <LoadingSkeleton type="table" />;
  if (error && employees.length === 0) return <ErrorState message={error} onRetry={fetchEmployeesData} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Employee Roster</h1>
          <p className="text-xs text-slate-500 mt-1">
            Personnel profiles, organizational hierarchy, contractual terms, and compensation structures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export Roster
          </Button>
          <Link to="/app/hrm/employees/create">
            <Button variant="teal" size="sm" icon={UserPlus}>
              Onboard Employee
            </Button>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, code, email, designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={employmentTypeFilter}
              onChange={(e) => setEmploymentTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            >
              <option value="">All Employment Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="resigned">Resigned</option>
              <option value="terminated">Terminated</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Employees Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Contact Channels</th>
                <th className="py-3 px-4">Joined On</th>
                <th className="py-3 px-4">Contract Type</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No employees matching the search filters.
                  </td>
                </tr>
              ) : (
                displayedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-[11px]">
                      <Link
                        to={`/app/hrm/employees/${emp.id}`}
                        className="text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        {emp.employee_code}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {emp.first_name?.[0]}
                          {emp.last_name?.[0]}
                        </div>
                        <div>
                          <Link
                            to={`/app/hrm/employees/${emp.id}`}
                            className="font-semibold text-slate-900 hover:text-teal-600 block"
                          >
                            {emp.first_name} {emp.middle_name ? `${emp.middle_name} ` : ''}{emp.last_name}
                          </Link>
                          <span className="text-[10px] text-slate-400 capitalize">{emp.gender || 'Staff'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">
                        {emp.department?.name || 'General Operations'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {emp.designation?.name || 'Staff Associate'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{emp.email}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">{emp.joining_date}</td>
                    <td className="py-3 px-4 capitalize text-slate-600">
                      {emp.employment_type?.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(emp.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/app/hrm/employees/${emp.id}`}
                          title="View Profile"
                          className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(emp.id, `${emp.first_name} ${emp.last_name}`)}
                          title="Delete / Terminate"
                          disabled={actionLoading}
                          className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} staff
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
    </div>
  );
};

export default EmployeeList;
