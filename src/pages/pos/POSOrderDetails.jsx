import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt,
  Printer,
  RotateCcw,
  XCircle,
  Calendar,
  User,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import posService from '../../services/posService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const POSOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({
    amount: '',
    reason: 'Customer return',
    refund_method: 'cash',
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await posService.getOrderDetails(id);
      const data = res.data || res;
      setOrder(data);
      if (data) {
        setRefundForm((prev) => ({
          ...prev,
          amount: data.total_amount || 0,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch POS order details:', err);
      setError('Unable to load POS order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this POS order? Inventory will be restored.')) return;
    try {
      setActionLoading(true);
      await posService.cancelOrder(id);
      await fetchOrderDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!refundForm.amount || Number(refundForm.amount) <= 0) {
      alert('Please enter a valid refund amount.');
      return;
    }
    try {
      setActionLoading(true);
      await posService.processRefund(id, {
        amount: Number(refundForm.amount),
        reason: refundForm.reason,
        refund_method: refundForm.refund_method,
      });
      setShowRefundModal(false);
      await fetchOrderDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing refund');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
        </div>
        <LoadingSkeleton className="h-80" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card className="p-8 text-center bg-white shadow-xs border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800 mb-1">Failed to Load Order</h3>
        <p className="text-xs text-slate-500 mb-4">{error || 'Order record not found.'}</p>
        <Button variant="secondary" onClick={() => navigate('/app/pos/orders')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to POS Orders
        </Button>
      </Card>
    );
  }

  const items = order.items || order.order_items || [];
  const payments = order.payments || [];
  const refunds = order.refunds || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/pos/orders')}
            className="text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{order.order_number || `POS-${order.id}`}</h1>
              <Badge
                variant={
                  order.order_status === 'completed'
                    ? 'success'
                    : order.order_status === 'refunded'
                    ? 'warning'
                    : order.order_status === 'cancelled'
                    ? 'danger'
                    : 'default'
                }
              >
                {order.order_status?.toUpperCase() || 'COMPLETED'}
              </Badge>
              <Badge
                variant={
                  order.payment_status === 'paid'
                    ? 'success'
                    : order.payment_status === 'partially_paid'
                    ? 'warning'
                    : order.payment_status === 'refunded'
                    ? 'info'
                    : 'danger'
                }
              >
                {order.payment_status?.toUpperCase() || 'PAID'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created on {new Date(order.created_at).toLocaleString()} • Register Shift #{order.register_session_id || '1'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowReceiptModal(true)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
            Print Receipt
          </Button>

          {order.order_status !== 'cancelled' && order.order_status !== 'refunded' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowRefundModal(true)}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Issue Refund
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelOrder}
                disabled={actionLoading}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Cancel Order
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Subtotal</span>
          <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(order.subtotal)}</p>
          <span className="text-[11px] text-slate-400">Before discounts & tax</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Discount & Tax</span>
          <p className="text-lg font-bold text-slate-800 mt-1">
            -{formatCurrency(order.discount_amount)} / +{formatCurrency(order.tax_amount)}
          </p>
          <span className="text-[11px] text-slate-400">Total applied tax & discount</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Grand Total</span>
          <p className="text-lg font-bold text-teal-600 mt-1">{formatCurrency(order.total_amount)}</p>
          <span className="text-[11px] text-slate-400">Net invoiced amount</span>
        </Card>
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Payment Tendered</span>
          <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(order.paid_amount || order.total_amount)}</p>
          <span className="text-[11px] text-emerald-600 font-medium">
            Change: {formatCurrency(order.change_amount || 0)}
          </span>
        </Card>
      </div>

      {/* Two Column Layout: Items + Customer Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Line Items & Payment Tender */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <Card className="p-0 bg-white border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-600" />
                Purchased Items ({items.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Discount</th>
                    <th className="py-2.5 px-3 text-right">Tax</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{item.product_name || item.product?.name}</div>
                        {item.barcode && <div className="text-[10px] text-slate-400 font-mono">BC: {item.barcode}</div>}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{item.sku || item.product?.sku || 'N/A'}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-3 px-3 text-right text-rose-500 font-medium">
                        {item.discount_amount > 0 ? `-${formatCurrency(item.discount_amount)}` : '₹0.00'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 font-medium">{formatCurrency(item.tax_amount)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-slate-400">
                        No item records attached to this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Subtotal Calculation Breakdown */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-medium text-slate-800">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Order Discount:</span>
                  <span className="font-medium text-rose-600">-{formatCurrency(order.discount_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (GST / VAT):</span>
                  <span className="font-medium text-slate-800">+{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Round Off:</span>
                  <span className="font-medium text-slate-800">{formatCurrency(order.round_off || 0)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                  <span>Net Payable:</span>
                  <span className="text-teal-600">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Tender History */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-teal-600" />
              Payment Tender Records
            </h3>
            {payments.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {payments.map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 capitalize flex items-center gap-2">
                        {p.payment_method}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase font-mono">
                          {p.status || 'PAID'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Ref: {p.transaction_reference || 'N/A'} • {new Date(p.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right font-bold text-slate-800">{formatCurrency(p.amount)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-semibold capitalize text-slate-800">{order.payment_method || 'Cash'}</span>
              </div>
            )}
          </Card>

          {/* Refund History */}
          {refunds.length > 0 && (
            <Card className="p-4 bg-white border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-3">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                Refund Transactions ({refunds.length})
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {refunds.map((ref, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{ref.refund_number || `REF-${ref.id}`}</div>
                      <div className="text-[11px] text-slate-500">
                        Reason: {ref.reason || 'Customer return'} • Method: {ref.refund_method}
                      </div>
                    </div>
                    <div className="text-right font-bold text-amber-600">-{formatCurrency(ref.amount)}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Customer & Register Details */}
        <div className="space-y-6">
          {/* Customer Card */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Customer Information</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-sm">
                {(order.customer?.name || order.customer_name || 'W')[0]}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {order.customer?.name || order.customer_name || 'Walk-in Customer'}
                </h4>
                <p className="text-xs text-slate-500">{order.customer?.phone || order.customer_phone || 'No phone recorded'}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600">
                <span>Customer Type:</span>
                <span className="font-semibold text-slate-800">
                  {order.customer_id ? 'Registered Client' : 'Walk-in'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email:</span>
                <span className="font-medium text-slate-800">{order.customer?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GSTIN / Tax ID:</span>
                <span className="font-medium text-slate-800">{order.customer?.tax_number || 'N/A'}</span>
              </div>
            </div>
          </Card>

          {/* POS Terminal Details */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">POS Terminal & Staff</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Cashier:
                </span>
                <span className="font-semibold text-slate-800">
                  {order.cashier?.name || order.user?.name || 'Store Cashier'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Warehouse:
                </span>
                <span className="font-semibold text-slate-800">
                  {order.warehouse?.name || 'Main Retail Store'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" /> Invoice Ref:
                </span>
                <span className="font-mono text-slate-800 font-medium">
                  {order.invoice?.invoice_number || `INV-${order.id}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Transaction Time:
                </span>
                <span className="text-slate-800">{new Date(order.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Thermal Receipt Print Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Printer className="w-4 h-4 text-teal-400" />
                POS Thermal Receipt
              </h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Receipt Preview Paper (80mm styling) */}
            <div className="p-4 overflow-y-auto flex-1 bg-white font-mono text-xs text-slate-800 leading-relaxed border-b border-slate-200">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h4 className="font-bold text-sm tracking-wider uppercase">DREAMS ENTERPRISE ERP</h4>
                <p className="text-[10px] text-slate-500">Retail Outlet #1 • Central Mall</p>
                <p className="text-[10px] text-slate-500">GSTIN: 27AABCT2345Q1Z8</p>
                <p className="text-[10px] text-slate-500 mt-1">Tel: +91 98765 43210</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Receipt No:</span>
                  <span className="font-bold">{order.order_number || `POS-${order.id}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{order.cashier?.name || 'Cashier 1'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{order.customer?.name || order.customer_name || 'Walk-in'}</span>
                </div>
              </div>

              {/* Items */}
              <div className="py-2 border-b border-dashed border-slate-300 text-[10px]">
                <div className="flex justify-between font-bold pb-1">
                  <span>ITEM</span>
                  <span>QTY x PRICE</span>
                  <span>TOTAL</span>
                </div>
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <span className="truncate max-w-[120px]">{it.product_name || it.product?.name}</span>
                    <span>
                      {it.quantity} x {Number(it.unit_price).toFixed(0)}
                    </span>
                    <span className="font-bold">{Number(it.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>₹{Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>DISCOUNT:</span>
                  <span>-₹{Number(order.discount_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TAX (GST):</span>
                  <span>+₹{Number(order.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-dashed border-slate-300">
                  <span>GRAND TOTAL:</span>
                  <span>₹{Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] pt-1">
                  <span>PAID ({order.payment_method || 'CASH'}):</span>
                  <span>₹{Number(order.paid_amount || order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>CHANGE:</span>
                  <span>₹{Number(order.change_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 text-center text-[10px] text-slate-500">
                <p className="font-semibold text-slate-700">Thank you for shopping with us!</p>
                <p>Goods once sold can be returned within 7 days with this original receipt.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-slate-50 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 bg-teal-600 hover:bg-teal-700"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-1.5" /> Print Now
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-amber-50">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                Issue Order Refund
              </h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleRefundSubmit} className="p-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Refund Amount (Max: {formatCurrency(order.total_amount)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={order.total_amount}
                  required
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Refund Method</label>
                <select
                  value={refundForm.refund_method}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_method: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500 bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Original Card</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Store Credit / Wallet</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Refund</label>
                <textarea
                  rows="2"
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  placeholder="e.g. Defective item, customer changed mind"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-[11px] flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Processing this refund will automatically adjust inventory levels back to the warehouse and create a refund ledger entry.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRefundModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Confirm Refund'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSOrderDetails;
