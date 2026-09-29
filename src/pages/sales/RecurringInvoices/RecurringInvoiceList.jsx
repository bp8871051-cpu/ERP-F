import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Plus,
  Search,
  Filter,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Calendar,
  Building2,
  DollarSign,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const RecurringInvoiceList = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [search, status]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await salesService.getRecurringInvoices({
        search: search || undefined,
        status: status || undefined,
      });
      const payload = res.data?.data || res.data;
      setProfiles(payload.data || payload || []);
    } catch (err) {
      console.error('Failed to load recurring invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    setShowModal(true);
    try {
      const res = await salesService.getCustomers({ per_page: 50 });
      setCustomers(res.data?.data?.data || res.data?.data || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  };

  const handleToggleStatus = async (profile) => {
    const nextStatus = profile.status === 'active' ? 'paused' : 'active';
    try {
      await salesService.updateRecurringInvoice(profile.id, { status: nextStatus });
      fetchProfiles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating recurring profile');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !amount) {
      alert('Please fill customer and recurring amount.');
      return;
    }

    try {
      setSubmitting(true);
      await salesService.createRecurringInvoice({
        customer_id: customerId,
        frequency,
        start_date: startDate,
        end_date: endDate || null,
        next_invoice_date: startDate,
        amount: Number(amount),
        payment_terms: paymentTerms,
        status: 'active',
      });
      setShowModal(false);
      fetchProfiles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating recurring invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Repeat className="w-7 h-7 text-indigo-600" />
            Recurring Invoices & Subscriptions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automate recurring billing schedules for retainer agreements, SaaS, or maintenance contracts.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenModal} className="gap-2 bg-indigo-600 text-white">
          <Plus className="w-4 h-4" /> Setup Recurring Schedule
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-16 text-center">
            <Repeat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No Recurring Invoices</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Frequency</th>
                  <th className="px-5 py-3.5">Start Date</th>
                  <th className="px-5 py-3.5">Next Invoice Date</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      {p.customer?.name || 'Customer'}
                    </td>
                    <td className="px-5 py-4 text-xs capitalize font-medium text-indigo-600">{p.frequency}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">{p.start_date || 'N/A'}</td>
                    <td className="px-5 py-4 text-xs font-semibold text-emerald-600">{p.next_invoice_date || 'Pending'}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{Number(p.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={p.status === 'active' ? 'success' : 'neutral'}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded"
                      >
                        {p.status === 'active' ? <PauseCircle className="w-4 h-4 text-amber-500" /> : <PlayCircle className="w-4 h-4 text-emerald-600" />}
                      </button>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">New Recurring Schedule</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Customer *</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Billing Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Recurring Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitting} className="bg-indigo-600 text-white">
                  {submitting ? 'Creating...' : 'Activate Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringInvoiceList;
