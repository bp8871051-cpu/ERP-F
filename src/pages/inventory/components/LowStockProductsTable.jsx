import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, PlusCircle, Package } from 'lucide-react';

export const LowStockProductsTable = ({ lowStockProducts = [], onRestockProduct }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status, severity) => {
    switch (status) {
      case 'Critical':
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
            Critical
          </span>
        );
      case 'Low':
      case 'Low Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            Low
          </span>
        );
      case 'Warning':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Warning
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Title & View All Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB]/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#172033] tracking-tight">
              Low Stock Products
            </h2>
            <p className="text-xs text-[#64748B]">
              Catalog items approaching minimum threshold requiring immediate procurement action
            </p>
          </div>
        </div>
        <div>
          <button
            onClick={() => navigate('/app/inventory/products')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F9D8A] hover:text-[#0c7c6d] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Component */}
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F7F8FA] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              <th className="py-3 px-4 rounded-l-lg">Product</th>
              <th className="py-3 px-3">SKU</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Warehouse</th>
              <th className="py-3 px-3 text-right">Current Stock</th>
              <th className="py-3 px-3 text-right">Min Stock</th>
              <th className="py-3 px-3 text-right">Reorder Level</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-center rounded-r-lg">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]/70 text-xs">
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Product */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <span
                        onClick={() => navigate(`/app/inventory/products/${item.id}`)}
                        className="font-semibold text-[#172033] hover:text-[#0F9D8A] cursor-pointer transition-colors line-clamp-1"
                      >
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                    {item.sku}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {item.category}
                  </td>

                  {/* Warehouse */}
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {item.warehouse || 'Main Warehouse'}
                  </td>

                  {/* Current Stock */}
                  <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                    <span
                      className={
                        item.current_stock <= 0
                          ? 'text-red-600'
                          : item.current_stock <= item.minimum_stock
                          ? 'text-orange-600'
                          : 'text-slate-800'
                      }
                    >
                      {item.current_stock}
                    </span>
                  </td>

                  {/* Minimum Stock */}
                  <td className="py-3 px-3 text-right text-slate-500 font-mono">
                    {item.minimum_stock}
                  </td>

                  {/* Reorder Level */}
                  <td className="py-3 px-3 text-right text-slate-500 font-mono">
                    {item.reorder_level}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    {getStatusBadge(item.status, item.severity)}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onRestockProduct && onRestockProduct(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F9D8A] hover:bg-[#0c7c6d] text-white text-[11px] font-semibold transition-colors shadow-2xs active:scale-95"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Restock</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="w-8 h-8 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-700">All products are healthy</p>
                    <p className="text-[11px] text-slate-400">No SKUs currently below minimum safe threshold.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStockProductsTable;
