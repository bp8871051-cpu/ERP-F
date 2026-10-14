import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Printer,
  RotateCcw,
  XCircle,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
} from 'lucide-react';
import posService from '../../services/posService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../components/ui/SearchableSelect';

export const POSOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Refund Modal State
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('Customer return');
  const [refundMethod, setRefundMethod] = useState('cash');
  const [refundType, setRefundType] = useState('full'); // full, partial
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;

      const res = await posService.getOrders(params);
      const data = res.data;
      setOrders(data.data || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0,
      });
    } catch (err) {
      console.error('Error fetching POS orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [search, statusFilter, paymentFilter]);

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you sure you want to cancel order ${order.order_number}?`)) return;
    try {
      await posService.cancelOrder(order.id);
      setFeedback({ type: 'success', text: `Order ${order.order_number} cancelled.` });
      fetchOrders(pagination.current_page);
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to cancel order.' });
    }
  };

  const handleExecuteRefund = async () => {
    if (!selectedOrderForRefund) return;
    try {
      setIsProcessingRefund(true);
      const payload = {
        refund_type: refundType,
        reason: refundReason,
        payment_method: refundMethod,
      };

      await posService.processRefund(selectedOrderForRefund.id, payload);
      setFeedback({
        type: 'success',
        text: `Refund processed successfully for ${selectedOrderForRefund.order_number}. Inventory has been restocked.`,
      });
      setSelectedOrderForRefund(null);
      fetchOrders(pagination.current_page);
    } catch (err) {
      console.error('Refund error:', err);
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to process refund.' });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'refunded':
        return <Badge variant="danger">Refunded</Badge>;
      case 'partially_refunded':
        return <Badge variant="warning">Partially Refunded</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelled</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="teal">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'refunded':
        return <Badge variant="danger">Refunded</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">POS Orders & Sales Register</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction ledger of retail checkouts, tender records, and stock restocking refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => fetchOrders(pagination.current_page)}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={() => navigate('/app/pos/terminal')}
            className="bg-teal-700 hover:bg-teal-800 text-white"
          >
            Open POS Screen
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 !overflow-visible">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Order # or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="w-48 z-10">
            <SearchableSelect
              options={[
                { value: '', label: 'All Order Status' },
                { value: 'completed', label: 'Completed' },
                { value: 'refunded', label: 'Refunded' },
                { value: 'partially_refunded', label: 'Partially Refunded' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              searchable={false}
            />
          </div>

          <div className="w-40 z-10">
            <SearchableSelect
              options={[
                { value: '', label: 'All Payments' },
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
                { value: 'refunded', label: 'Refunded' }
              ]}
              value={paymentFilter}
              onChange={(val) => setPaymentFilter(val)}
              searchable={false}
            />
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">Total: {pagination.total} Orders</span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton type="table" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Receipt className="w-10 h-10 mx-auto stroke-1" />
            <p className="text-sm font-semibold text-slate-700">No POS orders found</p>
            <p className="text-xs">No orders match your filter criteria or register is awaiting first checkout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Order No</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Cashier</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Tax</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Tender</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-800">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">
                      {order.customer?.name || 'Walk-in Customer'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {order.cashier?.name || 'Admin Cashier'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold">
                        {order.items?.length || 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      ₹{Number(order.subtotal || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      ₹{Number(order.tax_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                      ₹{Number(order.total_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center uppercase font-mono text-[10px] text-slate-500">
                      {order.payment_method}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(order.order_status)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/app/pos/orders/${order.id}`)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {order.order_status !== 'refunded' && order.order_status !== 'cancelled' && (
                          <button
                            onClick={() => setSelectedOrderForRefund(order)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded"
                            title="Process Refund & Restock"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {order.order_status === 'completed' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                            title="Cancel Order"
                          >
                            <XCircle className="w-3.5 h-3.5" />
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
      </div>

      {/* Refund Processing Modal */}
      <AnimatePresence>
        {selectedOrderForRefund && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full !overflow-visible border border-slate-200"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Process POS Refund</h3>
                  <p className="text-xs text-amber-400">Order: {selectedOrderForRefund.order_number}</p>
                </div>
                <button
                  onClick={() => setSelectedOrderForRefund(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs !overflow-visible">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                  <p className="font-semibold">Refund Amount: ₹{Number(selectedOrderForRefund.total_amount).toLocaleString()}</p>
                  <p className="text-[11px] text-amber-700">Inventory items will automatically be restocked into the warehouse ledger.</p>
                </div>

                <div className="space-y-1 z-30">
                  <label className="font-semibold text-slate-700">Refund Type:</label>
                  <SearchableSelect
                    options={[
                      { value: 'full', label: 'Full Order Refund (100% Value + Restock)' },
                      { value: 'partial', label: 'Partial / Customer Goodwill Refund' }
                    ]}
                    value={refundType}
                    onChange={(val) => setRefundType(val)}
                    searchable={false}
                  />
                </div>

                <div className="space-y-1 z-20">
                  <label className="font-semibold text-slate-700">Refund Reason:</label>
                  <SearchableSelect
                    options={[
                      { value: 'Customer changed mind', label: 'Customer changed mind' },
                      { value: 'Defective or damaged product', label: 'Defective or damaged product' },
                      { value: 'Wrong product billed', label: 'Wrong product billed' },
                      { value: 'Pricing / billing discrepancy', label: 'Pricing / billing discrepancy' }
                    ]}
                    value={refundReason}
                    onChange={(val) => setRefundReason(val)}
                    searchable={false}
                  />
                </div>

                <div className="space-y-1 z-10">
                  <label className="font-semibold text-slate-700">Refund Payout Tender:</label>
                  <SearchableSelect
                    options={[
                      { value: 'cash', label: 'Cash Outflow from Register' },
                      { value: 'card', label: 'Reverse to Card' },
                      { value: 'upi', label: 'Direct UPI Reversal' },
                      { value: 'credit', label: 'Store Credit Balance' }
                    ]}
                    value={refundMethod}
                    onChange={(val) => setRefundMethod(val)}
                    searchable={false}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setSelectedOrderForRefund(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={isProcessingRefund}
                  onClick={handleExecuteRefund}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isProcessingRefund ? 'Restocking...' : 'Authorize Refund & Restock'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POSOrders;
