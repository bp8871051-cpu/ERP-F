import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import warehouseService from '../../services/warehouseService';
import productService from '../../services/productService';
import stockService from '../../services/stockService';

export const StockAdjustmentModal = ({ isOpen, onClose, onSaved }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [warehouseId, setWarehouseId] = useState('');
  const [reason, setReason] = useState('Quarterly Physical Stock Count Reconciliation');
  const [notes, setNotes] = useState('');
  const [autoApply, setAutoApply] = useState(true);

  const [items, setItems] = useState([
    { product_id: '', system_quantity: 0, actual_quantity: 0, difference: 0, unit_cost: 0, notes: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen]);

  const loadDependencies = async () => {
    try {
      const [whRes, prdRes] = await Promise.all([
        warehouseService.getWarehouses(),
        productService.getProducts({ per_page: 100 }),
      ]);
      const whList = whRes.data || [];
      setWarehouses(whList);
      if (whList.length > 0 && !warehouseId) {
        setWarehouseId(whList[0].id);
      }
      setAllProducts(prdRes.data || []);
    } catch (err) {
      console.error('Failed to load adjustment dependencies:', err);
    }
  };

  const handleProductChange = (index, prodId) => {
    const p = allProducts.find((item) => String(item.id) === String(prodId));
    const whStock = p?.stocks?.find((s) => String(s.warehouse_id) === String(warehouseId));
    const sysQty = whStock ? whStock.available_quantity : (p?.total_stock || 0);
    const cost = p?.purchase_price ?? p?.cost_price ?? 0;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      product_id: prodId,
      system_quantity: sysQty,
      actual_quantity: sysQty,
      difference: 0,
      unit_cost: cost,
    };
    setItems(newItems);
  };

  const handleActualQtyChange = (index, actual) => {
    const act = parseInt(actual, 10) || 0;
    const newItems = [...items];
    const diff = act - (newItems[index].system_quantity || 0);
    newItems[index] = {
      ...newItems[index],
      actual_quantity: act,
      difference: diff,
    };
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { product_id: '', system_quantity: 0, actual_quantity: 0, difference: 0, unit_cost: 0, notes: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!warehouseId) {
      setError('Please select a warehouse.');
      return;
    }

    const validItems = items.filter((it) => it.product_id);
    if (validItems.length === 0) {
      setError('Please select at least one product to adjust.');
      return;
    }

    try {
      setLoading(true);
      await stockService.createAdjustment({
        warehouse_id: warehouseId,
        reason,
        notes,
        auto_apply: autoApply,
        items: validItems.map((it) => ({
          product_id: it.product_id,
          system_quantity: it.system_quantity,
          actual_quantity: it.actual_quantity,
          unit_cost: it.unit_cost,
          notes: it.notes,
        })),
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving adjustment:', err);
      setError(err.response?.data?.message || 'Failed to submit stock adjustment.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Stock Adjustment</h3>
                <p className="text-xs text-slate-500">Correct physical inventory variances against system stock.</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Adjustment <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Physical inventory count audit"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Adjustment Line Items</h4>
                <Button variant="secondary" size="xs" type="button" icon={Plus} onClick={addItemRow}>
                  Add Item
                </Button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5 w-24 text-right">System Qty</th>
                      <th className="p-2.5 w-28 text-right">Physical Qty</th>
                      <th className="p-2.5 w-24 text-right">Variance</th>
                      <th className="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <select
                            value={row.product_id}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:outline-teal-600 bg-white"
                            required
                          >
                            <option value="">Select a product...</option>
                            {allProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 text-right font-medium text-slate-600">
                          {row.system_quantity}
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            min="0"
                            value={row.actual_quantity}
                            onChange={(e) => handleActualQtyChange(idx, e.target.value)}
                            className="w-full text-right text-xs px-2 py-1 border border-slate-200 rounded focus:outline-teal-600 font-semibold"
                            required
                          />
                        </td>
                        <td className="p-2 text-right font-bold">
                          <span
                            className={
                              row.difference > 0
                                ? 'text-emerald-600'
                                : row.difference < 0
                                ? 'text-rose-600'
                                : 'text-slate-400'
                            }
                          >
                            {row.difference > 0 ? `+${row.difference}` : row.difference}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            disabled={items.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Notes / Explanation</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include reference barcode batch numbers or auditor remarks..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoApply"
                checked={autoApply}
                onChange={(e) => setAutoApply(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="autoApply" className="text-xs font-medium text-slate-700 cursor-pointer">
                Immediately approve and apply inventory balance changes
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="teal" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : autoApply ? 'Apply Adjustment' : 'Save as Pending'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StockAdjustmentModal;
