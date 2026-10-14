import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const RefundList = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('bank_transfer');
  const [reason, setReason] = useState('');
  const [returnToInventory, setReturnToInventory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, [search, status]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await salesService.getRefunds({
        search: search || undefined,
        status: status || undefined,
      });
      const payload = res.data?.data || res.data;
      setRefunds(payload.data || payload || []);
    } catch (err) {
      console.error('Failed to load refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    setShowModal(true);
    try {
      const [custRes, invRes] = await Promise.all([
        salesService.getCustomers({ per_page: 50 }),
        salesService.getInvoices({ per_page: 50 }),
      ]);
      setCustomers(custRes.data?.data?.data || custRes.data?.data || []);
      setInvoices(invRes.data?.data?.data || invRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load customers/invoices:', err);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this refund request?')) {
      try {
        setActionLoadingId(id);
        await salesService.approveRefund(id);
        fetchRefunds();
      } catch (err) {
        alert(err.response?.data?.message || 'Error approving refund');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleProcess = async (id) => {
    if (window.confirm('Process payout for this refund? This will adjust financial ledger.')) {
      try {
        setActionLoadingId(id);
        await salesService.processRefund(id);
        fetchRefunds();
      } catch (err) {
        alert(err.response?.data?.message || 'Error processing refund');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !refundAmount || !reason) {
      alert('Please fill customer, amount, and reason.');
      return;
    }

    try {
      setSubmitting(true);
      await salesService.createRefund({
        customer_id: customerId,
        invoice_id: invoiceId || null,
        refund_date: new Date().toISOString().slice(0, 10),
        refund_amount: Number(refundAmount),
        refund_method: refundMethod,
        reason,
        return_to_inventory: returnToInventory,
      });
      setShowModal(false);
      fetchRefunds();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating refund');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-7 h-7 text-indigo-600" />
            Customer Refunds
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage customer payout requests, cancellations, and accounts receivable settlements.
          </p>
        </div>
        <Button variant="teal" onClick={handleOpenModal} className="gap-2">
          <Plus className="w-4 h-4" /> Request Refund
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : refunds.length === 0 ? (
          <div className="py-16 text-center">
            <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No Refunds Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Refund #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-semibold text-indigo-600">{r.refund_number}</td>
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {r.customer?.name || 'Customer'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{r.refund_date || 'N/A'}</td>
                    <td className="px-5 py-4 text-xs capitalize">{r.refund_method || 'Bank'}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">{r.reason}</td>
                    <td className="px-5 py-4 text-right font-bold text-rose-600">
                      ₹{Number(r.refund_amount || r.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={r.status === 'processed' ? 'success' : r.status === 'approved' ? 'info' : 'warning'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {r.status === 'requested' && (
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={actionLoadingId === r.id}
                            title="Approve Refund"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.status === 'approved' && (
                          <button
                            onClick={() => handleProcess(r.id)}
                            disabled={actionLoadingId === r.id}
                            title="Process Payout"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 !overflow-visible">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Create Refund Request</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Customer *</label>
                <SearchableSelect
                  options={[
                    { value: '', label: 'Select Customer' },
                    ...customers.map((c) => ({ value: String(c.id), label: c.name }))
                  ]}
                  value={String(customerId)}
                  onChange={(val) => setCustomerId(val)}
                  placeholder="Select Customer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Refund Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Refund Method</label>
                <SearchableSelect
                  options={[
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                    { value: 'cash', label: 'Cash' },
                    { value: 'card', label: 'Card Refund' },
                    { value: 'upi', label: 'UPI' }
                  ]}
                  value={refundMethod}
                  onChange={(val) => setRefundMethod(val)}
                  placeholder="Refund Method"
                  searchable={false}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Reason for Refund *</label>
                <textarea
                  rows="2"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="teal" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundList;
