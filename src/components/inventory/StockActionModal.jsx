import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownRight, ArrowUpRight, PlusCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import warehouseService from '../../services/warehouseService';
import productService from '../../services/productService';
import stockService from '../../services/stockService';

export const StockActionModal = ({
  isOpen,
  onClose,
  onSaved,
  actionType = 'receive', // 'receive' | 'issue' | 'opening'
  initialProductId = '',
  initialWarehouseId = '',
}) => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouseId, setWarehouseId] = useState(initialWarehouseId);
  const [productId, setProductId] = useState(initialProductId);
  const [quantity, setQuantity] = useState(10);
  const [unitCost, setUnitCost] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setProductId(initialProductId);
      setWarehouseId(initialWarehouseId);
      setQuantity(10);
      setNotes('');
      loadDropdowns(initialProductId, initialWarehouseId);
      setReference(
        (actionType === 'receive' ? 'RCV-' : actionType === 'issue' ? 'ISS-' : 'OPN-') +
          Math.floor(1000 + Math.random() * 9000)
      );
    }
  }, [isOpen, actionType, initialProductId, initialWarehouseId]);

  const loadDropdowns = async (currentProductId, currentWarehouseId) => {
    try {
      const [whRes, prdRes] = await Promise.all([
        warehouseService.getWarehouses(),
        productService.getProducts({ per_page: 100 }),
      ]);
      setWarehouses(whRes.data || []);
      if (!currentWarehouseId && whRes.data?.length > 0) {
        setWarehouseId(whRes.data[0].id);
      }
      setProducts(prdRes.data || []);
      if (!currentProductId && prdRes.data?.length > 0) {
        setProductId(prdRes.data[0].id);
        setUnitCost(prdRes.data[0].purchase_price ?? prdRes.data[0].cost_price ?? '');
      } else if (currentProductId && prdRes.data?.length > 0) {
        const p = prdRes.data.find(prod => String(prod.id) === String(currentProductId));
        if (p) setUnitCost(p.purchase_price ?? p.cost_price ?? '');
      }
    } catch (err) {
      console.error('Failed to load modal dependencies:', err);
    }
  };

  const handleProductSelect = (id) => {
    setProductId(id);
    const p = products.find((prod) => String(prod.id) === String(id));
    if (p) {
      setUnitCost(p.purchase_price ?? p.cost_price ?? '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!productId) {
      setError('Please select a product.');
      return;
    }
    if (!warehouseId) {
      setError('Please select a warehouse.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        product_id: productId,
        warehouse_id: warehouseId,
        quantity: parseInt(quantity, 10),
        unit_cost: parseFloat(unitCost) || 0,
        reference,
        notes,
      };

      if (actionType === 'receive') {
        await stockService.receiveStock(payload);
      } else if (actionType === 'issue') {
        await stockService.issueStock(payload);
      } else {
        await stockService.addOpeningStock(payload);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Stock action error:', err);
      setError(err.response?.data?.message || 'Failed to process stock action.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title =
    actionType === 'receive'
      ? 'Receive Stock / Inbound Goods'
      : actionType === 'issue'
      ? 'Issue Stock / Outbound'
      : 'Initial Opening Stock Entry';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  actionType === 'receive'
                    ? 'bg-emerald-100 text-emerald-600'
                    : actionType === 'issue'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-teal-100 text-teal-600'
                }`}
              >
                {actionType === 'receive' ? (
                  <ArrowDownRight className="w-5 h-5" />
                ) : actionType === 'issue' ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product <span className="text-rose-500">*</span>
              </label>
              <select
                value={productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
                required
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Warehouse <span className="text-rose-500">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
                required
              >
                <option value="">Select Warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 font-semibold"
                  required
                />
              </div>

              {actionType !== 'issue' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reference Number</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PO-9812 or SO-4421"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional comments or batch reference..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'issue' ? 'danger' : 'teal'}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Processing...' : actionType === 'issue' ? 'Deduct Stock' : 'Add Stock'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StockActionModal;
