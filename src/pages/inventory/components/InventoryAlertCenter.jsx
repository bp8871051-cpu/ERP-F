import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  Boxes,
  Warehouse,
  Truck,
  Sliders,
} from 'lucide-react';

export const InventoryAlertCenter = ({ alerts = [], onAlertAction }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertStyle = (severity, color) => {
    switch (color || severity) {
      case 'red':
      case 'critical':
        return {
          container: 'bg-red-50/80 border-red-200 hover:border-red-300 text-red-950',
          badge: 'bg-red-600 text-white',
          iconColor: 'text-red-600',
          btn: 'bg-red-600 hover:bg-red-700 text-white',
          Icon: AlertOctagon,
        };
      case 'orange':
      case 'warning':
        return {
          container: 'bg-orange-50/80 border-orange-200 hover:border-orange-300 text-orange-950',
          badge: 'bg-orange-500 text-white',
          iconColor: 'text-orange-600',
          btn: 'bg-orange-500 hover:bg-orange-600 text-white',
          Icon: AlertTriangle,
        };
      case 'yellow':
      case 'attention':
        return {
          container: 'bg-amber-50/80 border-amber-200 hover:border-amber-300 text-amber-950',
          badge: 'bg-amber-500 text-white',
          iconColor: 'text-amber-600',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white',
          Icon: ShieldAlert,
        };
      case 'blue':
      case 'info':
      default:
        return {
          container: 'bg-blue-50/80 border-blue-200 hover:border-blue-300 text-blue-950',
          badge: 'bg-blue-600 text-white',
          iconColor: 'text-blue-600',
          btn: 'bg-blue-600 hover:bg-blue-700 text-white',
          Icon: Info,
        };
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Alert Center Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB]/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#172033] tracking-tight">
              Inventory Alert Center
            </h2>
            <p className="text-xs text-[#64748B]">
              Stock shortages, out-of-stock products, warehouse capacity and pending inventory actions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#64748B] text-xs font-semibold">
            {alerts.length} Active Notice{alerts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Dynamic Alert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {alerts.map((alert) => {
          const style = getAlertStyle(alert.severity, alert.color);
          const IconComponent = style.Icon;

          return (
            <div
              key={alert.id}
              className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between gap-3 shadow-2xs ${style.container}`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 shrink-0 ${style.iconColor}`} />
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                      {alert.badge || alert.severity}
                    </span>
                  </div>
                  {alert.time && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      {alert.time}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#172033] line-clamp-1">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              </div>

              {alert.action_label && (
                <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {alert.count ? `${alert.count} Items Affected` : 'Action Required'}
                  </span>
                  <button
                    onClick={() => onAlertAction && onAlertAction(alert)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-transform active:scale-95 shadow-2xs ${style.btn}`}
                  >
                    <span>{alert.action_label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryAlertCenter;
