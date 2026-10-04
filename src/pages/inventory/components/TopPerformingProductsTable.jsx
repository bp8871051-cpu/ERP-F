import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, TrendingUp, Package, ArrowUpRight } from 'lucide-react';

export const TopPerformingProductsTable = ({ products = [] }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('Highest Revenue');

  const sortOptions = ['Top Selling', 'Highest Revenue', 'Fast Moving'];

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'Top Selling') {
      return (b.units_sold || 0) - (a.units_sold || 0);
    }
    if (sortBy === 'Fast Moving') {
      const velA = (a.units_sold || 1) / Math.max(1, a.current_stock || 1);
      const velB = (b.units_sold || 1) / Math.max(1, b.current_stock || 1);
      return velB - velA;
    }
    // Default: Highest Revenue
    return (b.revenue || 0) - (a.revenue || 0);
  });

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Title & Sorting Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB]/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F9D8A] flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#172033] tracking-tight">
              Top Performing Products
            </h2>
            <p className="text-xs text-[#64748B]">
              Highest velocity catalog lines by sales demand and gross margin contribution
            </p>
          </div>
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-1 bg-[#F7F8FA] border border-[#E5E7EB] p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {sortOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                sortBy === opt
                  ? 'bg-white text-[#162B53] shadow-xs border border-[#E5E7EB]'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F7F8FA] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              <th className="py-3 px-4 rounded-l-lg">Product</th>
              <th className="py-3 px-3">SKU</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-right">Units Sold</th>
              <th className="py-3 px-3 text-right">Revenue</th>
              <th className="py-3 px-4 text-right rounded-r-lg">Current Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]/70 text-xs">
            {sortedProducts.map((p, idx) => (
              <tr
                key={p.id || idx}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                onClick={() => navigate(`/app/inventory/products/${p.id}`)}
              >
                {/* Product with Rank indicator */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-[#162B53] text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-[#172033] group-hover:text-[#0F9D8A] transition-colors line-clamp-1">
                      {p.name}
                    </span>
                  </div>
                </td>

                {/* SKU */}
                <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                  {p.sku}
                </td>

                {/* Category */}
                <td className="py-3 px-3 text-slate-600 font-medium">
                  {p.category}
                </td>

                {/* Units Sold */}
                <td className="py-3 px-3 text-right font-bold text-[#162B53] font-mono">
                  {Number(p.units_sold).toLocaleString()}
                </td>

                {/* Revenue */}
                <td className="py-3 px-3 text-right font-bold text-emerald-700 font-mono">
                  {p.formatted_revenue || `₹${Number(p.revenue).toLocaleString()}`}
                </td>

                {/* Current Stock */}
                <td className="py-3 px-4 text-right">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      p.current_stock <= 0
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : p.current_stock < 20
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {p.current_stock} Units
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPerformingProductsTable;
