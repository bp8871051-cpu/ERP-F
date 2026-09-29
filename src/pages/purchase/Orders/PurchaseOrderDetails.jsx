import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Printer,
  CheckCircle,
  Truck,
  XCircle,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  MapPin,
  DollarSign,
} from 'lucide-react';
import purchaseService from '../../../services/purchaseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const PurchaseOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getOrder(id);
      setOrder(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load purchase order:', err);
      setError('Purchase order not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Approve this purchase order?')) return;
    try {
      setActionLoading(true);
      await purchaseService.approveOrder(id);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving PO');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveGoods = async () => {
    if (
      window.confirm(
        'Confirm goods received against this purchase order? This will immediately increase physical warehouse stock and record a PURCHASE_IN movement.'
      )
    ) {
      try {
        setActionLoading(true);
        await purchaseService.receiveOrder(id);
        alert('Goods received! Inventory stock updated successfully.');
        fetchOrder();
      } catch (err) {
        alert(err.response?.data?.message || 'Error receiving goods');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Cancellation reason:');
    if (reason !== null) {
      try {
        setActionLoading(true);
        await purchaseService.cancelOrder(id, reason);
        fetchOrder();
      } catch (err) {
        alert(err.response?.data?.message || 'Error cancelling PO');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold">Purchase Order Not Found</h2>
        <Button variant="outline" onClick={() => navigate('/app/purchase/orders')} className="mt-4">
          Back to Purchase Orders
        </Button>
      </div>
    );
  }

  const workflowSteps = [
    { label: 'Draft', active: true, completed: order.status !== 'draft' },
    { label: 'Approved', active: ['approved', 'ordered', 'received', 'completed'].includes(order.status), completed: ['received', 'completed'].includes(order.status) },
    { label: 'Goods Received (Stock In)', active: ['received', 'completed'].includes(order.status), completed: ['received', 'completed'].includes(order.status) },
    { label: 'Completed', active: order.status === 'completed', completed: order.status === 'completed' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/purchase/orders')}
            className="p-2 text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {order.po_number}
              </h1>
              <Badge variant={order.status === 'received' ? 'success' : order.status === 'approved' ? 'info' : 'warning'}>
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              PO Date: {order.po_date || 'N/A'} • Expected Delivery: {order.expected_delivery_date || 'Standard SLA'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['draft', 'pending_approval'].includes(order.status) && (
            <Button
              variant="primary"
              disabled={actionLoading}
              onClick={handleApprove}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="w-4 h-4" /> Approve PO
            </Button>
          )}

          {['approved', 'ordered'].includes(order.status) && (
            <Button
              variant="primary"
              disabled={actionLoading}
              onClick={handleReceiveGoods}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Truck className="w-4 h-4" /> Receive Goods (Stock IN)
            </Button>
          )}

          {['draft', 'pending_approval', 'approved'].includes(order.status) && (
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={handleCancel}
              className="gap-1.5 text-rose-600 hover:bg-rose-50"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </Button>
          )}

          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Workflow Indicator */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:hidden">
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {workflowSteps.map((st, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  st.completed
                    ? 'bg-emerald-600 text-white'
                    : st.active
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {st.completed ? '✓' : idx + 1}
              </div>
              <span className={`text-xs font-medium ${st.active || st.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {st.label}
              </span>
              {idx < workflowSteps.length - 1 && (
                <div className="w-12 sm:w-24 h-0.5 bg-slate-200 dark:bg-slate-700 mx-1" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Printable PO Sheet */}
      <Card className="p-8 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-lg">
                F
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">FALCON ERP ENTERPRISE</span>
            </div>
            <p className="text-xs text-slate-500">Corporate Procurement Division</p>
            <p className="text-xs text-slate-500">Ahmedabad, Gujarat - 380015, India</p>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
              PURCHASE ORDER
            </h2>
            <p className="text-sm font-bold text-indigo-600 mt-1">{order.po_number}</p>
            <p className="text-xs text-slate-500 mt-2">
              Date: <span className="font-semibold">{order.po_date || 'N/A'}</span>
            </p>
            <p className="text-xs text-slate-500">
              Delivery Target: <span className="font-semibold text-amber-600">{order.expected_delivery_date || 'Standard SLA'}</span>
            </p>
          </div>
        </div>

        {/* Vendor & Delivery Depot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Supplier / Vendor:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{order.vendor?.name || 'Vendor'}</p>
            {order.vendor?.company_name && <p className="text-slate-600 dark:text-slate-300 font-medium">{order.vendor.company_name}</p>}
            <p className="text-slate-500 mt-1">{order.vendor?.address || 'Supplier address on file'}</p>
            {order.vendor?.gst_number && (
              <p className="text-slate-600 dark:text-slate-300 mt-1.5 font-mono">GSTIN: {order.vendor.gst_number}</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Deliver To Warehouse Depot:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{order.warehouse?.name || 'Main Central Warehouse'}</p>
            <p className="text-slate-500 mt-1">{order.warehouse?.location || 'Ahmedabad Facility'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-bold">
                <th className="py-3 px-3 w-10">#</th>
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-right w-20">Qty</th>
                <th className="py-3 px-3 text-right w-28">Cost Rate (₹)</th>
                <th className="py-3 px-3 text-right w-20">Tax %</th>
                <th className="py-3 px-3 text-right w-32">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(order.items || []).map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 dark:text-white block">{it.product?.name || 'Procurement Item'}</span>
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
                ₹{Number(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax (GST):</span>
              <span className="font-medium text-slate-900 dark:text-white">
                ₹{Number(order.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t flex justify-between font-black text-sm text-slate-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="text-indigo-600">
                ₹{Number(order.grand_total || order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseOrderDetails;
