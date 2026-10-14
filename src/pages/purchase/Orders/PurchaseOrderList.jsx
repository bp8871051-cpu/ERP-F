import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Truck,
  XCircle,
  Building2,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import purchaseService from '../../../services/purchaseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const PurchaseOrderList = () => {
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
      const res = await purchaseService.getOrders({
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
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Approve this purchase order?')) {
      try {
        setActionLoadingId(id);
        await purchaseService.approveOrder(id);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Error approving PO');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleReceiveGoods = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Receive goods against this purchase order? This will increase inventory stock.')) {
      try {
        setActionLoadingId(id);
        await purchaseService.receiveOrder(id);
        alert('Goods received! Inventory stock updated.');
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Error receiving goods');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleCancel = async (id, e) => {
    e.stopPropagation();
    const reason = window.prompt('Cancellation reason:');
    if (reason !== null) {
      try {
        setActionLoadingId(id);
        await purchaseService.cancelOrder(id, reason);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Error cancelling PO');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (!orders.length) return;
    const headers = ['PO #', 'Vendor', 'Date', 'Expected Delivery', 'Grand Total', 'Status'];
    const rows = orders.map((o) => [
      `"${o.po_number || ''}"`,
      `"${o.vendor?.name || ''}"`,
      `"${o.po_date || ''}"`,
      `"${o.expected_delivery_date || ''}"`,
      `"${o.grand_total || 0}"`,
      `"${o.status || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `purchase_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    switch (s) {
      case 'approved':
        return <Badge variant="info">Approved</Badge>;
      case 'received':
      case 'completed':
        return <Badge variant="success">Received</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'pending approval':
      case 'pending_approval':
        return <Badge variant="warning">Pending Approval</Badge>;
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            Purchase Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supplier purchase requisitions, approval matrix, and goods receiving tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button
            variant="teal"
            onClick={() => navigate('/app/purchase/orders/create')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Create Purchase Order
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
              placeholder="Search by PO #, vendor name..."
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
                { value: '', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'pending_approval', label: 'Pending Approval' },
                { value: 'approved', label: 'Approved' },
                { value: 'received', label: 'Received' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              placeholder="All Statuses"
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
                setPage(1);
              }}
              className="gap-1.5 text-xs text-slate-500"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="!overflow-visible border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 dark:text-white">No Purchase Orders Found</p>
            <Button
              variant="teal"
              onClick={() => navigate('/app/purchase/orders/create')}
              className="mt-4"
            >
              Create Purchase Order
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">PO #</th>
                  <th className="px-5 py-3.5">Vendor</th>
                  <th className="px-5 py-3.5">PO Date</th>
                  <th className="px-5 py-3.5">Expected Delivery</th>
                  <th className="px-5 py-3.5 text-right">Grand Total</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((po) => (
                  <tr
                    key={po.id}
                    onClick={() => navigate(`/app/purchase/orders/${po.id}`)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-indigo-600">{po.po_number}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{po.vendor?.name || 'Vendor'}</div>
                      {po.vendor?.company_name && (
                        <div className="text-xs text-slate-400 mt-0.5">{po.vendor.company_name}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{formatDate(po.po_date)}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">{formatDate(po.expected_delivery_date)}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{Number(po.grand_total || po.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">{getStatusBadge(po.status)}</td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {['draft', 'pending_approval'].includes(po.status) && (
                          <button
                            onClick={(e) => handleApprove(po.id, e)}
                            disabled={actionLoadingId === po.id}
                            title="Approve PO"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {po.status === 'approved' && (
                          <button
                            onClick={(e) => handleReceiveGoods(po.id, e)}
                            disabled={actionLoadingId === po.id}
                            title="Receive Goods (Stock Increase)"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}

                        {['draft', 'pending_approval', 'approved'].includes(po.status) && (
                          <button
                            onClick={(e) => handleCancel(po.id, e)}
                            disabled={actionLoadingId === po.id}
                            title="Cancel PO"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/app/purchase/orders/${po.id}`)}
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
              <span className="font-semibold text-slate-900 dark:text-white">{meta.last_page}</span> ({meta.total} POs total)
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

export default PurchaseOrderList;
