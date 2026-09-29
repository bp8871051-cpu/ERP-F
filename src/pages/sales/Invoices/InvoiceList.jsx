import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Send,
  Calendar,
  Building2,
  RefreshCw,
  AlertCircle,
  Printer,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);

  // Quick Payment Modal
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [search, status, paymentStatus, page]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await salesService.getInvoices({
        search: search || undefined,
        status: status || undefined,
        payment_status: paymentStatus || undefined,
        page,
        per_page: 15,
      });
      const payload = res.data?.data || res.data;
      setInvoices(payload.data || payload || []);
      setMeta({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || (payload.data ? payload.data.length : 0),
      });
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Send this invoice to the customer via email notification?')) {
      try {
        await salesService.sendInvoice(id);
        alert('Invoice sent successfully!');
        fetchInvoices();
      } catch (err) {
        alert(err.response?.data?.message || 'Error sending invoice');
      }
    }
  };

  const handleOpenPaymentModal = (invoice, e) => {
    e.stopPropagation();
    setPaymentModalInvoice(invoice);
    const due = Number(invoice.due_amount || (invoice.grand_total - (invoice.paid_amount || 0)));
    setPaymentAmount(due > 0 ? due : invoice.grand_total);
    setPaymentRef(`PAY-${Date.now().toString().slice(-6)}`);
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModalInvoice || !paymentAmount || Number(paymentAmount) <= 0) return;

    try {
      setRecordingPayment(true);
      await salesService.recordPayment(paymentModalInvoice.id, {
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        reference: paymentRef,
        payment_date: new Date().toISOString().slice(0, 10),
      });
      setPaymentModalInvoice(null);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record customer payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleExportCSV = () => {
    if (!invoices.length) return;
    const headers = ['Invoice #', 'Customer', 'Date', 'Due Date', 'Total', 'Paid', 'Due', 'Payment Status', 'Status'];
    const rows = invoices.map((inv) => [
      `"${inv.invoice_number || ''}"`,
      `"${inv.customer?.name || ''}"`,
      `"${inv.invoice_date || ''}"`,
      `"${inv.due_date || ''}"`,
      `"${inv.grand_total || 0}"`,
      `"${inv.paid_amount || 0}"`,
      `"${inv.due_amount || 0}"`,
      `"${inv.payment_status || ''}"`,
      `"${inv.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `sales_invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    switch (s) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'sent':
        return <Badge variant="info">Sent</Badge>;
      case 'overdue':
        return <Badge variant="danger">Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="warning">{st || 'Draft'}</Badge>;
    }
  };

  const getPaymentBadge = (st) => {
    const s = (st || '').toLowerCase();
    switch (s) {
      case 'paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Paid</span>;
      case 'partially_paid':
      case 'partial':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Partial</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">Unpaid</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Invoices & Billing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate GST tax invoices, process customer receipts, and track receivables.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/app/sales/invoices/create')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice #, customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Invoice Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="relative">
            <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Payment Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Fully Paid</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatus('');
                setPaymentStatus('');
                setPage(1);
              }}
              className="gap-1.5 text-xs text-slate-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No Invoices Found</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Create your first invoice or convert from a sales order.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/app/sales/invoices/create')}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Invoice Date</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5 text-right">Grand Total</th>
                  <th className="px-5 py-3.5 text-right">Due Amount</th>
                  <th className="px-5 py-3.5 text-center">Payment</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/app/sales/invoices/${inv.id}`)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {inv.invoice_number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {inv.customer?.name || 'Walk-in Customer'}
                      </div>
                      {inv.customer?.company_name && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {inv.customer.company_name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {inv.invoice_date || inv.issue_date || 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {inv.due_date || 'Immediate'}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{Number(inv.grand_total || inv.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-rose-600 dark:text-rose-400">
                      ₹{Number(inv.due_amount ?? (inv.grand_total - (inv.paid_amount || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getPaymentBadge(inv.payment_status)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.payment_status !== 'paid' && (
                          <button
                            onClick={(e) => handleOpenPaymentModal(inv, e)}
                            title="Record Payment"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}

                        {inv.status === 'draft' && (
                          <button
                            onClick={(e) => handleSendInvoice(inv.id, e)}
                            title="Send Invoice"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/app/sales/invoices/${inv.id}`)}
                          title="View Invoice Dossier"
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-semibold text-slate-900 dark:text-white">{meta.current_page}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} invoices total)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Customer Payment</h3>
                <p className="text-xs text-slate-500">Invoice: {paymentModalInvoice.invoice_number}</p>
              </div>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. UTR-998822"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentModalInvoice(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={recordingPayment}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CreditCard className="w-4 h-4" />
                  {recordingPayment ? 'Saving...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
