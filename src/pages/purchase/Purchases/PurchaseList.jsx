import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  CheckCircle,
  Building2,
  Calendar,
  Truck,
  RefreshCw,
} from 'lucide-react';
import purchaseService from '../../../services/purchaseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const PurchaseList = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);

  // Payment Modal
  const [paymentModalPurchase, setPaymentModalPurchase] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, [search, status, paymentStatus, page]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getPurchases({
        search: search || undefined,
        status: status || undefined,
        payment_status: paymentStatus || undefined,
        page,
        per_page: 15,
      });
      const payload = res.data?.data || res.data;
      setPurchases(payload.data || payload || []);
      setMeta({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || (payload.data ? payload.data.length : 0),
      });
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = (p, e) => {
    e.stopPropagation();
    setPaymentModalPurchase(p);
    const due = Number(p.due_amount ?? (p.grand_total - (p.paid_amount || 0)));
    setPayAmount(due > 0 ? due : p.grand_total);
    setPayRef(`DISB-${Date.now().toString().slice(-6)}`);
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModalPurchase || !payAmount || Number(payAmount) <= 0) return;

    try {
      setRecordingPayment(true);
      await purchaseService.recordPayment(paymentModalPurchase.id, {
        amount: Number(payAmount),
        payment_method: payMethod,
        reference: payRef,
        payment_date: new Date().toISOString().slice(0, 10),
      });
      setPaymentModalPurchase(null);
      fetchPurchases();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording vendor payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleExportCSV = () => {
    if (!purchases.length) return;
    const headers = ['Purchase #', 'Vendor', 'Vendor Inv #', 'Date', 'Total', 'Paid', 'Due', 'Status'];
    const rows = purchases.map((p) => [
      `"${p.purchase_number || ''}"`,
      `"${p.vendor?.name || ''}"`,
      `"${p.vendor_invoice_number || ''}"`,
      `"${p.invoice_date || ''}"`,
      `"${p.grand_total || 0}"`,
      `"${p.paid_amount || 0}"`,
      `"${p.due_amount || 0}"`,
      `"${p.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `purchases_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-indigo-600" />
            Purchases & Goods Receipts (GRN)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Incoming stock receipts from vendors, bill verification, and vendor payment disbursements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            variant="teal"
            onClick={() => navigate('/app/purchase/purchases/create')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Record New Purchase
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 !overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by purchase #, vendor, inv #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="relative z-30">
            <SearchableSelect
              options={[
                { value: '', label: 'All Receipt Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'received', label: 'Received (In Stock)' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              placeholder="All Receipt Statuses"
              searchable={false}
            />
          </div>

          <div className="flex items-center justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatus('');
                setPaymentStatus('');
                setPage(1);
              }}
              className="gap-1.5 text-xs text-slate-500"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Purchases Table */}
      <Card className="!overflow-visible border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : purchases.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 dark:text-white">No Purchases Recorded</p>
            <Button
              variant="teal"
              onClick={() => navigate('/app/purchase/purchases/create')}
              className="mt-4"
            >
              Record First Purchase
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Purchase #</th>
                  <th className="px-5 py-3.5">Vendor</th>
                  <th className="px-5 py-3.5">Vendor Inv #</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Grand Total</th>
                  <th className="px-5 py-3.5 text-right">Due Payable</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchases.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/app/purchase/purchases/${p.id}`)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-indigo-600">{p.purchase_number}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{p.vendor?.name || 'Vendor'}</div>
                      {p.vendor?.company_name && (
                        <div className="text-xs text-slate-400 mt-0.5">{p.vendor.company_name}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">{p.vendor_invoice_number || '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">{p.invoice_date || 'N/A'}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{Number(p.grand_total || p.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-rose-600">
                      ₹{Number(p.due_amount ?? (p.grand_total - (p.paid_amount || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={p.status === 'received' ? 'success' : 'neutral'}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {Number(p.due_amount ?? (p.grand_total - (p.paid_amount || 0))) > 0 && (
                          <button
                            onClick={(e) => handleOpenPaymentModal(p, e)}
                            title="Disburse Payment"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/app/purchase/purchases/${p.id}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
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
              <span className="font-semibold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} purchases total)
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

      {/* Disburse Payment Modal */}
      {paymentModalPurchase && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Disburse Vendor Payment</h3>
                <p className="text-xs text-slate-500">Purchase: {paymentModalPurchase.purchase_number}</p>
              </div>
              <button onClick={() => setPaymentModalPurchase(null)}>✕</button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Disbursement Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Disbursement Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Bank UTR / Cheque #</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setPaymentModalPurchase(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" disabled={recordingPayment}>
                  {recordingPayment ? 'Recording...' : 'Disburse Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseList;
