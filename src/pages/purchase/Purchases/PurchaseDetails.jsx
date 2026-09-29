import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Printer,
  CheckCircle,
  Truck,
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  Landmark,
} from 'lucide-react';
import purchaseService from '../../../services/purchaseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  const fetchPurchase = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getPurchase(id);
      const data = res.data?.data || res.data;
      setPurchase(data);

      const due = Number(data.due_amount ?? (data.grand_total - (data.paid_amount || 0)));
      setPayAmount(due > 0 ? due : data.grand_total);
      setPayRef(`DISB-${Date.now().toString().slice(-6)}`);
    } catch (err) {
      console.error('Failed to load purchase details:', err);
      setError('Purchase not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveGoods = async () => {
    if (
      window.confirm(
        'Confirm goods receiving for this purchase bill? This will increase warehouse inventory and log a PURCHASE_IN stock movement.'
      )
    ) {
      try {
        setActionLoading(true);
        await purchaseService.receiveOrder(id); // Or purchase receive
        alert('Stock received into inventory successfully!');
        fetchPurchase();
      } catch (err) {
        alert(err.response?.data?.message || 'Error receiving goods');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    try {
      setSubmittingPayment(true);
      await purchaseService.recordPayment(id, {
        amount: Number(payAmount),
        payment_method: payMethod,
        reference: payRef,
        payment_date: new Date().toISOString().slice(0, 10),
      });
      setShowPaymentModal(false);
      fetchPurchase();
    } catch (err) {
      alert(err.response?.data?.message || 'Error disbursing payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold">Purchase Record Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/app/purchase/purchases')} className="mt-4">
          Back to Purchases
        </Button>
      </div>
    );
  }

  const dueBalance = Number(purchase.due_amount ?? (purchase.grand_total - (purchase.paid_amount || 0)));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/purchase/purchases')}
            className="p-2 text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {purchase.purchase_number}
              </h1>
              <Badge variant={purchase.status === 'received' ? 'success' : 'neutral'}>
                {purchase.status}
              </Badge>
              {dueBalance <= 0 ? (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Fully Settled</span>
              ) : (
                <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-semibold">
                  Payable: ₹{dueBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Invoice Date: {purchase.invoice_date || 'N/A'} • Vendor Ref: {purchase.vendor_invoice_number || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {purchase.status === 'draft' && (
            <Button
              variant="primary"
              disabled={actionLoading}
              onClick={handleReceiveGoods}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Truck className="w-4 h-4" /> Confirm Stock Receipt
            </Button>
          )}

          {dueBalance > 0 && (
            <Button
              variant="primary"
              onClick={() => setShowPaymentModal(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <CreditCard className="w-4 h-4" /> Disburse Payment
            </Button>
          )}

          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Print / Voucher
          </Button>
        </div>
      </div>

      {/* Printable Purchase Voucher */}
      <Card className="p-8 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-lg">
                F
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">FALCON ENTERPRISE</span>
            </div>
            <p className="text-xs text-slate-500">Corporate Accounts Payable</p>
            <p className="text-xs text-slate-500">Ahmedabad, Gujarat - 380015, India</p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
              GOODS RECEIPT VOUCHER (GRN)
            </h2>
            <p className="text-sm font-bold text-indigo-600 mt-1">{purchase.purchase_number}</p>
            <p className="text-xs text-slate-500 mt-2">
              Date: <span className="font-semibold">{purchase.invoice_date || 'N/A'}</span>
            </p>
            <p className="text-xs text-slate-500">
              Vendor Bill #: <span className="font-mono font-semibold">{purchase.vendor_invoice_number || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Vendor & Depot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Vendor:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{purchase.vendor?.name || 'Vendor'}</p>
            {purchase.vendor?.company_name && (
              <p className="text-slate-600 dark:text-slate-300 font-medium">{purchase.vendor.company_name}</p>
            )}
            <p className="text-slate-500 mt-1">{purchase.vendor?.address || 'Vendor address on record'}</p>
            {purchase.vendor?.gst_number && (
              <p className="text-slate-600 dark:text-slate-300 mt-1.5 font-mono">GSTIN: {purchase.vendor.gst_number}</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Fulfillment Depot:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{purchase.warehouse?.name || 'Main Central Warehouse'}</p>
            <p className="text-slate-500 mt-1">{purchase.warehouse?.location || 'Central Facility'}</p>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold">
                <th className="py-3 px-3 w-10">#</th>
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-right w-20">Qty</th>
                <th className="py-3 px-3 text-right w-28">Cost (₹)</th>
                <th className="py-3 px-3 text-right w-20">Tax %</th>
                <th className="py-3 px-3 text-right w-32">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(purchase.items || []).map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 dark:text-white block">{it.product?.name || 'Stock Item'}</span>
                    {it.product?.sku && <span className="text-[11px] text-slate-400">SKU: {it.product.sku}</span>}
                  </td>
                  <td className="py-3 px-3 text-right font-medium">{it.quantity}</td>
                  <td className="py-3 px-3 text-right">
                    ₹{Number(it.unit_cost || it.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right">{Number(it.tax || 0)}%</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                    ₹{Number(it.subtotal || (it.quantity * (it.unit_cost || it.unit_price)) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{Number(purchase.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax (GST):</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{Number(purchase.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t flex justify-between font-black text-sm text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="text-indigo-600">
                ₹{Number(purchase.grand_total || purchase.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between font-bold text-emerald-600">
              <span>Disbursed Paid:</span>
              <span>₹{Number(purchase.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-rose-600 pt-1 border-t border-dashed">
              <span>Outstanding Payable:</span>
              <span>₹{dueBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Disburse Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Disburse Vendor Payment</h3>
              <button onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
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
                <label className="block text-xs font-semibold mb-1">Payment Method</label>
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
                <label className="block text-xs font-semibold mb-1">Bank UTR / Reference</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submittingPayment} className="bg-indigo-600 text-white">
                  {submittingPayment ? 'Saving...' : 'Disburse Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseDetails;
