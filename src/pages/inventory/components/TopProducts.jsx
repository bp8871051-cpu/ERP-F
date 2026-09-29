import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ExternalLink, ArrowRight } from 'lucide-react';

export const TopProducts = ({ products = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" />
            Top Products by Stock Value
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Highest valuation capital tied in on-hand inventory
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/inventory/products')}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
        >
          <span>View All Products</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/80">
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">SKU</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Current Stock</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Stock Value</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const statusBadge =
                p.status === 'Healthy' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Healthy
                  </span>
                ) : p.status === 'Out of Stock' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                    Low Stock
                  </span>
                );

              return (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/app/inventory/products/${p.id}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                      {p.name.charAt(0)}
                    </span>
                    <span className="truncate max-w-[180px]">{p.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{p.sku}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                    {p.stock.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                    ₹{p.unit_price?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ₹{p.stock_value?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center">{statusBadge}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;
