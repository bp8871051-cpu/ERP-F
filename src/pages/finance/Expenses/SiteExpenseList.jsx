import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Trash2,
  X,
  Upload,
  Receipt,
  AlertCircle,
  Tag,
  Hash
} from 'lucide-react';
import financeService from '../../../services/financeService';
import projectService from '../../../services/projectService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../context/AuthContext';

export default function SiteExpenseList() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Form State
  const initialForm = {
    // Basic Information
    title: '',
    description: '',
    expense_date: new Date().toISOString().slice(0, 10),
    project_id: '',
    site_location: '',
    expense_category_id: '',
    additional_note: '',

    // Financial Information
    amount: '',
    payment_method: 'cash',
    vendor_number: '',
    receipt_number: '',
    document: '',
    status: 'submitted',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, projRes, catRes] = await Promise.all([
        financeService.getExpenses({
          is_site_expense: true,
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          project_id: projectFilter || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        }),
        projectService.getProjects({ all: true }),
        financeService.getExpenseCategories(),
      ]);

      const rawExp = expRes?.data || expRes || [];
      setExpenses(Array.isArray(rawExp) ? rawExp : (rawExp.data || []));

      const rawProj = projRes?.data 
        ? (Array.isArray(projRes.data) ? projRes.data : (projRes.data.data || [])) 
        : (Array.isArray(projRes) ? projRes : []);
      setProjects(rawProj);

      const rawCat = catRes?.data 
        ? (Array.isArray(catRes.data) ? catRes.data : (catRes.data.data || [])) 
        : (Array.isArray(catRes) ? catRes : []);
      setCategories(rawCat);
    } catch (err) {
      console.error('Error loading site expenses:', err);
      showToast('error', 'Failed to load site expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, projectFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.expense_date) errors.expense_date = 'Expense date is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        is_site_expense: true,
      };

      await financeService.createExpense(payload);
      showToast('success', 'Site expense recorded successfully!');
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (err) {
      console.error('Error creating site expense:', err);
      showToast('error', err.response?.data?.message || 'Failed to record site expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'approved':
        return <Badge variant="teal">Approved</Badge>;
      case 'submitted':
        return <Badge variant="warning">Submitted</Badge>;
      case 'draft':
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-teal-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Site Expense Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track, audit, and reimburse project field expenditures, site logistics, and vendor disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => {
              setFormData(initialForm);
              setFormErrors({});
              setIsModalOpen(true);
            }}
          >
            Record Site Expense
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs items-end">
          {/* Search */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 ml-1">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search title, site, receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
              />
            </div>
          </div>

          {/* Project Select Option */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 ml-1">Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select Option */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 ml-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Date From */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 ml-1">Start Date</label>
            <input
              type="date"
              placeholder="Start Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
            />
          </div>

          {/* Date To & Filter Action */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5 ml-1">End Date</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                placeholder="End Date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
              />
              <Button type="submit" variant="secondary" size="sm" icon={Filter}>
                Filter
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Expenses Table */}
      <Card className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900">Recorded Site Expenses</h3>
          <span className="text-[11px] text-slate-400">{expenses.length} records</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading site expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">No site expense records found.</p>
            <p className="text-[11px] text-slate-400">Click &ldquo;Record Site Expense&rdquo; to log your first field disbursement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Expense / Title</th>
                  <th className="py-3 px-4 font-semibold">Project & Location</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Receipt / Vendor #</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{exp.title || exp.description || 'Site Expense'}</div>
                      <div className="text-[10px] font-mono text-slate-400">{exp.expense_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-teal-700 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-teal-500 shrink-0" />
                        <span>{exp.project?.name || 'General Project'}</span>
                      </div>
                      {exp.site_location && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span>{exp.site_location}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {exp.categoryItem?.name || exp.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {exp.receipt_number || exp.reference || exp.vendor_number || '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 font-mono">
                      ₹{parseFloat(exp.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {exp.expense_date}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(exp.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedExpense(exp)}
                        className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-slate-100 cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── CREATE SITE EXPENSE MODAL ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden my-8 animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Record New Site Expense</h3>
                  <p className="text-[10px] text-slate-400">Capture field operations and project-level expenses</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
              {/* SECTION 1: BASIC INFORMATION */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <FileText className="w-3.5 h-3.5 text-teal-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Expense Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Site Generator Fuel & Logistics"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs ${
                        formErrors.title ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.title && <p className="text-rose-500 text-[10px] mt-1">{formErrors.title}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Expense Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expense_date}
                      onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Project (Option Selected)</label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                    >
                      <option value="">Select Project...</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Site Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Block C, Sector 62 Site"
                      value={formData.site_location}
                      onChange={(e) => setFormData({ ...formData, site_location: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Selected Category</label>
                    <select
                      value={formData.expense_category_id}
                      onChange={(e) => setFormData({ ...formData, expense_category_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                    >
                      <option value="">Select Expense Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief details regarding this field expenditure..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">Additional Note</label>
                    <input
                      type="text"
                      placeholder="Auditor or site supervisor special notes..."
                      value={formData.additional_note}
                      onChange={(e) => setFormData({ ...formData, additional_note: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: FINANCIAL INFORMATION */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                  Financial Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs font-mono font-bold ${
                        formErrors.amount ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.amount && <p className="text-rose-500 text-[10px] mt-1">{formErrors.amount}</p>}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer / NEFT</option>
                      <option value="upi">UPI / Online</option>
                      <option value="cheque">Cheque</option>
                      <option value="petty_cash">Petty Cash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Vendor Number / Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. VND-9901 or Phone number"
                      value={formData.vendor_number}
                      onChange={(e) => setFormData({ ...formData, vendor_number: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Receipt Number</label>
                    <input
                      type="text"
                      placeholder="e.g. RCP-2026-0881"
                      value={formData.receipt_number}
                      onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">Document / Invoice Attachment URL</label>
                    <input
                      type="text"
                      placeholder="Paste receipt file link or document storage URL..."
                      value={formData.document}
                      onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" loading={submitting}>
                  Save Site Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW EXPENSE DETAILS MODAL ─────────────────────────────────────── */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Site Expense Snapshot</h3>
                <p className="text-[10px] font-mono text-slate-400">{selectedExpense.expense_number}</p>
              </div>
              <button onClick={() => setSelectedExpense(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Expense Title</span>
                  <p className="text-sm font-bold text-slate-900">{selectedExpense.title || selectedExpense.description || 'Site Expense'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Amount</span>
                  <p className="text-base font-bold text-teal-600 font-mono">₹{parseFloat(selectedExpense.amount || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Project</span>
                  <span className="font-semibold">{selectedExpense.project?.name || 'General Project'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Site Location</span>
                  <span>{selectedExpense.site_location || 'Not Specified'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Expense Date</span>
                  <span>{selectedExpense.expense_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Payment Method</span>
                  <span className="capitalize">{selectedExpense.payment_method?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Receipt Number</span>
                  <span className="font-mono">{selectedExpense.receipt_number || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Vendor Number</span>
                  <span className="font-mono">{selectedExpense.vendor_number || '—'}</span>
                </div>
              </div>

              {selectedExpense.description && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium mb-0.5">Description</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg text-[11px]">{selectedExpense.description}</p>
                </div>
              )}

              {selectedExpense.additional_note && (
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium mb-0.5">Additional Notes</span>
                  <p className="text-slate-600 bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-lg text-[11px] text-amber-900">
                    {selectedExpense.additional_note}
                  </p>
                </div>
              )}

              {selectedExpense.document && (
                <div className="pt-2">
                  <a
                    href={selectedExpense.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Open Receipt Document
                  </a>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedExpense(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

