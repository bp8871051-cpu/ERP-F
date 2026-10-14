import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft, Plus, Trash2, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';
import warehouseService from '../../services/warehouseService';
import productService from '../../services/productService';
import stockService from '../../services/stockService';

export const StockTransferModal = ({ isOpen, onClose, onSaved }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [reason, setReason] = useState('Inter-depot regional replenishment');
  const [notes, setNotes] = useState('');
  const [autoDispatch, setAutoDispatch] = useState(true);

  const [items, setItems] = useState([
    { product_id: '', available_qty: 0, quantity: 1, notes: '' },
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
      if (whList.length >= 2) {
        setFromWarehouseId(whList[0].id);
        setToWarehouseId(whList[1].id);
      }
      setAllProducts(prdRes.data || []);
    } catch (err) {
      console.error('Failed to load transfer dependencies:', err);
    }
  };

  const handleProductChange = (index, prodId) => {
    const p = allProducts.find((item) => String(item.id) === String(prodId));
    const whStock = p?.stocks?.find((s) => String(s.warehouse_id) === String(fromWarehouseId));
    const avail = whStock ? whStock.available_quantity : 0;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      product_id: prodId,
      available_qty: avail,
      quantity: Math.min(1, avail || 1),
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index, qty) => {
    const q = parseInt(qty, 10) || 1;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity: q,
    };
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { product_id: '', available_qty: 0, quantity: 1, notes: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fromWarehouseId || !toWarehouseId) {
      setError('Please select both source and destination warehouses.');
      return;
    }
    if (String(fromWarehouseId) === String(toWarehouseId)) {
      setError('Source and destination warehouse cannot be the same.');
      return;
    }

    const validItems = items.filter((it) => it.product_id);
    if (validItems.length === 0) {
      setError('Please select at least one product to transfer.');
      return;
    }

    for (const it of validItems) {
      if (it.quantity <= 0) {
        setError('Transfer quantity must be greater than zero.');
        return;
      }
      if (it.quantity > it.available_qty) {
        const prod = allProducts.find((p) => String(p.id) === String(it.product_id));
        setError(`Insufficient available stock for '${prod?.name || 'Product'}'. Available: ${it.available_qty}, Requested: ${it.quantity}`);
        return;
      }
    }

    try {
      setLoading(true);
      await stockService.createTransfer({
        from_warehouse_id: fromWarehouseId,
        to_warehouse_id: toWarehouseId,
        reason,
        notes,
        auto_dispatch: autoDispatch,
        items: validItems.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          notes: it.notes,
        })),
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving transfer:', err);
      setError(err.response?.data?.message || 'Failed to submit stock transfer.');
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
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Initiate Stock Transfer</h3>
                <p className="text-xs text-slate-500">Relocate inventory between depots and regional warehouses.</p>
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

            {/* Warehouse selectors with visual arrow */}
            <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Warehouse <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))}
                  value={fromWarehouseId}
                  onChange={(val) => setFromWarehouseId(val)}
                  placeholder="Select Origin"
                />
              </div>

              <div className="flex justify-center items-center py-2 md:py-0">
                <div className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Warehouse <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))}
                  value={toWarehouseId}
                  onChange={(val) => setToWarehouseId(val)}
                  placeholder="Select Destination"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Justification <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Inter-depot stock replenishment"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                required
              />
            </div>

            {/* Line Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Transfer Products</h4>
                <Button variant="secondary" size="xs" type="button" icon={Plus} onClick={addItemRow}>
                  Add Product
                </Button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-visible">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5 w-28 text-right">Available</th>
                      <th className="p-2.5 w-28 text-right">Transfer Qty</th>
                      <th className="p-2.5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <SearchableSelect
                            options={allProducts.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                            value={row.product_id}
                            onChange={(val) => handleProductChange(idx, val)}
                            placeholder="Select a product..."
                          />
                        </td>
                        <td className="p-2 text-right font-medium text-slate-600">
                          {row.available_qty}
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            min="1"
                            max={row.available_qty || undefined}
                            value={row.quantity}
                            onChange={(e) => handleQuantityChange(idx, e.target.value)}
                            className="w-full text-right text-xs px-2 py-1 border border-slate-200 rounded focus:outline-teal-600 font-semibold"
                            required
                          />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Logistics / Courier Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include shipping bill number, carrier name, or vehicle number..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoDispatch"
                checked={autoDispatch}
                onChange={(e) => setAutoDispatch(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="autoDispatch" className="text-xs font-medium text-slate-700 cursor-pointer">
                Immediately dispatch from origin (deduct from source warehouse and mark In-Transit)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="teal" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : autoDispatch ? 'Dispatch Transfer' : 'Save as Draft'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StockTransferModal;
