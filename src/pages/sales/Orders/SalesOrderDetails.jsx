import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Building2,
  Calendar,
  CheckCircle,
  FileText,
  Truck,
  Printer,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const SalesOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await salesService.getOrder(id);
      setOrder(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setError('Unable to load sales order.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!window.confirm('Confirm this sales order? Available stock will be reserved in the fulfillment warehouse.')) return;
    try {
      setActionLoading(true);
      await salesService.confirmOrder(id);
      fetchOrderDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error confirming order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!window.confirm('Convert this confirmed order into an official Sales Invoice?')) return;
    try {
      setActionLoading(true);
      const res = await salesService.convertOrderToInvoice(id);
      const invId = res.data?.data?.id;
      if (invId) {
        navigate(`/app/sales/invoices/${invId}`);
      } else {
        fetchOrderDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error converting order to invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = window.prompt('Please enter cancellation reason:');
    if (reason !== null) {
      try {
        setActionLoading(true);
        await salesService.cancelOrder(id, reason);
        fetchOrderDetails();
      } catch (err) {
        alert(err.response?.data?.message || 'Error cancelling order');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Order Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">{error || 'This sales order does not exist or has been removed.'}</p>
        <Button variant="outline" onClick={() => navigate('/app/sales/orders')}>
          Return to Sales Orders
        </Button>
      </div>
    );
  }

  const workflowSteps = [
    { label: 'Draft', active: true, completed: order.status !== 'draft' },
    { label: 'Confirmed', active: ['confirmed', 'processing', 'partially_delivered', 'delivered', 'completed'].includes(order.status), completed: ['processing', 'partially_delivered', 'delivered', 'completed'].includes(order.status) },
    { label: 'Processing / Delivery', active: ['processing', 'partially_delivered', 'delivered', 'completed'].includes(order.status), completed: ['delivered', 'completed'].includes(order.status) },
    { label: 'Invoice & Payment', active: ['delivered', 'completed'].includes(order.status) || order.invoices?.length > 0, completed: order.payment_status === 'paid' },
    { label: 'Completed', active: order.status === 'completed', completed: order.status === 'completed' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 print:p-0">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/sales/orders')}
            className="p-2 text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {order.order_number}
              </h1>
              <Badge variant={order.status === 'confirmed' ? 'info' : order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'neutral'}>
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Order Date: {order.order_date || 'N/A'} • Reference: {order.reference_number || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.status === 'draft' && (
            <Button
              variant="primary"
              disabled={actionLoading}
              onClick={handleConfirmOrder}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Reserve Stock
            </Button>
          )}

          {['confirmed', 'processing'].includes(order.status) && (
            <>
              <Button
                variant="outline"
                disabled={actionLoading}
                onClick={handleConvertToInvoice}
                className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <FileText className="w-4 h-4" />
                Convert to Invoice
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(`/app/sales/delivery-notes?order_id=${order.id}`)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Truck className="w-4 h-4" />
                Create Delivery Note
              </Button>
            </>
          )}

          {['draft', 'confirmed'].includes(order.status) && (
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={handleCancelOrder}
              className="gap-1.5 text-rose-600 hover:bg-rose-50"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </Button>
          )}

          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Workflow Step Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:hidden">
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {workflowSteps.map((st, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  st.completed
                    ? 'bg-emerald-600 text-white'
                    : st.active
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {st.completed ? '✓' : idx + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  st.active || st.completed
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400'
                }`}
              >
                {st.label}
              </span>
              {idx < workflowSteps.length - 1 && (
                <div className="w-8 sm:w-16 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Main Order Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Shipping Details */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400">Customer Details</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {order.customer?.name || 'Walk-in Customer'}
              </h2>
              {order.customer?.company_name && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {order.customer.company_name}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-semibold text-slate-400">Customer Code</span>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {order.customer?.customer_code || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                Contact & Communication:
              </span>
              <p className="flex items-center gap-1.5 text-slate-500">
                <Mail className="w-3.5 h-3.5" /> {order.customer?.email || 'No email provided'}
              </p>
              <p className="flex items-center gap-1.5 text-slate-500 mt-1">
                <Phone className="w-3.5 h-3.5" /> {order.customer?.phone || 'No phone provided'}
              </p>
              {order.customer?.gst_number && (
                <p className="text-slate-500 mt-1">
                  GST/VAT: <span className="font-medium text-slate-700 dark:text-slate-200">{order.customer.gst_number}</span>
                </p>
              )}
            </div>

            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-1">
                Fulfillment Warehouse & Shipping:
              </span>
              <p className="flex items-start gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  {order.warehouse ? `${order.warehouse.name} (${order.warehouse.location || 'HQ'})` : 'Main Central Warehouse'}
                </span>
              </p>
              <p className="text-slate-500 mt-1">
                Expected Delivery: <span className="font-medium text-amber-600">{order.expected_delivery_date || 'Standard SLA'}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Financial Overview Card */}
        <Card className="p-6 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800/80 dark:to-slate-900 border border-indigo-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-indigo-100/60 dark:border-slate-800 pb-3">
            <span className="text-xs uppercase font-semibold text-indigo-600 dark:text-indigo-400">Order Financials</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              ₹{Number(order.grand_total || order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Payment Terms: {order.payment_terms || 'Net 30'}</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Subtotal:</span>
              <span>₹{Number(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Discount:</span>
              <span className="text-emerald-600">-₹{Number(order.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Tax (GST):</span>
              <span>₹{Number(order.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Shipping:</span>
              <span>₹{Number(order.shipping || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Paid Amount:</span>
              <span className="text-emerald-600">₹{Number(order.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>Due Balance:</span>
              <span className="text-rose-600">
                ₹{Number(order.due_amount || (order.grand_total - (order.paid_amount || 0)) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            Ordered Line Items ({order.items?.length || 0})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3 text-right">Quantity</th>
                <th className="px-5 py-3 text-right">Unit Price</th>
                <th className="px-5 py-3 text-right">Discount</th>
                <th className="px-5 py-3 text-right">Tax</th>
                <th className="px-5 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(order.items || []).map((it, idx) => (
                <tr key={it.id || idx} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-xs text-slate-400">{idx + 1}</td>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                    {it.product?.name || it.description || 'Product Item'}
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500">{it.product?.sku || it.sku || '—'}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900 dark:text-white">{it.quantity}</td>
                  <td className="px-5 py-3 text-right">₹{Number(it.unit_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-right text-emerald-600">₹{Number(it.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-right">₹{Number(it.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-white">
                    ₹{Number(it.subtotal || (it.quantity * it.unit_price) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Linked Invoices and Delivery Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        {/* Linked Invoices */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Generated Invoices
            </h3>
            {order.invoices?.length > 0 && (
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                {order.invoices.length} Issued
              </span>
            )}
          </div>
          {order.invoices && order.invoices.length > 0 ? (
            <div className="space-y-2">
              {order.invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => navigate(`/app/sales/invoices/${inv.id}`)}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-semibold text-xs text-indigo-600">{inv.invoice_number}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{inv.invoice_date || 'Date N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      ₹{Number(inv.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[11px] text-slate-500 capitalize">{inv.payment_status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No invoices generated for this order yet.</p>
          )}
        </Card>

        {/* Linked Delivery Notes */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Delivery Notes
            </h3>
          </div>
          {order.delivery_notes && order.delivery_notes.length > 0 ? (
            <div className="space-y-2">
              {order.delivery_notes.map((dn) => (
                <div
                  key={dn.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-xs text-emerald-600">{dn.delivery_number}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{dn.delivery_date || 'Date N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600">
                      {dn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No delivery notes generated yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SalesOrderDetails;
