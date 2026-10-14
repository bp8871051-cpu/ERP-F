import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Search, Filter, Download, ArrowUpRight, 
  CheckCircle, XCircle, Clock, RefreshCw, DollarSign,
  ChevronLeft, ChevronRight, FileSpreadsheet, Eye, Receipt
} from 'lucide-react';
import membershipService from '../../services/membershipService';
import SearchableSelect from '../../components/ui/SearchableSelect';

const statusBadges = {
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  failed: 'bg-rose-100 text-rose-800 border-rose-200',
  refunded: 'bg-purple-100 text-purple-800 border-purple-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function MembershipTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await membershipService.getTransactions({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        payment_method: methodFilter !== 'all' ? methodFilter : undefined
      });
      setTransactions(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, methodFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Transaction ID,Customer,Plan,Amount,Tax,Discount,Method,Status,Date\n'];
    const rows = transactions.map(t => [
      t.transaction_number || t.id,
      `"${t.customer?.name || t.customer_name || 'N/A'}"`,
      `"${t.plan?.name || t.plan_name || 'Standard'}"`,
      t.amount,
      t.tax || 0,
      t.discount || 0,
      t.payment_method,
      t.status,
      t.created_at
    ].join(','));
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membership_transactions_${Date.now()}.csv`;
    a.click();
  };

  const totalCollected = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Membership Transaction Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audited payment history for subscription activations, renewals, bolt-on addon purchases, and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            <Download className="w-4 h-4" /> Export Ledger CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Paid Revenue</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">${totalCollected.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400">From verified transactions</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recorded Invoices</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{transactions.length}</div>
          <span className="text-[11px] text-slate-400">Total ledger events</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Settlement</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {transactions.filter(t => t.status === 'pending').length}
          </div>
          <span className="text-[11px] text-slate-400">Awaiting gateway clearance</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Failed / Refunded</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {transactions.filter(t => t.status === 'failed' || t.status === 'refunded').length}
          </div>
          <span className="text-[11px] text-slate-400">Reversals or declines</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 !overflow-visible">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by transaction ID, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-32 z-20">
            <SearchableSelect
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' }
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              searchable={false}
            />
          </div>

          <div className="w-40 z-10">
            <SearchableSelect
              options={[
                { value: 'all', label: 'All Payment Methods' },
                { value: 'card', label: 'Credit / Debit Card' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'upi', label: 'UPI' },
                { value: 'cash', label: 'Cash' }
              ]}
              value={methodFilter}
              onChange={(val) => setMethodFilter(val)}
              searchable={false}
            />
          </div>

          <button
            onClick={fetchTransactions}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Txn #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Plan / Description</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Discount / Tax</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(n => (
                  <tr key={n}>
                    <td colSpan="8" className="p-4">
                      <div className="h-6 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No transactions recorded</p>
                    <p className="text-xs text-slate-400 mt-0.5">Transactions will appear automatically upon subscription payment.</p>
                  </td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-600">
                      {tx.transaction_number || `TXN-${String(tx.id).padStart(6, '0')}`}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">
                        {tx.customer?.name || tx.customer_name || `Customer #${tx.customer_id}`}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {tx.customer?.email || tx.customer_email || 'Customer'}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800">
                        {tx.plan?.name || tx.plan_name || 'Membership Subscription'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-sm font-black text-slate-900">${tx.amount}</span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      ${tx.discount || 0} / ${tx.tax || 0}
                    </td>
                    <td className="p-3.5 capitalize font-medium text-slate-700">
                      {tx.payment_method?.replace('_', ' ') || 'Card'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        statusBadges[tx.status] || statusBadges.pending
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
