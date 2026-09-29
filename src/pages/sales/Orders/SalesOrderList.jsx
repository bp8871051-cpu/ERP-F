import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const SalesOrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [search, status, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await salesService.getOrders({
        search: search || undefined,
        status: status || undefined,
        page,
        per_page: 15,
      });
      const payload = res.data?.data || res.data;
      setOrders(payload.data || payload || []);
      setMeta({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || (payload.data ? payload.data.length : 0),
      });
    } catch (err) {
      console.error('Failed to load sales orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Confirm this sales order? This will reserve available stock in the warehouse.')) {
      try {
        setActionLoadingId(id);
        await salesService.confirmOrder(id);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Error confirming order');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleConvertToInvoice = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Generate an official Sales Invoice from this order?')) {
      try {
        setActionLoadingId(id);
        const res = await salesService.convertOrderToInvoice(id);
        alert('Invoice created successfully!');
        if (res.data?.data?.id) {
          navigate(`/app/sales/invoices/${res.data.data.id}`);
        } else {
          fetchOrders();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error converting to invoice');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleCancelOrder = async (id, e) => {
    e.stopPropagation();
    const reason = window.prompt('Please enter cancellation reason:');
    if (reason !== null) {
      try {
        setActionLoadingId(id);
        await salesService.cancelOrder(id, reason);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Error cancelling order');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (!orders.length) return;
    const headers = ['Order #', 'Customer', 'Date', 'Items', 'Grand Total', 'Payment Status', 'Order Status'];
    const rows = orders.map((o) => [
      `"${o.order_number || ''}"`,
      `"${o.customer?.name || ''}"`,
      `"${o.order_date || ''}"`,
      `"${o.items?.length || 0}"`,
      `"${o.grand_total || 0}"`,
      `"${o.payment_status || ''}"`,
      `"${o.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `sales_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    switch (s) {
      case 'confirmed':
        return <Badge variant="info">Confirmed</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'partially delivered':
      case 'partially_delivered':
        return <Badge variant="secondary">Partially Delivered</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'draft':
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  const getPaymentStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    switch (s) {
      case 'paid':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Paid</span>;
      case 'partially_paid':
      case 'partial':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Partial</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">Unpaid</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-indigo-600" />
            Sales Orders
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage sales pipeline, reserve inventory stock, and dispatch delivery notes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/app/sales/orders/create')}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Create Sales Order
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order #, customer name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Order Statuses</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setStatus('');
                setPage(1);
              }}
              className="gap-1.5 text-xs text-slate-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No Sales Orders Found</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Get started by creating your first sales order to reserve inventory stock.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/app/sales/orders/create')}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Create Sales Order
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Order #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Order Date</th>
                  <th className="px-5 py-3.5 text-center">Items</th>
                  <th className="px-5 py-3.5 text-right">Grand Total</th>
                  <th className="px-5 py-3.5 text-center">Payment</th>
                  <th className="px-5 py-3.5 text-center">Order Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/app/sales/orders/${order.id}`)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {order.customer?.name || 'Walk-in Customer'}
                      </div>
                      {order.customer?.company_name && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {order.customer.company_name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {order.order_date || 'N/A'}
                      </div>
                      {order.expected_delivery_date && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                          Exp: {order.expected_delivery_date}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center font-medium">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{Number(order.grand_total || order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getPaymentStatusBadge(order.payment_status)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'draft' && (
                          <button
                            onClick={(e) => handleConfirmOrder(order.id, e)}
                            disabled={actionLoadingId === order.id}
                            title="Confirm Order (Reserve Stock)"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {order.status === 'confirmed' && (
                          <button
                            onClick={(e) => handleConvertToInvoice(order.id, e)}
                            disabled={actionLoadingId === order.id}
                            title="Convert to Sales Invoice"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        {['draft', 'confirmed'].includes(order.status) && (
                          <button
                            onClick={(e) => handleCancelOrder(order.id, e)}
                            disabled={actionLoadingId === order.id}
                            title="Cancel Order"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/app/sales/orders/${order.id}`)}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
              <span className="font-semibold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} orders total)
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
    </div>
  );
};

export default SalesOrderList;
