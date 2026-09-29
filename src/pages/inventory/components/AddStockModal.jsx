import React, { useState, useEffect } from 'react';
import { X, Plus, Boxes, Warehouse, IndianRupee, FileText } from 'lucide-react';
import inventoryService from '../../../services/inventoryService';

export const AddStockModal = ({ isOpen, onClose, onSuccess, initialProduct = null }) => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    product_id: initialProduct?.id || '',
    warehouse_id: '',
    quantity: 10,
    unit_cost: initialProduct?.cost_price || 1200,
    notes: 'Initial restock via Inventory Dashboard',
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialProduct) {
      setFormData((prev) => ({
        ...prev,
        product_id: initialProduct.id,
        unit_cost: initialProduct.cost_price || initialProduct.unit_price || 1200,
      }));
    }
  }, [initialProduct]);

  const loadDropdowns = async () => {
    try {
      setLoading(true);
      const [prodRes, whRes] = await Promise.all([
        inventoryService.getProducts({ per_page: 100 }),
        inventoryService.getWarehouses(),
      ]);
      setProducts(prodRes?.data?.data || prodRes?.data || []);
      setWarehouses(whRes?.data || []);
      if (whRes?.data && whRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, warehouse_id: whRes.data[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_id || !formData.warehouse_id) {
      setError('Please select both a product and warehouse.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await inventoryService.addStock({
        product_id: Number(formData.product_id),
        warehouse_id: Number(formData.warehouse_id),
        quantity: Number(formData.quantity),
        unit_cost: Number(formData.unit_cost),
        notes: formData.notes,
      });
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add stock. Please verify values.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Stock to Warehouse</h3>
              <p className="text-xs text-slate-500">Record inbound inventory receipt & valuation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product *
            </label>
            <select
              value={formData.product_id}
              onChange={(e) => {
                const prod = products.find((p) => String(p.id) === String(e.target.value));
                setFormData({
                  ...formData,
                  product_id: e.target.value,
                  unit_cost: prod?.cost_price || formData.unit_cost,
                });
              }}
              required
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Warehouse *
            </label>
            <select
              value={formData.warehouse_id}
              onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
              required
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
            >
              <option value="">-- Choose Warehouse --</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.city})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Unit Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity to Add *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Cost (INR) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                required
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Inbound shipment verified by QC"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          {/* Total Valuation Preview */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Calculated Stock Addition Value:</span>
            <span className="text-sm font-bold text-teal-700">
              ₹{((formData.quantity || 0) * (formData.unit_cost || 0)).toLocaleString()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'Adding...' : 'Confirm Stock Addition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;
