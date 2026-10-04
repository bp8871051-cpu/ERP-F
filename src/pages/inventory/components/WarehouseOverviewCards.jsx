import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Warehouse as WarehouseIcon, MapPin, Boxes, ArrowUpRight, ShieldAlert } from 'lucide-react';

export const WarehouseOverviewCards = ({ warehouses = [] }) => {
  const navigate = useNavigate();

  const getUtilizationColor = (util) => {
    if (util >= 88) return { bar: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-50 border-red-200 text-red-700' };
    if (util >= 75) return { bar: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50 border-amber-200 text-amber-700' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB]/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <WarehouseIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#172033] tracking-tight">
              Warehouse Overview
            </h2>
            <p className="text-xs text-[#64748B]">
              Distribution hub capacities, current stock values and storage utilization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/inventory/warehouses')}
            className="text-xs font-semibold text-[#0F9D8A] hover:text-[#0c7c6d] flex items-center gap-1 transition-colors"
          >
            <span>Manage Warehouses</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map((wh) => {
          const util = wh.utilization || 50;
          const colors = getUtilizationColor(util);

          return (
            <div
              key={wh.id}
              onClick={() => navigate(`/app/inventory/warehouses/${wh.id}`)}
              className="rounded-xl border border-[#E5E7EB] p-4 bg-[#F7F8FA]/60 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              {/* Warehouse Name & City Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-[#172033] group-hover:text-[#0F9D8A] transition-colors line-clamp-1">
                    {wh.name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{wh.city || 'Central Hub'}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors.badge}`}>
                  {util}% Cap
                </span>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]/80 text-xs">
                <div>
                  <div className="text-[10px] font-semibold text-[#64748B] uppercase">Products</div>
                  <div className="text-sm font-bold text-[#172033] mt-0.5">
                    {Number(wh.products || 0).toLocaleString()} SKUs
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#64748B] uppercase">Stock Units</div>
                  <div className="text-sm font-bold text-[#172033] mt-0.5">
                    {Number(wh.units || 0).toLocaleString()} Units
                  </div>
                </div>
              </div>

              {/* Stock Value & Capacity */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5E7EB]/50">
                <span className="text-[#64748B] text-[11px]">Stock Value:</span>
                <span className="font-bold text-[#162B53]">
                  {wh.formatted_value || `₹${Number(wh.stock_value / 100000).toFixed(1)}L`}
                </span>
              </div>

              {/* Utilization Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#64748B]">Capacity:</span>
                  <span className="font-semibold text-slate-700">
                    {Number(wh.used || wh.units).toLocaleString()} / {Number(wh.capacity).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: `${Math.min(100, util)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WarehouseOverviewCards;
