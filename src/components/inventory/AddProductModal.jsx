import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, DollarSign, Layers, Boxes, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';
import categoryService from '../../services/categoryService';
import brandService from '../../services/brandService';
import unitService from '../../services/unitService';
import warehouseService from '../../services/warehouseService';

export const AddProductModal = ({
  isOpen,
  onClose,
  onSaved,
  product = null, // if passed, we are in Edit mode
}) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    product_code: '',
    category_id: '',
    brand_id: '',
    unit_id: '',
    default_warehouse_id: '',
    purchase_price: '',
    selling_price: '',
    mrp: '',
    discount: '0',
    tax_rate: '18',
    tax_type: 'exclusive',
    opening_stock: '0',
    minimum_stock: '10',
    maximum_stock: '500',
    reorder_level: '20',
    track_inventory: true,
    status: 'active',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (product) {
        setFormData({
          name: product.name || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          product_code: product.product_code || '',
          category_id: product.category_id || '',
          brand_id: product.brand_id || '',
          unit_id: product.unit_id || '',
          default_warehouse_id: product.default_warehouse_id || '',
          purchase_price: product.purchase_price ?? product.cost_price ?? '',
          selling_price: product.selling_price || '',
          mrp: product.mrp || '',
          discount: product.discount ?? '0',
          tax_rate: product.tax_rate ?? '18',
          tax_type: product.tax_type || 'exclusive',
          opening_stock: '0',
          minimum_stock: product.minimum_stock ?? product.alert_quantity ?? '10',
          maximum_stock: product.maximum_stock ?? '500',
          reorder_level: product.reorder_level ?? '20',
          track_inventory: product.track_inventory ?? true,
          status: product.status || 'active',
          description: product.description || '',
        });
      } else {
        // Auto-generate SKU
        const autoSku = 'PRD-' + Math.floor(1000 + Math.random() * 9000);
        setFormData((prev) => ({ ...prev, sku: autoSku }));
      }
    }
  }, [isOpen, product]);

  const loadDropdowns = async () => {
    try {
      const [catRes, brandRes, unitRes, whRes] = await Promise.all([
        categoryService.getCategories(),
        brandService.getBrands(),
        unitService.getUnits(),
        warehouseService.getWarehouses(),
      ]);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
      setUnits(unitRes.data || []);
      setWarehouses(whRes.data || []);
    } catch (err) {
      console.error('Error loading product form dependencies:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (!formData.sku.trim()) {
      setError('SKU is required.');
      return;
    }
    if (!formData.selling_price) {
      setError('Selling Price is required.');
      return;
    }

    try {
      setLoading(true);
      await onSaved(formData, product?.id);
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      const msg = err.response?.data?.message || 'Failed to save product. Please check form validation.';
      setError(msg);
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
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {product ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-slate-500">Configure catalog details, pricing, and stock tracking.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Basic Information */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-teal-600" /> Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Dell PowerEdge Server R750"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g. PRD-SRV-001"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode</label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="e.g. 8901234567890"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Code</label>
                  <input
                    type="text"
                    name="product_code"
                    value={formData.product_code}
                    onChange={handleChange}
                    placeholder="e.g. PC-1002"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <SearchableSelect
                    options={categories.map((c) => ({ value: c.id, label: c.name }))}
                    value={formData.category_id}
                    onChange={(val) => handleChange({ target: { name: 'category_id', value: val } })}
                    placeholder="Select Category"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                  <SearchableSelect
                    options={brands.map((b) => ({ value: b.id, label: b.name }))}
                    value={formData.brand_id}
                    onChange={(val) => handleChange({ target: { name: 'brand_id', value: val } })}
                    placeholder="Select Brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <SearchableSelect
                    options={units.map((u) => ({ value: u.id, label: `${u.name} (${u.short_name || u.short_code})` }))}
                    value={formData.unit_id}
                    onChange={(val) => handleChange({ target: { name: 'unit_id', value: val } })}
                    placeholder="Select Unit"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <SearchableSelect
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                    value={formData.status}
                    onChange={(val) => handleChange({ target: { name: 'status', value: val } })}
                    placeholder="Select Status"
                    searchable={false}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Tax */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-teal-600" /> Pricing & Tax
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase / Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MRP</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="tax_rate"
                    value={formData.tax_rate}
                    onChange={handleChange}
                    placeholder="18"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Type</label>
                  <SearchableSelect
                    options={[
                      { value: 'exclusive', label: 'Exclusive' },
                      { value: 'inclusive', label: 'Inclusive' }
                    ]}
                    value={formData.tax_type}
                    onChange={(val) => handleChange({ target: { name: 'tax_type', value: val } })}
                    placeholder="Select Tax Type"
                    searchable={false}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Inventory Levels */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Boxes className="w-3.5 h-3.5 text-teal-600" /> Stock & Depot Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Warehouse</label>
                  <SearchableSelect
                    options={warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.code})` }))}
                    value={formData.default_warehouse_id}
                    onChange={(val) => handleChange({ target: { name: 'default_warehouse_id', value: val } })}
                    placeholder="Select Warehouse"
                  />
                </div>

                {!product && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Stock Qty</label>
                    <input
                      type="number"
                      min="0"
                      name="opening_stock"
                      value={formData.opening_stock}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min / Alert Stock</label>
                  <input
                    type="number"
                    min="0"
                    name="minimum_stock"
                    value={formData.minimum_stock}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    name="reorder_level"
                    value={formData.reorder_level}
                    onChange={handleChange}
                    placeholder="20"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Stock Limit</label>
                  <input
                    type="number"
                    min="0"
                    name="maximum_stock"
                    value={formData.maximum_stock}
                    onChange={handleChange}
                    placeholder="500"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="track_inventory"
                  name="track_inventory"
                  checked={formData.track_inventory}
                  onChange={handleChange}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="track_inventory" className="text-xs text-slate-700 font-medium cursor-pointer">
                  Track stock inventory movements for this product
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleChange}
                placeholder="Product specifications, serial instructions, or internal notes..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="teal" type="submit" disabled={loading}>
                {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProductModal;
