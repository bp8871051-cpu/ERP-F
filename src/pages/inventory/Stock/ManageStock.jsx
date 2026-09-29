import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Sliders,
  ArrowRightLeft,
  History,
  Eye,
  Warehouse,
  RefreshCw,
} from 'lucide-react';
import stockService from '../../../services/stockService';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import StockStatusBadge from '../../../components/inventory/StockStatusBadge';
import StockActionModal from '../../../components/inventory/StockActionModal';
import StockAdjustmentModal from '../../../components/inventory/StockAdjustmentModal';
import StockTransferModal from '../../../components/inventory/StockTransferModal';

export const ManageStock = () => {
  const [stocks, setStocks] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [warehouses, setWarehouses] = useState([]);

  // Modals
  const [showStockAction, setShowStockAction] = useState(false);
  const [stockActionType, setStockActionType] = useState('receive');
  const [selectedStock, setSelectedStock] = useState(null);

  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [search, warehouseId, status, page]);

  const loadWarehouses = async () => {
    try {
      const res = await warehouseService.getWarehouses();
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await stockService.getStocks({
        search,
        warehouse_id: warehouseId || undefined,
        status: status || undefined,
        page,
        per_page: 20,
      });
      setStocks(res.data || []);
      setMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching stock levels:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-teal-600" />
            Manage Depot Stock
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-depot stock levels, allocated reservations, damaged goods, and inventory ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowDownRight}
            onClick={() => {
              setSelectedStock(null);
              setStockActionType('receive');
              setShowStockAction(true);
            }}
          >
            Receive Stock
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowUpRight}
            onClick={() => {
              setSelectedStock(null);
              setStockActionType('issue');
              setShowStockAction(true);
            }}
          >
            Issue Stock
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Sliders}
            onClick={() => setShowAdjustmentModal(true)}
          >
            Stock Adjustment
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={ArrowRightLeft}
            onClick={() => setShowTransferModal(true)}
          >
            Stock Transfer
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3.5 shadow-sm border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, or barcode..."
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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white text-slate-700"
          >
            <option value="">All Health Statuses</option>
            <option value="healthy">Healthy Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

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

      {/* Stock Table Card */}
      <Card className="overflow-hidden shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Warehouse Depot</th>
                <th className="p-3 text-right">Available</th>
                <th className="p-3 text-right">Reserved</th>
                <th className="p-3 text-right">Damaged</th>
                <th className="p-3 text-right">Total Units</th>
                <th className="p-3 text-right">Stock Value</th>
                <th className="p-3">Health Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                      <span>Loading multi-warehouse inventory levels...</span>
                    </div>
                  </td>
                </tr>
              ) : stocks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No stock inventory found matching your criteria.
                  </td>
                </tr>
              ) : (
                stocks.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 max-w-[200px] truncate">
                      <NavLink
                        to={`/app/inventory/products/${s.product_id}`}
                        className="hover:text-teal-600 hover:underline"
                      >
                        {s.product?.name || 'Product'}
                      </NavLink>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{s.product?.sku}</td>
                    <td className="p-3 text-slate-600 font-medium">
                      {s.warehouse?.name || 'Central Facility'}
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-600">
                      {s.available_quantity}
                    </td>
                    <td className="p-3 text-right text-slate-500 font-medium">
                      {s.reserved_quantity || 0}
                    </td>
                    <td className="p-3 text-right text-slate-400 font-medium">
                      {s.damaged_quantity || 0}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {s.quantity}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        {s.product?.unit?.short_name || 'units'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatCurrency(s.stock_value)}
                    </td>
                    <td className="p-3">
                      <StockStatusBadge status={s.status} />
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Quick Receive"
                          onClick={() => {
                            setSelectedStock(s);
                            setStockActionType('receive');
                            setShowStockAction(true);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                        >
                          <ArrowDownRight className="w-4 h-4" />
                        </button>
                        <button
                          title="Quick Issue"
                          onClick={() => {
                            setSelectedStock(s);
                            setStockActionType('issue');
                            setShowStockAction(true);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <NavLink
                          to={`/app/inventory/products/${s.product_id}/stock-history`}
                          title="View Ledger"
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </NavLink>
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
              {stocks.length > 0 ? (page - 1) * 20 + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(page * 20, meta.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{meta.total}</span> stock rows
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

      {/* Stock Quick Action Modal */}
      <StockActionModal
        isOpen={showStockAction}
        onClose={() => {
          setShowStockAction(false);
          setSelectedStock(null);
        }}
        onSaved={fetchStocks}
        actionType={stockActionType}
        initialProductId={selectedStock?.product_id || ''}
        initialWarehouseId={selectedStock?.warehouse_id || ''}
      />

      <StockAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onSaved={fetchStocks}
      />

      <StockTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSaved={fetchStocks}
      />
    </div>
  );
};

export default ManageStock;
