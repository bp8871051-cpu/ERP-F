import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  CheckCircle,
  CreditCard,
  Trash2,
  Receipt,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  X,
  Building,
  Check,
} from 'lucide-react';
import financeService from '../../../services/financeService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pay Modal State
  const [selectedExpenseForPay, setSelectedExpenseForPay] = useState(null);
  const [payAccountId, setPayAccountId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchExpensesAndMeta = async () => {
    try {
      setLoading(true);
      setError(null);
      const [expRes, catRes, accRes] = await Promise.all([
        financeService.getExpenses({
          status: statusFilter || undefined,
          category_id: categoryFilter || undefined,
          payment_method: paymentMethodFilter || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
        financeService.getExpenseCategories(),
        financeService.getAccounts(),
      ]);
      setExpenses(expRes || []);
      setCategories(catRes || []);
      setAccounts(accRes || []);
      if (accRes && accRes.length > 0) {
        setPayAccountId(accRes[0].id);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load enterprise expenses telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndMeta();
  }, [statusFilter, categoryFilter, paymentMethodFilter, startDate, endDate]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await financeService.approveExpense(id);
      setSuccessMessage(`Expense #${id} approved successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchExpensesAndMeta();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve expense');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedExpenseForPay || !payAccountId) return;
    try {
      setActionLoading(true);
      await financeService.payExpense(selectedExpenseForPay.id, {
        account_id: payAccountId,
        notes: payNotes,
      });
      setSuccessMessage(`Expense #${selectedExpenseForPay.expense_number} marked as PAID. Financial ledger & cash balance updated!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setSelectedExpenseForPay(null);
      fetchExpensesAndMeta();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to disburse payment for expense');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      setActionLoading(true);
      await financeService.deleteExpense(id);
      setSuccessMessage('Expense removed successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchExpensesAndMeta();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered by client-side search term
  const filteredExpenses = expenses.filter((item) => {
    const q = searchTerm.toLowerCase();
    const expNum = item.expense_number?.toLowerCase() || '';
    const desc = item.description?.toLowerCase() || '';
    const vendor = item.vendor?.name?.toLowerCase() || '';
    const cat = item.category?.name?.toLowerCase() || '';
    return expNum.includes(q) || desc.includes(q) || vendor.includes(q) || cat.includes(q);
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const displayedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'approved':
        return <Badge variant="teal">Approved</Badge>;
      case 'submitted':
        return <Badge variant="warning">Submitted</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'draft':
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Expense #', 'Date', 'Category', 'Vendor', 'Method', 'Subtotal', 'Tax', 'Total', 'Status'];
    const rows = filteredExpenses.map((exp) => [
      exp.expense_number,
      exp.expense_date,
      exp.category?.name || 'N/A',
      exp.vendor?.name || 'N/A',
      exp.payment_method,
      exp.amount,
      exp.tax_amount,
      exp.total_amount,
      exp.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expenses_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && expenses.length === 0) return <LoadingSkeleton type="table" />;
  if (error && expenses.length === 0) return <ErrorState message={error} onRetry={fetchExpensesAndMeta} />;

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Expense Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track operational spending, vendor disbursements, multi-level approvals, and double-entry ledger postings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Link to="/app/finance/expenses/create">
            <Button variant="teal" size="sm" icon={Plus}>
              New Expense
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search expenses, vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Expense #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor / Payee</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Tax</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No expenses found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                displayedExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <Link
                        to={`/app/finance/expenses/${expense.id}`}
                        className="text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        {expense.expense_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{expense.expense_date}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{expense.category?.name || 'General'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="truncate max-w-[140px] text-slate-700">
                        {expense.vendor?.name || expense.description || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-500">
                      {expense.payment_method?.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      ₹{Number(expense.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      ₹{Number(expense.tax_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{Number(expense.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(expense.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/app/finance/expenses/${expense.id}`}
                          title="View Details"
                          className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Approve Action */}
                        {(expense.status === 'draft' || expense.status === 'submitted') && (
                          <button
                            onClick={() => handleApprove(expense.id)}
                            title="Approve Expense"
                            disabled={actionLoading}
                            className="p-1 rounded text-teal-600 hover:text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Pay Action */}
                        {expense.status === 'approved' && (
                          <button
                            onClick={() => setSelectedExpenseForPay(expense)}
                            title="Record Payment & Ledger"
                            disabled={actionLoading}
                            className="p-1 rounded text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {expense.status !== 'paid' && (
                          <button
                            onClick={() => handleDelete(expense.id)}
                            title="Delete Record"
                            disabled={actionLoading}
                            className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} records
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                    currentPage === num
                      ? 'bg-teal-600 text-white'
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {num}
                </button>
              ))}
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

      {/* Pay Disbursement Modal */}
      {selectedExpenseForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Disburse Payment for {selectedExpenseForPay.expense_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExpenseForPay(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePay} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-lg">
                <div className="flex justify-between font-medium text-slate-700">
                  <span>Payee / Category:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedExpenseForPay.vendor?.name || selectedExpenseForPay.category?.name}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-slate-700 mt-1">
                  <span>Amount to Disburse:</span>
                  <span className="text-base font-bold text-teal-700">
                    ₹{Number(selectedExpenseForPay.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Source Account / Vault *</label>
                <select
                  required
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.bank_name || 'Cash'} - Bal: ₹
                      {Number(acc.current_balance || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Selecting this account will deduct ₹
                  {Number(selectedExpenseForPay.total_amount).toLocaleString()} and post a double-entry transaction.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Disbursement Remarks / Ref</label>
                <textarea
                  rows={2}
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Optional payment reference or transaction memo..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedExpenseForPay(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Confirm & Post to Ledger
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
