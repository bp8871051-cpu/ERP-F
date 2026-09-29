import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Download,
  RefreshCw,
  Plus,
  ChevronDown,
  Check,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import Button from '../../../components/ui/Button';

export const InventoryHeader = ({
  dateRange,
  setDateRange,
  onRefresh,
  onExport,
  onAddStock,
  lastUpdated,
  isRefreshing,
}) => {
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const dateOptions = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' },
    { key: 'custom', label: 'Custom Range' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdated) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const activeLabel = dateOptions.find((o) => o.key === dateRange)?.label || 'This Month';

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Inventory Dashboard
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
            Real-time Telemetry
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Monitor stock, warehouse capacity, inventory value, purchase activity and low-stock alerts across all active enterprise hubs.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Live Timer Status */}
        <span className="hidden sm:inline-flex items-center text-xs text-slate-400 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Updated {secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`}
        </span>

        {/* Date Range Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{activeLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1">
              {dateOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setDateRange(opt.key);
                    setDateDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left"
                >
                  <span>{opt.label}</span>
                  {dateRange === opt.key && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {exportDropdownOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1">
              <button
                type="button"
                onClick={() => {
                  onExport('stock_summary');
                  setExportDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Stock Summary (CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExport('low_stock');
                  setExportDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Export Low Stock Report</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setExportDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
        </button>

        {/* + Add Stock Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onAddStock}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Inventory</span>
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
