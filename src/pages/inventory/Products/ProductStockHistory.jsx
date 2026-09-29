import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { History, ArrowLeft, Search, Filter, Download, Warehouse, RefreshCw } from 'lucide-react';
import productService from '../../../services/productService';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const ProductStockHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [warehouseId, setWarehouseId] = useState('');
  const [movementType, setMovementType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [id, warehouseId, movementType, search, page]);

  const loadWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await productService.getStockHistory(id, {
        warehouse_id: warehouseId || undefined,
        movement_type: movementType || undefined,
        search: search || undefined,
        page,
        per_page: 20,
      });
      setProduct(res.product);
      setMovements(res.data || []);
      setMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching stock history:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (movements.length === 0) return;
    const headers = ['Date', 'Reference', 'Warehouse', 'Movement Type', 'Qty In', 'Qty Out', 'Balance', 'User', 'Notes'];
    const rows = movements.map((m) => [
      m.created_at ? new Date(m.created_at).toLocaleString() : '',
      m.reference || `SM-${m.id}`,
      m.warehouse?.name || '',
      m.movement_type || m.type || '',
      m.quantity_in || 0,
      m.quantity_out || 0,
      m.balance_quantity || 0,
      m.creator?.name || 'System',
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stock_history_${product?.sku || id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(`/app/inventory/products/${id}`)}
          >
            Back to Product
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-teal-600" />
              Stock Ledger & Movement History
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Product: <span className="font-bold text-slate-800">{product?.name || 'Loading...'}</span> (
              <span className="font-mono font-bold text-slate-700">{product?.sku}</span>) | Total Units:{' '}
              <span className="font-bold text-teal-700">{product?.total_stock ?? 0}</span>
            </p>
          </div>
        </div>

        <Button variant="secondary" size="sm" icon={Download} onClick={exportCsv} disabled={movements.length === 0}>
          Export CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3.5 shadow-sm border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference number or notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
            />
          </div>

          <select
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white text-slate-700 min-w-[140px]"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            value={movementType}
            onChange={(e) => {
              setMovementType(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white text-slate-700"
          >
            <option value="">All Movement Types</option>
            <option value="opening">Opening Stock</option>
            <option value="purchase">Purchase / Receipt</option>
            <option value="sale">Sale / Issue</option>
            <option value="adjustment">Stock Adjustment</option>
            <option value="transfer_in">Transfer In</option>
            <option value="transfer_out">Transfer Out</option>
          </select>

          {(search || warehouseId || movementType) && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setSearch('');
                setWarehouseId('');
                setMovementType('');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Ledger Table */}
      <Card className="overflow-hidden shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Reference #</th>
                <th className="p-3">Warehouse Depot</th>
                <th className="p-3">Movement Type</th>
                <th className="p-3 text-right">Qty In</th>
                <th className="p-3 text-right">Qty Out</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3">Audited By</th>
                <th className="p-3">Transaction Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                      <span>Loading ledger audit history...</span>
                    </div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No movement records found for this product.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {m.created_at ? new Date(m.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {m.reference || `SM-${m.id}`}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      {m.warehouse?.name || 'Warehouse'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.type === 'in' || m.movement_type === 'purchase'
                            ? 'bg-emerald-100 text-emerald-700'
                            : m.type === 'out' || m.movement_type === 'sale'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {m.movement_type || m.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      {m.quantity_in > 0 ? `+${m.quantity_in}` : '—'}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-600">
                      {m.quantity_out > 0 ? `-${m.quantity_out}` : '—'}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {m.balance_quantity}
                    </td>
                    <td className="p-3 text-slate-600">
                      {m.creator?.name || 'System Admin'}
                    </td>
                    <td className="p-3 text-slate-500 truncate max-w-[200px]">
                      {m.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50/60 border-t border-slate-200/80 text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {movements.length > 0 ? (page - 1) * 20 + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(page * 20, meta.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{meta.total}</span> movements
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
    </div>
  );
};

export default ProductStockHistory;
