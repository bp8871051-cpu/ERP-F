import React from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

export const InventoryFilterBar = ({
  search = '',
  onSearchChange,
  warehouse = 'all',
  onWarehouseChange,
  warehouses = [],
  category = 'all',
  onCategoryChange,
  categories = [],
  brand = 'all',
  onBrandChange,
  brands = [],
  supplier = 'all',
  onSupplierChange,
  suppliers = [],
  stockStatus = 'all',
  onStockStatusChange,
  onResetFilters,
}) => {
  const isFiltered =
    search ||
    warehouse !== 'all' ||
    category !== 'all' ||
    brand !== 'all' ||
    supplier !== 'all' ||
    stockStatus !== 'all';

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products, SKU, barcode, category, brand, supplier..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] text-xs font-medium text-[#172033] placeholder:text-[#64748B] focus:outline-none focus:border-[#0F9D8A] focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Warehouse Filter */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={warehouse}
              onChange={(e) => onWarehouseChange(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium text-[#172033] focus:outline-none focus:border-[#0F9D8A] cursor-pointer"
            >
              <option value="all">Warehouse: All</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium text-[#172033] focus:outline-none focus:border-[#0F9D8A] cursor-pointer"
            >
              <option value="all">Category: All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={brand}
              onChange={(e) => onBrandChange(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium text-[#172033] focus:outline-none focus:border-[#0F9D8A] cursor-pointer"
            >
              <option value="all">Brand: All</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="flex-1 sm:flex-initial">
            <select
              value={stockStatus}
              onChange={(e) => onStockStatusChange(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium text-[#172033] focus:outline-none focus:border-[#0F9D8A] cursor-pointer"
            >
              <option value="all">Stock Status: All</option>
              <option value="in_stock">In Stock Only</option>
              <option value="low_stock">Low Stock Alerts</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Reset all search filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryFilterBar;
