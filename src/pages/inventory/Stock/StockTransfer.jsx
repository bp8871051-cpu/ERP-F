import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import stockService from '../../../services/stockService';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import StockTransferModal from '../../../components/inventory/StockTransferModal';

export const StockTransfer = () => {
  const [transfers, setTransfers] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [warehouses, setWarehouses] = useState([]);

  // Modals & detail view
  const [showModal, setShowModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [search, fromWarehouseId, toWarehouseId, status, page]);

  const loadWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res = await stockService.getTransfers({
        search,
        from_warehouse_id: fromWarehouseId || undefined,
        to_warehouse_id: toWarehouseId || undefined,
        status: status || undefined,
        page,
        per_page: 15,
      });
      setTransfers(res.data || []);
      setMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching stock transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (id) => {
    try {
      setActionLoading(true);
      await stockService.dispatchTransfer(id);
      fetchTransfers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch transfer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceive = async (id) => {
    try {
      setActionLoading(true);
      await stockService.receiveTransfer(id);
      fetchTransfers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark transfer as received.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      setActionLoading(true);
      await stockService.cancelTransfer(id);
      fetchTransfers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel transfer.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    const norm = String(st || '').toLowerCase();
    if (norm === 'received') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (norm === 'in_transit') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (norm === 'cancelled') {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (norm === 'pending') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-teal-600" />
            Stock Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Depot-to-depot inter-facility stock shipments, in-transit auditing, and automated receipt updates.
          </p>
        </div>

        <Button variant="teal" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
          New Transfer
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3.5 shadow-sm border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transfer number or reason..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
            />
          </div>

          <select
            value={fromWarehouseId}
            onChange={(e) => {
              setFromWarehouseId(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white text-slate-700 min-w-[140px]"
          >
            <option value="">Origin Warehouse</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                From: {w.name}
              </option>
            ))}
          </select>

          <select
            value={toWarehouseId}
            onChange={(e) => {
              setToWarehouseId(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white text-slate-700 min-w-[140px]"
          >
            <option value="">Destination Warehouse</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                To: {w.name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_transit">In Transit</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {(search || fromWarehouseId || toWarehouseId || status) && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setSearch('');
                setFromWarehouseId('');
                setToWarehouseId('');
                setStatus('');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Transfers Table Card */}
      <Card className="overflow-hidden shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Transfer #</th>
                <th className="p-3">Origin Warehouse</th>
                <th className="p-3"></th>
                <th className="p-3">Destination Warehouse</th>
                <th className="p-3">Reason</th>
                <th className="p-3 text-center">Items Count</th>
                <th className="p-3">Date</th>
                <th className="p-3">Transfer Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                      <span>Loading stock transfers...</span>
                    </div>
                  </td>
                </tr>
              ) : transfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No stock transfers found.
                  </td>
                </tr>
              ) : (
                transfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{tr.transfer_number}</td>
                    <td className="p-3 text-slate-700 font-medium">
                      {tr.from_warehouse?.name || 'Origin Depot'}
                    </td>
                    <td className="p-3 text-slate-400 w-6">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {tr.to_warehouse?.name || 'Destination Depot'}
                    </td>
                    <td className="p-3 text-slate-600 max-w-[200px] truncate">{tr.reason}</td>
                    <td className="p-3 text-center font-bold text-slate-800">
                      {tr.items?.length ?? 1}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {tr.created_at ? new Date(tr.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                          tr.status
                        )}`}
                      >
                        {tr.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="View Details"
                          onClick={() => setSelectedTransfer(tr)}
                          className="p-1 text-slate-400 hover:text-teal-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {tr.status === 'draft' || tr.status === 'pending' ? (
                          <button
                            title="Dispatch Shipment"
                            onClick={() => handleDispatch(tr.id)}
                            disabled={actionLoading}
                            className="p-1 text-slate-400 hover:text-blue-600"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        ) : null}
                        {tr.status === 'in_transit' ? (
                          <button
                            title="Confirm Receipt at Destination"
                            onClick={() => handleReceive(tr.id)}
                            disabled={actionLoading}
                            className="p-1 text-slate-400 hover:text-emerald-600"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : null}
                        {tr.status !== 'received' && tr.status !== 'cancelled' ? (
                          <button
                            title="Cancel Transfer"
                            onClick={() => handleCancel(tr.id)}
                            disabled={actionLoading}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50/60 border-t border-slate-200/80 text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {transfers.length > 0 ? (page - 1) * 15 + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(page * 15, meta.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{meta.total}</span> transfers
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="px-2 font-semibold">
              Page {page} of {meta.last_page || 1}
            </span>
            <Button
              variant="secondary"
              size="xs"
              disabled={page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Transfer Modal */}
      <StockTransferModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={fetchTransfers}
      />

      {/* Detail Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Transfer Details: {selectedTransfer.transfer_number}
                </h3>
                <p className="text-xs text-slate-500">
                  Route: {selectedTransfer.from_warehouse?.name} &rarr; {selectedTransfer.to_warehouse?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div><span className="font-semibold text-slate-600">Reason:</span> {selectedTransfer.reason}</div>
              {selectedTransfer.notes && <div><span className="font-semibold text-slate-600">Notes:</span> {selectedTransfer.notes}</div>}
              <div><span className="font-semibold text-slate-600">Status:</span> <span className="uppercase font-bold">{selectedTransfer.status}</span></div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5 text-right">Transfer Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedTransfer.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-medium text-slate-900">{item.product?.name || `Product #${item.product_id}`}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedTransfer(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTransfer;
