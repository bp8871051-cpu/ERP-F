import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Search, Filter, CheckCircle2, XCircle, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import stockService from '../../../services/stockService';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import StockAdjustmentModal from '../../../components/inventory/StockAdjustmentModal';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const StockAdjustment = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [warehouses, setWarehouses] = useState([]);

  // Modals & view
  const [showModal, setShowModal] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    fetchAdjustments();
  }, [search, warehouseId, status, page]);

  const loadWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const res = await stockService.getAdjustments({
        search,
        warehouse_id: warehouseId || undefined,
        status: status || undefined,
        page,
        per_page: 15,
      });
      setAdjustments(res.data || []);
      setMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching stock adjustments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await stockService.approveAdjustment(id);
      fetchAdjustments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve adjustment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      await stockService.rejectAdjustment(id);
      fetchAdjustments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject adjustment.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-teal-600" />
            Stock Adjustments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical stock count reconciliation, damage write-offs, and shrinkage corrections with audit verification.
          </p>
        </div>

        <Button variant="teal" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
          New Adjustment
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3.5 shadow-sm border border-slate-200/80 !overflow-visible">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference number or reason..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
            />
          </div>

          <div className="w-56">
            <SearchableSelect
              options={[
                { value: '', label: 'All Warehouses' },
                ...warehouses.map((w) => ({ value: String(w.id), label: w.name }))
              ]}
              value={String(warehouseId)}
              onChange={(val) => {
                setWarehouseId(val);
                setPage(1);
              }}
              placeholder="All Warehouses"
            />
          </div>

          <div className="w-48">
            <SearchableSelect
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'pending', label: 'Pending Approval' },
                { value: 'applied', label: 'Applied / Approved' },
                { value: 'rejected', label: 'Rejected' }
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

          {(search || warehouseId || status) && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setSearch('');
                setWarehouseId('');
                setStatus('');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Adjustments Table */}
      <Card className="overflow-hidden shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Reference #</th>
                <th className="p-3">Warehouse Depot</th>
                <th className="p-3">Adjustment Reason</th>
                <th className="p-3 text-center">Items Count</th>
                <th className="p-3">Created By</th>
                <th className="p-3">Date</th>
                <th className="p-3">Approval Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                      <span>Loading stock adjustments...</span>
                    </div>
                  </td>
                </tr>
              ) : adjustments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No stock adjustments found.
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">{adj.reference_number}</td>
                    <td className="p-3 text-slate-700 font-medium">
                      {adj.warehouse?.name || 'Warehouse Depot'}
                    </td>
                    <td className="p-3 text-slate-600 max-w-[220px] truncate">{adj.reason}</td>
                    <td className="p-3 text-center font-bold text-slate-800">
                      {adj.items?.length ?? 1}
                    </td>
                    <td className="p-3 text-slate-600">{adj.creator?.name || 'Admin'}</td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {adj.created_at ? new Date(adj.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          adj.status === 'applied' || adj.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : adj.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : adj.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {adj.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          title="View Details"
                          onClick={() => setSelectedAdjustment(adj)}
                          className="p-1 text-slate-400 hover:text-teal-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {adj.status === 'pending' && (
                          <>
                            <button
                              title="Approve & Apply"
                              onClick={() => handleApprove(adj.id)}
                              disabled={actionLoading}
                              className="p-1 text-slate-400 hover:text-emerald-600"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              title="Reject"
                              onClick={() => handleReject(adj.id)}
                              disabled={actionLoading}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
              {adjustments.length > 0 ? (page - 1) * 15 + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(page * 15, meta.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{meta.total}</span> adjustments
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

      {/* Create Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={fetchAdjustments}
      />

      {/* Selected Adjustment Details Modal */}
      {selectedAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Adjustment Details: {selectedAdjustment.reference_number}
                </h3>
                <p className="text-xs text-slate-500">Warehouse: {selectedAdjustment.warehouse?.name}</p>
              </div>
              <button
                onClick={() => setSelectedAdjustment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div><span className="font-semibold text-slate-600">Reason:</span> {selectedAdjustment.reason}</div>
              {selectedAdjustment.notes && <div><span className="font-semibold text-slate-600">Notes:</span> {selectedAdjustment.notes}</div>}
              <div><span className="font-semibold text-slate-600">Status:</span> <span className="uppercase font-bold">{selectedAdjustment.status}</span></div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5 text-right">System Qty</th>
                    <th className="p-2.5 text-right">Counted Qty</th>
                    <th className="p-2.5 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedAdjustment.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-medium text-slate-900">{item.product?.name || `Product #${item.product_id}`}</td>
                      <td className="p-2.5 text-right text-slate-600">{item.system_quantity}</td>
                      <td className="p-2.5 text-right font-semibold text-slate-800">{item.actual_quantity}</td>
                      <td className="p-2.5 text-right font-bold">
                        <span className={item.difference > 0 ? 'text-emerald-600' : item.difference < 0 ? 'text-rose-600' : 'text-slate-500'}>
                          {item.difference > 0 ? `+${item.difference}` : item.difference}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedAdjustment(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAdjustment;
