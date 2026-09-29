import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  Warehouse,
  Truck,
  Sliders,
  ArrowRightLeft,
  Zap,
} from 'lucide-react';

export const InventoryReports = ({ reports = [], onExport }) => {
  const iconMap = {
    stock_summary: Boxes,
    stock_movement: TrendingUp,
    valuation: FileSpreadsheet,
    low_stock: FileText,
    dead_stock: FileText,
    warehouse_report: Warehouse,
    supplier_purchases: Truck,
    stock_adjustment: Sliders,
    stock_transfer: ArrowRightLeft,
    product_performance: Zap,
  };

  return (
    <div id="inventory-reports-section" className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            Enterprise Inventory Reports Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard and compliance valuation, movement, and audit reports
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          {reports.length} Reports Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
        {reports.map((rep) => {
          const Icon = iconMap[rep.id] || FileText;

          return (
            <div
              key={rep.id}
              onClick={() => onExport && onExport(rep.id)}
              className="p-3.5 rounded-xl border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/20 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-2.5 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {rep.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{rep.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-600 font-semibold">
                <span>Generate CSV</span>
                <Download className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryReports;
