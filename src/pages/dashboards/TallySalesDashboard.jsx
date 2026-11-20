import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Building,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { roleDashboardService } from '../../services/roleDashboardService';
import { useAuth } from '../../context/AuthContext';

export const TallySalesDashboard = () => {
  const { currentCompany } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Payment Recording Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await roleDashboardService.tallySales.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Tally Sales & Ledger intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCompany]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice || !payAmount) return;

    try {
      setSubmitting(true);
      await roleDashboardService.tallySales.recordPayment({
        invoice_id: selectedInvoice.id,
        amount: parseFloat(payAmount),
      });
      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);
      setPayAmount('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording payment voucher');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading Tally Sales & Voucher Ledger...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tally Sales & Accounting Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600" />
              Tally Prime Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sales vouchers, ledger receivables aging, receipt collection, and ERP reconciliation
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Tally Vouchers</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Total Invoiced Sales</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            ${((metrics.total_sales || 0) / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {metrics.tally_vouchers || 0} Sales Vouchers Generated
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Realized Collections</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600">
            ${((metrics.total_collections || 0) / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Cleared Receipts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Receivable Outstanding</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-600">
            ${((metrics.outstanding_receivable || 0) / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Pending Ledger Balance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Overdue Invoices</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600">{metrics.overdue_invoices || 0}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Immediate Follow-up</div>
        </div>
      </div>

      {/* Main Grid: Aging Receivables & Converted CRM Won Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Receivables Aging */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Customer Outstanding Aging</h3>
            </div>
            <span className="text-xs text-slate-400">Actionable Balance</span>
          </div>

          <div className="p-4 divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {(!data?.aging_receivables || data.aging_receivables.length === 0) ? (
              <div className="text-center py-8 text-slate-400 text-xs">All accounts clear and reconciled!</div>
            ) : (
              data.aging_receivables.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{r.party_name}</p>
                    <p className="text-[11px] text-slate-500">
                      Invoice #{r.invoice_number} • Due: <span className={r.is_overdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}>{r.due_date}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-600">${r.pending_balance.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Unpaid</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedInvoice(r);
                        setPayAmount(String(r.pending_balance));
                        setIsPaymentModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Collect
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Won CRM Deals Ready for Sales Order / Tally Voucher */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Won CRM Deals &rarr; Ready for Voucher</h3>
            </div>
            <span className="text-xs text-slate-400">Sales Integration</span>
          </div>

          <div className="p-4 divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {(!data?.ready_deals || data.ready_deals.length === 0) ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                All won CRM deals have been billed or converted.
              </div>
            ) : (
              data.ready_deals.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{d.name}</p>
                    <p className="text-[11px] text-emerald-600 font-medium">Status: Won Deal</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">${Number(d.value).toLocaleString()}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Generate Voucher
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Invoices with Tally Integration Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Sales Invoices (Voucher Ledger)</h3>
          </div>
          <span className="text-xs text-slate-400">Tally Sales Registry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Party</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Collected</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tally Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!data?.recent_invoices || data.recent_invoices.length === 0) ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    No sales invoices recorded yet.
                  </td>
                </tr>
              ) : (
                data.recent_invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">#{inv.invoice_number}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{inv.customer_name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.invoice_date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${inv.total.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-semibold">${inv.amount_paid.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        <CheckCircle className="w-3 h-3 text-indigo-600" />
                        {inv.tally_sync_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Quick Record Receipt */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Record Tally Receipt Voucher</h3>
            <p className="text-xs text-slate-500">
              For party: <span className="font-bold text-slate-700">{selectedInvoice.party_name}</span> (Inv #{selectedInvoice.invoice_number})
            </p>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Receipt Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  {submitting ? 'Recording...' : 'Post Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TallySalesDashboard;
