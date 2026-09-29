import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ChevronRight, ExternalLink } from 'lucide-react';

export const CategoryDistribution = ({ categoryData = [] }) => {
  const navigate = useNavigate();

  if (!categoryData || categoryData.length === 0) return null;

  const maxQty = Math.max(...categoryData.map((c) => c.quantity || 1), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-600" />
            Stock by Category
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unit distribution & portfolio valuation by product category
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/inventory/categories')}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
        >
          <span>View All Categories</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="mt-4 space-y-3.5">
        {categoryData.slice(0, 6).map((cat) => {
          const ratio = Math.min(100, Math.round((cat.quantity / maxQty) * 100));

          return (
            <div
              key={cat.id || cat.name}
              onClick={() => navigate(`/app/inventory/categories`)}
              className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/80 hover:border-slate-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">
                    {cat.quantity.toLocaleString()} Units
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    ₹{(cat.inventory_value || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryDistribution;
