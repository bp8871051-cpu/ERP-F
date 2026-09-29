import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Check,
  Receipt,
} from 'lucide-react';
import financeService from '../../../services/financeService';
import api from '../../../services/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Record Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    payment_number: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    payment_date: new Date().toISOString().slice(0, 10),
    payment_type: 'customer_payment',
    account_id: '',
    customer_id: '',
    vendor_id: '',
    amount: '',
    payment_method: 'bank_transfer',
    reference_number: '',
    notes: '',
    status: 'completed',
  });

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [payRes, accRes, custRes, venRes] = await Promise.all([
        financeService.getPayments({
          payment_type: typeFilter || undefined,
          status: statusFilter || undefined,
        }),
        financeService.getAccounts(),
        api.get('/sales/customers').then((r) => r.data.data).catch(() => []),
        api.get('/purchase/vendors').then((r) => r.data.data).catch(() => []),
      ]);
      setPayments(payRes || []);
      setAccounts(accRes || []);
      setCustomers(custRes || []);
      setVendors(venRes || []);

      if (accRes && accRes.length > 0 && !formData.account_id) {
        setFormData((prev) => ({ ...prev, account_id: accRes[0].id }));
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Unable to load central payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, [typeFilter, statusFilter]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    try {
      setActionLoading(true);
      await financeService.createPayment({
        ...formData,
        amount: parseFloat(formData.amount),
        customer_id: formData.payment_type === 'customer_payment' ? formData.customer_id : null,
        vendor_id: formData.payment_type === 'vendor_payment' ? formData.vendor_id : null,
      });
      setSuccessMessage(`Payment #${formData.payment_number} recorded & financial ledger updated.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData({
        payment_number: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        payment_date: new Date().toISOString().slice(0, 10),
        payment_type: 'customer_payment',
        account_id: accounts[0]?.id || '',
        customer_id: '',
        vendor_id: '',
        amount: '',
        payment_method: 'bank_transfer',
        reference_number: '',
        notes: '',
        status: 'completed',
      });
      fetchPaymentsData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const q = searchTerm.toLowerCase();
    const payNum = p.payment_number?.toLowerCase() || '';
    const ref = p.reference_number?.toLowerCase() || '';
    const cust = p.customer?.name?.toLowerCase() || '';
    const ven = p.vendor?.name?.toLowerCase() || '';
    const acc = p.account?.account_name?.toLowerCase() || '';
    return payNum.includes(q) || ref.includes(q) || cust.includes(q) || ven.includes(q) || acc.includes(q);
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const displayedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
      case 'cancelled':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'customer_payment':
      case 'other_income':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
            Receipt (Inflow)
          </span>
        );
      case 'vendor_payment':
      case 'expense_payment':
      case 'refund':
      case 'other_payment':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <ArrowUpRight className="w-3 h-3 text-rose-600" />
            Disbursement (Outflow)
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = ['Payment #', 'Date', 'Type', 'Party', 'Method', 'Account', 'Amount', 'Status'];
    const rows = filteredPayments.map((p) => [
      p.payment_number,
      p.payment_date,
      p.payment_type,
      p.customer?.name || p.vendor?.name || 'N/A',
      p.payment_method,
      p.account?.account_name || 'N/A',
      p.amount,
      p.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `payments_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && payments.length === 0) return <LoadingSkeleton type="table" />;
  if (error && payments.length === 0) return <ErrorState message={error} onRetry={fetchPaymentsData} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Central Payment Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile customer collections, vendor settlements, expense disbursements, and bank clearances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Record Payment
          </Button>
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search payment #, party, account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            >
              <option value="">All Payment Types</option>
              <option value="customer_payment">Customer Receipt</option>
              <option value="vendor_payment">Vendor Settlement</option>
              <option value="expense_payment">Expense Payment</option>
              <option value="refund">Customer Refund</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending Clearance</option>
              <option value="failed">Failed / Cancelled</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-slate-500 text-xs">
            Showing <span className="font-semibold text-slate-800 mx-1">{filteredPayments.length}</span> settlements
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Payment #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Flow / Type</th>
                <th className="py-3 px-4">Associated Party</th>
                <th className="py-3 px-4">Vault Account</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4 text-right">Settled Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No payments found.
                  </td>
                </tr>
              ) : (
                displayedPayments.map((p) => {
                  const isInflow =
                    p.payment_type === 'customer_payment' || p.payment_type === 'other_income';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 font-mono text-[11px]">
                        {p.payment_number}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">{p.payment_date}</td>
                      <td className="py-3 px-4">{getTypeBadge(p.payment_type)}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {p.customer?.name || p.vendor?.name || p.notes || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.account?.account_name || 'Treasury Vault'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="capitalize">{p.payment_method?.replace('_', ' ')}</span>
                        {p.reference_number && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Ref: {p.reference_number}
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          isInflow ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {isInflow ? '+' : '-'}₹
                        {Number(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(p.status)}</td>
                    </tr>
                  );
                })
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

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Record Enterprise Payment</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Type *</label>
                  <select
                    value={formData.payment_type}
                    onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    <option value="customer_payment">Customer Receipt (Inflow)</option>
                    <option value="vendor_payment">Vendor Settlement (Outflow)</option>
                    <option value="other_income">Other Miscellaneous Income</option>
                    <option value="other_payment">Other Operational Outflow</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Conditional Party selector */}
              {formData.payment_type === 'customer_payment' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Customer *</label>
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.payment_type === 'vendor_payment' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Vendor *</label>
                  <select
                    required
                    value={formData.vendor_id}
                    onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.company_name || 'Vendor'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Vault / Bank Account *</label>
                  <select
                    required
                    value={formData.account_id}
                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.account_name} (Bal: ₹{Number(a.current_balance || 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    <option value="bank_transfer">Bank Transfer / NEFT</option>
                    <option value="upi">UPI / Instant Pay</option>
                    <option value="cash">Cash In Hand</option>
                    <option value="card">Card Payment</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Reference / UTR #</label>
                  <input
                    type="text"
                    placeholder="e.g. TXN10293847"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Settlement Memo / Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional details regarding invoice or clearance..."
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
                  Post Payment & Update Ledger
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentList;
