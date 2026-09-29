import React from 'react';
import {
  Bell,
  AlertTriangle,
  XCircle,
  Warehouse,
  Clock,
  ArrowRightLeft,
  ChevronRight,
} from 'lucide-react';

export const InventoryAlerts = ({ alerts = [], onAlertAction }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600" />
            Inventory Alert Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active warnings, stock deficits, space saturation & pending actions
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full border border-rose-200/60">
          {alerts.length} Active Alerts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {alerts.map((al) => {
          const isCritical = al.severity === 'critical';
          const Icon =
            al.type === 'out_of_stock'
              ? XCircle
              : al.type === 'capacity_warning'
              ? Warehouse
              : al.type === 'pending_purchase'
              ? Clock
              : al.type === 'pending_transfer'
              ? ArrowRightLeft
              : AlertTriangle;

          return (
            <div
              key={al.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-amber-50/40 border-amber-200/80'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{al.title}</h3>
                    <span className="text-[10px] text-slate-400 shrink-0">{al.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{al.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryAlerts;
