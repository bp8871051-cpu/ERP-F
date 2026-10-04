import React from 'react';
import {
  RefreshCw,
  Download,
  Plus,
  Boxes,
  Calendar,
  Warehouse as WarehouseIcon,
  ChevronDown,
} from 'lucide-react';

export const InventoryHeader = ({
  warehouse = 'all',
  onWarehouseChange,
  warehouses = [],
  dateRange = '30 Days',
  onDateRangeChange,
  onExport,
  onRefresh,
  onAddInventory,
  isRefreshing = false,
  lastUpdated = 'Just now',
}) => {
  const dateRanges = ['7 Days', '30 Days', '3 Months', '6 Months', '1 Year'];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Title & Subtitle + Live status */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-[#162B53] text-white flex items-center justify-center shadow-sm">
              <Boxes className="w-5 h-5 text-[#0F9D8A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
                Inventory Dashboard
              </h1>
            </div>
            {/* Live Indicator Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Inventory</span>
            </div>
            <span className="text-xs text-[#64748B] hidden sm:inline-block">
              Last updated: {lastUpdated}
            </span>
          </div>
          <p className="text-sm text-[#64748B] max-w-2xl">
            Monitor stock levels, inventory value, warehouse capacity and product movement in real time.
          </p>
        </div>

        {/* Right Controls: Warehouse, Date Range, Export, Refresh, Add Inventory */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Warehouse Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium text-[#172033] hover:border-slate-300 transition-colors">
              <WarehouseIcon className="w-3.5 h-3.5 text-[#64748B]" />
              <select
                value={warehouse}
                onChange={(e) => onWarehouseChange && onWarehouseChange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer pr-4 font-medium text-xs text-[#172033]"
              >
                <option value="all">All Warehouses</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-medium text-[#172033] hover:border-slate-300 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
              <select
                value={dateRange}
                onChange={(e) => onDateRangeChange && onDateRangeChange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer pr-4 font-medium text-xs text-[#172033]"
              >
                {dateRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={() => onExport && onExport('stock_summary')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-slate-50 text-xs font-medium text-[#172033] transition-colors shadow-2xs"
            title="Export CSV or PDF"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-slate-50 text-xs font-medium text-[#172033] transition-colors shadow-2xs disabled:opacity-60"
            title="Synchronize live inventory records"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#64748B] ${isRefreshing ? 'animate-spin text-[#0F9D8A]' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* + Add Inventory Button */}
          <button
            onClick={onAddInventory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F9D8A] hover:bg-[#0d8777] text-white text-xs font-semibold transition-all shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Inventory</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader;
