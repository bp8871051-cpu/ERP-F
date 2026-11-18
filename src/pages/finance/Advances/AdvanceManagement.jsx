import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, DollarSign, Clock, CheckCircle, 
  XCircle, AlertCircle, Eye, Trash2, ArrowUpRight, Building2, User, 
  Briefcase, CheckSquare, Layers, FileText, ChevronRight
} from 'lucide-react';
import financeService from '../../../services/financeService';
import projectService from '../../../services/projectService';
import hrmService from '../../../services/hrmService';
import purchaseService from '../../../services/purchaseService';

export default function AdvanceManagement() {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [notification, setNotification] = useState(null);

  // Reference lists for dropdowns
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    project: '',
    approval_level: '',
    date_from: '',
    date_to: ''
  });

  // New advance form state
  const initialForm = {
    title: '',
    description: '',
    advance_type: 'employees', // 'employees', 'vendor', 'project'
    project_amount: '',
    advance_date: new Date().toISOString().split('T')[0],
    expected_settlement_date: '',
    purpose: '',
    note: '',
    project_id: '',
    employee_id: '',
    vendor_id: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    loadReferences();
    loadAdvances();
  }, []);

  const loadReferences = async () => {
    try {
      if (projectService?.getProjects) {
        const prjRes = await projectService.getProjects({ all: true });
        const prjList = Array.isArray(prjRes) 
          ? prjRes 
          : (Array.isArray(prjRes?.data) 
              ? prjRes.data 
              : (prjRes?.data?.data || []));
        setProjects(prjList);
      }
    } catch (e) {
      console.warn("Projects load:", e);
    }

    try {
      if (hrmService?.getEmployees) {
        const empRes = await hrmService.getEmployees({ all: true });
        const empList = Array.isArray(empRes) 
          ? empRes 
          : (Array.isArray(empRes?.data) 
              ? empRes.data 
              : (empRes?.data?.data || []));
        setEmployees(empList);
      }
    } catch (e) {
      console.warn("Employees load:", e);
    }

    try {
      if (purchaseService?.getVendors) {
        const venRes = await purchaseService.getVendors({ all: true });
        const venList = Array.isArray(venRes) 
          ? venRes 
          : (Array.isArray(venRes?.data) 
              ? venRes.data 
              : (venRes?.data?.data || []));
        setVendors(venList);
      }
    } catch (e) {
      console.warn("Vendors load:", e);
    }
  };

  const loadAdvances = async () => {
    try {
      const activeFilters = {};
      if (filters.search) activeFilters.search = filters.search;
      if (filters.status) activeFilters.status = filters.status;
      if (filters.type) activeFilters.type = filters.type;
      if (filters.project) activeFilters.project_id = filters.project;
      if (filters.approval_level) activeFilters.approval_level = filters.approval_level;
      if (filters.date_from) activeFilters.date_from = filters.date_from;
      if (filters.date_to) activeFilters.date_to = filters.date_to;

      const res = await financeService.getAdvances(activeFilters);
      const list = res?.data 
        ? (Array.isArray(res.data) ? res.data : (res.data.data || [])) 
        : (Array.isArray(res) ? res : []);
      setAdvances(list);
    } catch (error) {
      console.error("Failed to load advances", error);
      notify("Failed to load advances", "error");
      setAdvances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e?.preventDefault();
    loadAdvances();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      type: '',
      project: '',
      approval_level: '',
      date_from: '',
      date_to: ''
    });
    setTimeout(() => {
      loadAdvances();
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.project_amount || !formData.advance_date) {
      notify("Please fill required fields (Title, Amount, Advance Date)", "error");
      return;
    }

    setSubmitting(true);
    try {
      await financeService.createAdvance({
        ...formData,
        project_amount: parseFloat(formData.project_amount)
      });
      notify("Advance request submitted successfully");
      setShowModal(false);
      setFormData(initialForm);
      loadAdvances();
    } catch (err) {
      console.error(err);
      notify(err.response?.data?.message || "Failed to create advance request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id, level) => {
    try {
      await financeService.approveAdvance(id, { approval_level: level });
      notify("Advance approved successfully");
      loadAdvances();
      if (showDetailModal && selectedAdvance?.id === id) {
        setShowDetailModal(false);
      }
    } catch (err) {
      notify("Failed to approve advance", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advance record?")) return;
    try {
      await financeService.deleteAdvance(id);
      notify("Advance deleted");
      loadAdvances();
    } catch (err) {
      notify("Failed to delete advance", "error");
    }
  };

  // Helper styles for badges
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>;
      case 'settled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><CheckSquare className="w-3 h-3 mr-1" /> Settled</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch(type) {
      case 'employees':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"><User className="w-3 h-3 mr-1" /> Employee</span>;
      case 'vendor':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"><Building2 className="w-3 h-3 mr-1" /> Vendor</span>;
      case 'project':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-50 text-cyan-700 border border-cyan-200"><Briefcase className="w-3 h-3 mr-1" /> Project</span>;
      default:
        return <span className="text-xs text-slate-500 capitalize">{type}</span>;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification Alert */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Advance Management</h1>
              <p className="text-sm text-slate-500">Track, approve, and manage advance requisitions across projects, employees, and vendors.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Advance Request
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
        <form onSubmit={applyFilters} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              name="search"
              placeholder="Search title, code..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="settled">Settled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white text-slate-700"
            >
              <option value="">All Advance Types</option>
              <option value="employees">Employees</option>
              <option value="vendor">Vendor</option>
              <option value="project">Project</option>
            </select>
          </div>

          {/* Project */}
          <div>
            <select
              name="project"
              value={filters.project}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white text-slate-700"
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.title || `Project #${p.id}`}</option>
              ))}
            </select>
          </div>

          {/* Approval Level */}
          <div>
            <select
              name="approval_level"
              value={filters.approval_level}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white text-slate-700"
            >
              <option value="">All Approval Levels</option>
              <option value="pending">Pending</option>
              <option value="manager">Manager Approved</option>
              <option value="finance">Finance Approved</option>
              <option value="director">Director Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-6">Code / Title</th>
                <th className="py-4 px-6">Advance Type</th>
                <th className="py-4 px-6">Associated Entity</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Dates</th>
                <th className="py-4 px-6">Approval Level</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
                    <p>Loading advances...</p>
                  </td>
                </tr>
              ) : advances.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No advance payment records found. Click "New Advance Request" to create one.
                  </td>
                </tr>
              ) : (
                advances.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-400 font-mono">{item.advance_number || `#ADV-${item.id}`}</div>
                    </td>
                    <td className="py-4 px-6">
                      {getTypeBadge(item.advance_type)}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {item.advance_type === 'project' && (item.project?.name || item.project?.title || 'Project Specific')}
                      {item.advance_type === 'employees' && (
                        <span>
                          {item.employee ? `${item.employee.first_name || ''} ${item.employee.last_name || ''}`.trim() : (item.user?.name || 'Employee Request')}
                        </span>
                      )}
                      {item.advance_type === 'vendor' && (item.vendor?.name || 'Vendor Pay')}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      ₹{parseFloat(item.project_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div><span className="text-slate-400">Issued:</span> {item.advance_date}</div>
                      {item.expected_settlement_date && (
                        <div><span className="text-slate-400">Settle By:</span> {item.expected_settlement_date}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {item.approval_level || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => { setSelectedAdvance(item); setShowDetailModal(true); }}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {item.status === 'pending' && (
                        <button
                          onClick={() => handleApprove(item.id, 'manager')}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">New Advance Payment Request</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Site Material Purchase Advance"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Advance Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Advance Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.advance_type}
                    onChange={(e) => setFormData({ ...formData, advance_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="employees">Employees</option>
                    <option value="vendor">Vendor</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                {/* Project Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Project Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.project_amount}
                    onChange={(e) => setFormData({ ...formData, project_amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Conditional Dropdown based on type */}
                {formData.advance_type === 'employees' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Select Employee
                    </label>
                    <select
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                    >
                      <option value="">Select an employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.employee_code || emp.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.advance_type === 'vendor' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Select Vendor
                    </label>
                    <select
                      value={formData.vendor_id}
                      onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                    >
                      <option value="">Select a vendor</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name || v.company_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Project selection */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Related Project (Optional)
                  </label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="">None / General</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name || p.title || `Project #${p.id}`}</option>
                    ))}
                  </select>
                </div>

                {/* Advance Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Advance Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.advance_date}
                    onChange={(e) => setFormData({ ...formData, advance_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Expected Settlement Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Expected Settlement Date
                  </label>
                  <input
                    type="date"
                    value={formData.expected_settlement_date}
                    onChange={(e) => setFormData({ ...formData, expected_settlement_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Purpose */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Purpose
                  </label>
                  <input
                    type="text"
                    placeholder="Short summary of purpose..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Detailed explanation of requirements..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  ></textarea>
                </div>

                {/* Note */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Note
                  </label>
                  <input
                    type="text"
                    placeholder="Additional remarks or disbursement terms..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Submit Advance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedAdvance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-600 font-bold">{selectedAdvance.advance_number || `#ADV-${selectedAdvance.id}`}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedAdvance.title}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span>{getStatusBadge(selectedAdvance.status)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Type</span>
                <span>{getTypeBadge(selectedAdvance.advance_type)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-emerald-600 text-base">₹{parseFloat(selectedAdvance.project_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Advance Date</span>
                <span className="font-medium text-slate-800">{selectedAdvance.advance_date}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Expected Settlement</span>
                <span className="font-medium text-slate-800">{selectedAdvance.expected_settlement_date || 'Not specified'}</span>
              </div>
              {selectedAdvance.purpose && (
                <div className="py-2 border-b border-slate-100">
                  <span className="text-slate-500 block text-xs uppercase mb-1">Purpose</span>
                  <p className="text-slate-800">{selectedAdvance.purpose}</p>
                </div>
              )}
              {selectedAdvance.description && (
                <div className="py-2 border-b border-slate-100">
                  <span className="text-slate-500 block text-xs uppercase mb-1">Description</span>
                  <p className="text-slate-800">{selectedAdvance.description}</p>
                </div>
              )}
              {selectedAdvance.note && (
                <div className="py-2">
                  <span className="text-slate-500 block text-xs uppercase mb-1">Note</span>
                  <p className="text-slate-800">{selectedAdvance.note}</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              {selectedAdvance.status === 'pending' && (
                <button
                  onClick={() => handleApprove(selectedAdvance.id, 'manager')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
                >
                  Approve Advance
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
