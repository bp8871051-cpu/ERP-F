import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Printer,
  Send,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Download,
  Mail,
  Phone,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Payment Recording Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('bank_transfer');
  const [payRef, setPayRef] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await salesService.getInvoice(id);
      const invData = res.data?.data || res.data;
      setInvoice(invData);

      const due = Number(invData.due_amount ?? (invData.grand_total - (invData.paid_amount || 0)));
      setPayAmount(due > 0 ? due : invData.grand_total);
      setPayRef(`PAY-${Date.now().toString().slice(-6)}`);
    } catch (err) {
      console.error('Failed to load invoice:', err);
      setError('Invoice not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!window.confirm(`Send invoice ${invoice.invoice_number} to ${invoice.customer?.email || 'customer'}?`)) return;
    try {
      setSendingEmail(true);
      await salesService.sendInvoice(id);
      alert('Invoice notification successfully dispatched!');
      fetchInvoice();
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending invoice.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    try {
      setSubmittingPayment(true);
      await salesService.recordPayment(id, {
        amount: Number(payAmount),
        payment_method: payMethod,
        reference: payRef,
        payment_date: new Date().toISOString().slice(0, 10),
      });
      setShowPaymentModal(false);
      fetchInvoice();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording customer payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invoice Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">{error || 'This invoice does not exist.'}</p>
        <Button variant="outline" onClick={() => navigate('/app/sales/invoices')}>
          Back to Invoices
        </Button>
      </div>
    );
  }

  const dueBalance = Number(invoice.due_amount ?? (invoice.grand_total - (invoice.paid_amount || 0)));

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/sales/invoices')}
            className="p-2 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {invoice.invoice_number}
              </h1>
              <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'sent' ? 'info' : 'warning'}>
                {invoice.status}
              </Badge>
              {invoice.payment_status === 'paid' ? (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Fully Paid</span>
              ) : (
                <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-semibold">
                  Due: ₹{dueBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued on: {invoice.invoice_date || invoice.issue_date || 'N/A'} • Due: {invoice.due_date || 'Immediate'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dueBalance > 0 && (
            <Button
              variant="primary"
              onClick={() => setShowPaymentModal(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CreditCard className="w-4 h-4" />
              Record Payment
            </Button>
          )}

          <Button
            variant="outline"
            disabled={sendingEmail}
            onClick={handleSendInvoice}
            className="gap-2 text-blue-600 hover:bg-blue-50 border-blue-200"
          >
            <Send className="w-4 h-4" />
            {sendingEmail ? 'Sending...' : 'Email Invoice'}
          </Button>

          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Professional Tax Invoice Document (Print Ready) */}
      <Card className="p-8 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-lg">
                F
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">FALCON ERP ENTERPRISE</span>
            </div>
            <p className="text-xs text-slate-500">Corporate Tower, Phase II, Tech Park</p>
            <p className="text-xs text-slate-500">Ahmedabad, Gujarat - 380015, India</p>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">GSTIN / Tax ID:</span> 24AABCF1234F1Z8
            </p>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Email:</span> billing@falconerp.com
            </p>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">TAX INVOICE</h2>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{invoice.invoice_number}</p>
            <div className="text-xs text-slate-500 mt-3 space-y-1">
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Invoice Date:</span>{' '}
                {invoice.invoice_date || invoice.issue_date || 'N/A'}
              </p>
              <p>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Payment Due:</span>{' '}
                {invoice.due_date || 'Immediate Upon Receipt'}
              </p>
              {invoice.sales_order && (
                <p>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Order Ref:</span>{' '}
                  {invoice.sales_order.order_number}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bill To & Ship To Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Billed To (Customer):</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{invoice.customer?.name || 'Walk-in Customer'}</p>
            {invoice.customer?.company_name && (
              <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5">{invoice.customer.company_name}</p>
            )}
            <p className="text-slate-500 mt-1.5">{invoice.customer?.billing_address || 'Registered Office Address'}</p>
            <p className="text-slate-500">{invoice.customer?.city ? `${invoice.customer.city}, ${invoice.customer.state || ''}` : ''}</p>
            {invoice.customer?.gst_number && (
              <p className="mt-2 text-slate-700 dark:text-slate-300 font-medium">
                Customer GSTIN: <span className="font-mono">{invoice.customer.gst_number}</span>
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Dispatch / Fulfillment:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {invoice.warehouse?.name || 'Central Distribution Depot'}
            </p>
            <p className="text-slate-500 mt-1.5">{invoice.customer?.shipping_address || 'Same as billing address'}</p>
            <p className="text-slate-500 mt-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Contact:</span>{' '}
              {invoice.customer?.phone || invoice.customer?.email || 'N/A'}
            </p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-3 w-10">#</th>
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-right w-20">Qty</th>
                <th className="py-3 px-3 text-right w-28">Rate (₹)</th>
                <th className="py-3 px-3 text-right w-20">Discount</th>
                <th className="py-3 px-3 text-right w-20">Tax</th>
                <th className="py-3 px-3 text-right w-32">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(invoice.items || []).map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {it.product?.name || 'Commercial Item'}
                    </span>
                    {it.product?.sku && <span className="text-[11px] text-slate-400">SKU: {it.product.sku}</span>}
                  </td>
                  <td className="py-3 px-3 text-right font-medium">{it.quantity}</td>
                  <td className="py-3 px-3 text-right">
                    ₹{Number(it.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-600">
                    ₹{Number(it.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    ₹{Number(it.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                    ₹{Number(it.subtotal || (it.quantity * it.unit_price) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Financial Settlement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">Payment Terms & Bank Details:</h4>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-slate-600 dark:text-slate-400 space-y-1">
              <p>Bank: HDFC Bank Ltd.</p>
              <p>Account Holder: Falcon Enterprise Solutions LLP</p>
              <p>A/C No: 50200088991122 • IFSC: HDFC0001234</p>
              <p className="mt-2 text-[11px] text-slate-400">Note: Please quote invoice number in bank transfer remarks.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{Number(invoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Number(invoice.discount || 0) > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Discount:</span>
                <span className="font-medium text-emerald-600">
                  -₹{Number(invoice.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Tax (GST):</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{Number(invoice.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {Number(invoice.shipping || 0) > 0 && (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  ₹{Number(invoice.shipping || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-black text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                ₹{Number(invoice.grand_total || invoice.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-600">
              <span>Paid Amount:</span>
              <span>₹{Number(invoice.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-rose-600 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
              <span>Outstanding Due:</span>
              <span>₹{dueBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Signature & Authorization Section */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">Terms & Conditions:</p>
            <p className="text-[11px] mt-0.5">1. Goods once sold are subject to standard warranty SLA.</p>
            <p className="text-[11px]">2. Payment must be cleared on or before the due date.</p>
          </div>
          <div className="text-center w-48">
            <div className="border-b border-slate-400 pb-8 mb-1">
              <span className="font-script text-slate-400 italic">Falcon Signature</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
              Authorized Signatory
            </span>
          </div>
        </div>
      </Card>

      {/* Customer Payments History Ledger */}
      {invoice.payments && invoice.payments.length > 0 && (
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Payment Receipts Ledger
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference #</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoice.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3">{p.payment_date || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {p.reference || '—'}
                    </td>
                    <td className="py-2.5 px-3 capitalize">{p.payment_method || 'Bank Transfer'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Payment</h3>
                <p className="text-xs text-slate-500">Invoice: {invoice.invoice_number}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Reference #
                </label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submittingPayment}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CreditCard className="w-4 h-4" />
                  {submittingPayment ? 'Saving...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;
