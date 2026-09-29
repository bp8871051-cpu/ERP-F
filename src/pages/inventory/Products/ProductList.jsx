import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Copy,
  Edit,
  Trash2,
  History,
  Eye,
  CheckSquare,
  Square,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Building,
} from 'lucide-react';
import productService from '../../../services/productService';
import categoryService from '../../../services/categoryService';
import brandService from '../../../services/brandService';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import StockStatusBadge from '../../../components/inventory/StockStatusBadge';
import AddProductModal from '../../../components/inventory/AddProductModal';
import ConfirmModal from '../../../components/inventory/ConfirmModal';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Filter dropdown data
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryId, brandId, warehouseId, status, page]);

  const loadFilterOptions = async () => {
    try {
      const [cRes, bRes, wRes] = await Promise.all([
        categoryService.getCategories(),
        brandService.getBrands(),
        warehouseService.getWarehouses(),
      ]);
      setCategories(cRes.data || []);
      setBrands(bRes.data || []);
      setWarehouses(wRes.data || []);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts({
        search,
        category_id: categoryId || undefined,
        brand_id: brandId || undefined,
        warehouse_id: warehouseId || undefined,
        status: status || undefined,
        page,
        per_page: 15,
      });
      setProducts(res.data || []);
      setMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDuplicate = async (id) => {
    try {
      setActionLoading(true);
      await productService.duplicateProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      setActionLoading(true);
      await productService.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveProduct = async (formData, id) => {
    if (id) {
      await productService.updateProduct(id, formData);
    } else {
      await productService.createProduct(formData);
    }
    fetchProducts();
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
            Products & Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage enterprise inventory master catalog, SKUs, pricing tiers, and stock alert levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={productService.exportProductsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </a>
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingProduct(null);
              setShowAddModal(true);
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-3.5 shadow-sm border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, barcode..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white text-slate-700 min-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={brandId}
            onChange={(e) => {
              setBrandId(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white text-slate-700 min-w-[130px]"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Warehouse Filter */}
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

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(search || categoryId || brandId || warehouseId || status) && (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                setSearch('');
                setCategoryId('');
                setBrandId('');
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

      {/* Products Table Card */}
      <Card className="overflow-hidden shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {selectedIds.length === products.length && products.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3">SKU</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Brand</th>
                <th className="p-3 text-right">Available Stock</th>
                <th className="p-3 text-right">Selling Price</th>
                <th className="p-3 text-right">Cost Price</th>
                <th className="p-3">Stock Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                      <span>Loading products catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleSelectOne(p.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{p.sku}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-[200px] truncate">
                        <NavLink
                          to={`/app/inventory/products/${p.id}`}
                          className="hover:text-teal-600 hover:underline"
                        >
                          {p.name}
                        </NavLink>
                      </td>
                      <td className="p-3 text-slate-600">{p.category?.name || '—'}</td>
                      <td className="p-3 text-slate-600">{p.brand?.name || '—'}</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        {p.total_stock}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          {p.unit?.short_name || 'units'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        {formatCurrency(p.selling_price)}
                      </td>
                      <td className="p-3 text-right text-slate-500 font-medium">
                        {formatCurrency(p.purchase_price ?? p.cost_price)}
                      </td>
                      <td className="p-3">
                        <StockStatusBadge status={p.stock_status} />
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <NavLink
                            to={`/app/inventory/products/${p.id}`}
                            title="View Detail"
                            className="p-1 text-slate-400 hover:text-teal-600 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </NavLink>
                          <NavLink
                            to={`/app/inventory/products/${p.id}/stock-history`}
                            title="Stock History"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </NavLink>
                          <button
                            title="Duplicate"
                            onClick={() => handleDuplicate(p.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => {
                              setEditingProduct(p);
                              setShowAddModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => setDeletingProduct(p)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50/60 border-t border-slate-200/80 text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {products.length > 0 ? (page - 1) * 15 + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(page * 15, meta.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{meta.total}</span> products
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

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSaved={handleSaveProduct}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete '${deletingProduct?.name}' (${deletingProduct?.sku})? If stock movement history exists, this item will be safely soft-deleted.`}
        summary={
          deletingProduct && {
            SKU: deletingProduct.sku,
            Category: deletingProduct.category?.name || 'N/A',
            'Current Stock': deletingProduct.total_stock,
          }
        }
        confirmText="Delete Product"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default ProductList;
