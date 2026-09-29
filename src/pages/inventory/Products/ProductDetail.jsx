import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  DollarSign,
  Boxes,
  Warehouse,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  Tag,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import productService from '../../../services/productService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import StockStatusBadge from '../../../components/inventory/StockStatusBadge';
import StockActionModal from '../../../components/inventory/StockActionModal';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Action Modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('receive');

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getProduct(id);
      setProduct(res.data);
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!product) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-3">
        <p>Product record not found.</p>
        <Button variant="secondary" onClick={() => navigate('/app/inventory/products')}>
          Back to Products Catalog
        </Button>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/app/inventory/products')}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
              <StockStatusBadge status={product.stock_status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              SKU: <span className="font-mono font-bold text-slate-700">{product.sku}</span> | Category:{' '}
              {product.category?.name || 'General'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowDownRight}
            onClick={() => {
              setActionType('receive');
              setShowActionModal(true);
            }}
          >
            Receive Stock
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowUpRight}
            onClick={() => {
              setActionType('issue');
              setShowActionModal(true);
            }}
          >
            Issue Stock
          </Button>
          <NavLink
            to={`/app/inventory/products/${product.id}/stock-history`}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-xs"
          >
            <History className="w-3.5 h-3.5" /> Full Stock Ledger
          </NavLink>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Available Stock</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{product.available_stock}</span>
            <span className="text-xs text-slate-400 font-medium">{product.unit?.short_name || 'units'}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Ready for fulfillment</span>
        </Card>

        <Card className="p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Stock</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{product.total_stock}</span>
            <span className="text-xs text-slate-400 font-medium">{product.unit?.short_name || 'units'}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Across all depots</span>
        </Card>

        <Card className="p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Selling Price</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-teal-600">{formatCurrency(product.selling_price)}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Cost: {formatCurrency(product.purchase_price ?? product.cost_price)}
          </span>
        </Card>

        <Card className="p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Inventory Value</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-indigo-600">
              {formatCurrency(product.total_stock * (product.purchase_price ?? product.cost_price ?? 0))}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">At purchase cost</span>
        </Card>
      </div>

      {/* Two Column Layout: Specifications + Warehouse Stock Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specifications */}
        <Card className="p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-teal-600" />
            Product Details & Attributes
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">SKU:</span>
              <span className="font-mono font-bold text-slate-900">{product.sku}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Barcode:</span>
              <span className="font-mono text-slate-800">{product.barcode || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Product Code:</span>
              <span className="text-slate-800">{product.product_code || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Category:</span>
              <span className="text-slate-800 font-medium">{product.category?.name || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Brand:</span>
              <span className="text-slate-800 font-medium">{product.brand?.name || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Unit:</span>
              <span className="text-slate-800 font-medium">
                {product.unit?.name} ({product.unit?.short_name})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Alert Stock Level:</span>
              <span className="text-slate-800 font-semibold">{product.minimum_stock ?? 10}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Reorder Level:</span>
              <span className="text-slate-800 font-semibold">{product.reorder_level ?? 20}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Tax Rate:</span>
              <span className="text-slate-800 font-semibold">
                {product.tax_rate}% ({product.tax_type})
              </span>
            </div>
          </div>

          {product.description && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Description:</span>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                {product.description}
              </p>
            </div>
          )}
        </Card>

        {/* Warehouse Stock Breakdown */}
        <Card className="lg:col-span-2 p-5 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
            <Warehouse className="w-4 h-4 text-indigo-600" />
            Stock Inventory by Warehouse
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Warehouse Depot</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5 text-right">Available</th>
                  <th className="p-2.5 text-right">Reserved</th>
                  <th className="p-2.5 text-right">Total Units</th>
                  <th className="p-2.5 text-right">Depot Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!product.stocks || product.stocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No stock records allocated in any warehouse yet.
                    </td>
                  </tr>
                ) : (
                  product.stocks.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-semibold text-slate-900">
                        {s.warehouse?.name || 'Central Warehouse'}
                      </td>
                      <td className="p-2.5 text-slate-500">
                        {s.warehouse?.city ? `${s.warehouse.city}, ${s.warehouse.state}` : 'Main Facility'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-600">
                        {s.available_quantity}
                      </td>
                      <td className="p-2.5 text-right text-slate-500">
                        {s.reserved_quantity || 0}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {s.quantity}
                      </td>
                      <td className="p-2.5 text-right font-medium text-slate-700">
                        {formatCurrency(s.quantity * (product.purchase_price ?? product.cost_price ?? 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Recent Stock Movement Ledger Preview */}
      <Card className="p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              Latest Stock Movements
            </h3>
            <p className="text-xs text-slate-500">Recent audit ledger entries for this SKU</p>
          </div>

          <NavLink
            to={`/app/inventory/products/${product.id}/stock-history`}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            View Full Ledger &rarr;
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Reference #</th>
                <th className="p-2.5">Warehouse</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5 text-right">In</th>
                <th className="p-2.5 text-right">Out</th>
                <th className="p-2.5 text-right">Balance</th>
                <th className="p-2.5">Authorized By</th>
                <th className="p-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!product.movements || product.movements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-400">
                    No movements recorded for this product yet.
                  </td>
                </tr>
              ) : (
                product.movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono font-bold text-slate-800">
                      {m.reference || `SM-${m.id}`}
                    </td>
                    <td className="p-2.5 text-slate-700 font-medium">
                      {m.warehouse?.name || 'Warehouse'}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.type === 'in'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {m.movement_type || m.type}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-600">
                      {m.quantity_in > 0 ? `+${m.quantity_in}` : '—'}
                    </td>
                    <td className="p-2.5 text-right font-bold text-rose-600">
                      {m.quantity_out > 0 ? `-${m.quantity_out}` : '—'}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {m.balance_quantity}
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {m.creator?.name || 'System Admin'}
                    </td>
                    <td className="p-2.5 text-slate-400 text-[11px]">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stock Quick Action Modal */}
      <StockActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onSaved={fetchProduct}
        actionType={actionType}
        initialProductId={product.id}
      />
    </div>
  );
};

export default ProductDetail;
