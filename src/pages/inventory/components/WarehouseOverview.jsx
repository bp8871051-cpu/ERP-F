import React from 'react';
import { Warehouse, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export const WarehouseOverview = ({ warehouses = [] }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-teal-600" />
            Warehouse Space & Capacity Utilization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Space occupancy across regional hubs with automated critical load alerts (&gt;85%)
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          {warehouses.length} Active Hubs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        {warehouses.slice(0, 4).map((wh) => {
          const isWarning = wh.utilization > 85.0;
          const strokeColor = isWarning ? '#EF4444' : wh.utilization > 70 ? '#0F766E' : '#10B981';

          return (
            <div
              key={wh.id}
              className={`p-4 rounded-xl border transition-all ${
                isWarning
                  ? 'bg-rose-50/40 border-rose-200 shadow-2xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {wh.name}
                  </h3>
                  <span className="text-[11px] text-slate-500">{wh.city} Hub</span>
                </div>
                {isWarning ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                    <AlertTriangle className="w-3 h-3" />
                    High Load
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    <CheckCircle className="w-3 h-3" />
                    Optimal
                  </span>
                )}
              </div>

              {/* Progress Dial & Metrics */}
              <div className="flex items-center gap-4 mt-3">
                {/* Simple SVG Circular Gauge */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      strokeDasharray={`${Math.min(100, wh.utilization)}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke={strokeColor}
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-900">
                    {wh.utilization}%
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600 flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Used:</span>
                    <span className="font-semibold text-slate-800">{wh.used.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available:</span>
                    <span className="font-semibold text-slate-800">{wh.available.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacity:</span>
                    <span className="font-medium text-slate-500">{wh.capacity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WarehouseOverview;
