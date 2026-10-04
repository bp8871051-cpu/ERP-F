import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowUpRight } from 'lucide-react';

export const CategoryInventoryCard = ({ categories = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB]/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F9D8A] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#172033] tracking-tight">
              Inventory by Category
            </h3>
            <p className="text-xs text-[#64748B]">
              Stock concentration, item counts and capital distribution across product categories
            </p>
          </div>
        </div>
        <div>
          <button
            onClick={() => navigate('/app/inventory/categories')}
            className="text-xs font-semibold text-[#0F9D8A] hover:text-[#0c7c6d] flex items-center gap-1 transition-colors"
          >
            <span>All Categories</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Categories List with Horizontal Progress Bars */}
      <div className="space-y-3.5 divide-y divide-[#E5E7EB]/50">
        {categories && categories.length > 0 ? (
          categories.slice(0, 6).map((cat) => {
            const pct = cat.percentage != null ? cat.percentage : 15;
            return (
              <div
                key={cat.id}
                onClick={() => navigate('/app/inventory/categories')}
                className="pt-3 first:pt-0 group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#172033] group-hover:text-[#0F9D8A] transition-colors">
                      {cat.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-semibold">
                      {cat.products != null ? `${cat.products} SKUs` : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span className="font-mono text-slate-600 font-medium">
                      {Number(cat.units || 0).toLocaleString()} Units
                    </span>
                    <span className="font-bold text-[#162B53]">
                      {cat.formatted_value || `₹${Number((cat.stock_value || 0) / 100000).toFixed(1)}L`}
                    </span>
                    <span className="font-bold text-[#0F9D8A] min-w-[38px] text-right">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0F9D8A] to-[#162B53] transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No category distribution data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryInventoryCard;
