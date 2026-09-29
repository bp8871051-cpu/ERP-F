import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sliders,
  ArrowRightLeft,
  Plus,
  FileSpreadsheet,
} from 'lucide-react';

import inventoryService from '../../services/inventoryService';

// Modular Dashboard Components
import InventoryHeader from './components/InventoryHeader';
import InventoryKPICards from './components/InventoryKPICards';
import InventoryHealth from './components/InventoryHealth';
import StockMovementChart from './components/StockMovementChart';
import InventoryValueChart from './components/InventoryValueChart';
import CategoryDistribution from './components/CategoryDistribution';
import TopProducts from './components/TopProducts';
import LowStockAlerts from './components/LowStockAlerts';
import RecentStockActivity from './components/RecentStockActivity';
import WarehouseOverview from './components/WarehouseOverview';
import SupplierSummary from './components/SupplierSummary';
import PurchaseSalesChart from './components/PurchaseSalesChart';
import StockTurnover from './components/StockTurnover';
import FastMovingProducts from './components/FastMovingProducts';
import DeadStock from './components/DeadStock';
import StockTransferSummary from './components/StockTransferSummary';
import PurchaseOrders from './components/PurchaseOrders';
import SalesImpact from './components/SalesImpact';
import InventoryForecast from './components/InventoryForecast';
import ReorderRecommendations from './components/ReorderRecommendations';
import InventoryAlerts from './components/InventoryAlerts';
import QuickActions from './components/QuickActions';
import InventoryReports from './components/InventoryReports';

// Interactive Action Modals
import AddStockModal from './components/AddStockModal';
import StockAdjustmentModal from '../../components/inventory/StockAdjustmentModal';
import StockTransferModal from '../../components/inventory/StockTransferModal';
import AddProductModal from '../../components/inventory/AddProductModal';

export const InventoryDashboard = () => {
  const navigate = useNavigate();

  // Primary Data State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('This Month');
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState(Date.now());

  // Toast / Feedback Notification
  const [notification, setNotification] = useState(null);

  // Modals Visibility
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProductForRestock, setSelectedProductForRestock] = useState(null);

  // Live Timer Tracker
  const timerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // 1. Authoritative Data Fetch from Laravel APIs
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await inventoryService.getDashboardData({ date_range: dateRange });
      const payload = res?.data || res;
      setData(payload);
      setLastUpdatedTimestamp(Date.now());
      setLastUpdated('Just now');

      if (isManualRefresh) {
        showToast('Inventory dashboard synchronized with live database.', 'success');
      }
    } catch (err) {
      console.error('Failed to load enterprise inventory dashboard:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to synchronize inventory levels and warehouse metrics. Please verify backend connection.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  // Initial load and filter change
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Optional periodic auto-refresh (every 60s)
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);

    return () => clearInterval(autoRefreshInterval);
  }, [fetchDashboardData]);

  // Update "Last updated X seconds ago" counter
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - lastUpdatedTimestamp) / 1000);
      if (elapsedSec < 5) {
        setLastUpdated('Just now');
      } else if (elapsedSec < 60) {
        setLastUpdated(`${elapsedSec}s ago`);
      } else {
        const mins = Math.floor(elapsedSec / 60);
        setLastUpdated(`${mins}m ago`);
      }
    }, 5000);

    return () => clearInterval(timerRef.current);
  }, [lastUpdatedTimestamp]);

  // Handle Export CSV / PDF via backend API
  const handleExport = async (type = 'stock_summary') => {
    try {
      showToast(`Generating ${type.replace(/_/g, ' ')} export...`, 'info');
      await inventoryService.exportInventory(type);
      showToast('Export downloaded successfully.', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Export failed. Please try again.', 'error');
    }
  };

  // Quick Action Handlers
  const handleAddStockClick = (product = null) => {
    setSelectedProductForRestock(product);
    setShowAddStockModal(true);
  };

  const handleStockMutationSuccess = (msg) => {
    showToast(msg || 'Inventory records updated successfully.', 'success');
    fetchDashboardData(true);
  };

  const handleCreatePO = (item) => {
    showToast(`Navigating to Purchase Order creation for ${item?.name || item?.product || 'SKU'}...`, 'info');
    navigate('/app/purchases/orders', {
      state: {
        prefilledProduct: item,
      },
    });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Loading skeleton screen
  if (loading && !data) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-[1920px] mx-auto animate-pulse">
        <div className="h-20 bg-slate-200/70 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200/70 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200/70 rounded-xl" />
          <div className="h-96 bg-slate-200/70 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200/70 rounded-xl" />
          <div className="h-80 bg-slate-200/70 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state screen
  if (error && !data) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-2xl shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Inventory Dashboard</h2>
        <p className="text-sm text-slate-600 mb-6">{error}</p>
        <button
          onClick={() => fetchDashboardData(false)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    kpi,
    inventory_health = [],
    stock_movement = [],
    inventory_value_trend = [],
    category_distribution = [],
    top_products = [],
    low_stock_alerts = [],
    recent_activity = [],
    warehouse_overview = [],
    top_suppliers = [],
    purchase_vs_sales = [],
    stock_turnover = {},
    fast_moving_products = [],
    dead_stock = [],
    stock_transfer_summary = {},
    recent_purchase_orders = [],
    sales_impact = [],
    forecast = [],
    reorder_recommendations = [],
    alert_center = [],
    reports = [],
  } = data || {};

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 space-y-6">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium backdrop-blur-md transition-all ${
              notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : notification.type === 'info'
                ? 'bg-sky-50 border-sky-200 text-sky-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header with Range Filter, Export, Refresh, and Add Inventory */}
      <InventoryHeader
        dateRange={dateRange}
        onDateRangeChange={(range) => setDateRange(range)}
        onExport={handleExport}
        onRefresh={() => fetchDashboardData(true)}
        onAddInventory={() => handleAddStockClick(null)}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* 2. Urgent Inventory Alert Center (Prominent when items require action) */}
      {alert_center && alert_center.length > 0 && (
        <div id="inventory-alerts-section">
          <InventoryAlerts
            alerts={alert_center}
            onAlertAction={(alert) => {
              if (alert.type === 'low_stock' || alert.type === 'out_of_stock') {
                scrollToSection('low-stock-section');
              } else if (alert.type === 'warehouse_capacity') {
                scrollToSection('warehouse-overview-section');
              } else if (alert.type === 'dead_stock') {
                scrollToSection('dead-stock-section');
              } else {
                scrollToSection('stock-movement-section');
              }
            }}
          />
        </div>
      )}

      {/* 3. Top 6 KPI Cards */}
      <InventoryKPICards
        kpi={kpi}
        onCardClick={(key) => {
          if (key === 'low_stock_items' || key === 'out_of_stock') {
            scrollToSection('low-stock-section');
          } else if (key === 'warehouse_utilization') {
            scrollToSection('warehouse-overview-section');
          } else if (key === 'inventory_value') {
            scrollToSection('inventory-value-section');
          }
        }}
      />

      {/* 4. Quick Action Shortcuts Toolbar */}
      <QuickActions
        onAddProduct={() => setShowAddProductModal(true)}
        onAddStock={() => handleAddStockClick(null)}
        onStockAdjustment={() => setShowAdjustmentModal(true)}
        onStockTransfer={() => setShowTransferModal(true)}
        onCreatePO={() => handleCreatePO(null)}
        onAddSupplier={() => navigate('/app/inventory/suppliers')}
        onViewLowStock={() => scrollToSection('low-stock-section')}
        onViewReports={() => scrollToSection('inventory-reports-section')}
      />

      {/* 5. Primary Charts: Stock Movement Area/Line + Inventory Health Donut */}
      <div id="stock-movement-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <StockMovementChart movementData={stock_movement} />
        </div>
        <div className="lg:col-span-4">
          <InventoryHealth healthData={inventory_health} />
        </div>
      </div>

      {/* 6. Valuation & Commercial Comparison: Value Trend + Purchase vs Sales */}
      <div id="inventory-value-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <InventoryValueChart valueTrend={inventory_value_trend} />
        </div>
        <div className="lg:col-span-6">
          <PurchaseSalesChart data={purchase_vs_sales} />
        </div>
      </div>

      {/* 7. Category Distribution + Multi-Warehouse Overview */}
      <div id="warehouse-overview-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <CategoryDistribution categoryData={category_distribution} />
        </div>
        <div className="lg:col-span-7">
          <WarehouseOverview warehouses={warehouse_overview} />
        </div>
      </div>

      {/* 8. Critical Action Tables: Low Stock Alerts + Automated Reorder Recommendations */}
      <div id="low-stock-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <LowStockAlerts
            alerts={low_stock_alerts}
            onAdjustStock={(item) => {
              setShowAdjustmentModal(true);
            }}
            onCreatePO={(item) => handleCreatePO(item)}
          />
        </div>
        <div className="lg:col-span-5">
          <ReorderRecommendations
            recommendations={reorder_recommendations}
            onCreatePO={(rec) => handleCreatePO(rec)}
          />
        </div>
      </div>

      {/* 9. Predictive Analytics: Run-Rate Stockout Forecast + Top Products by Value */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <InventoryForecast
            forecasts={forecast}
            onOrderClick={(item) => handleCreatePO(item)}
          />
        </div>
        <div className="lg:col-span-6">
          <TopProducts products={top_products} />
        </div>
      </div>

      {/* 10. Velocity & Turnover Analysis: Ratio Breakdown + Fast Moving + Dead Stock */}
      <div id="dead-stock-section" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <StockTurnover turnoverData={stock_turnover} />
          </div>
          <div className="lg:col-span-4">
            <FastMovingProducts products={fast_moving_products} />
          </div>
          <div className="lg:col-span-4">
            <StockTransferSummary summary={stock_transfer_summary} />
          </div>
        </div>

        {/* Dead Stock Alert Table */}
        <DeadStock
          deadStock={dead_stock}
          onAdjustStock={(item) => setShowAdjustmentModal(true)}
          onTransferStock={(item) => setShowTransferModal(true)}
        />
      </div>

      {/* 11. Pipeline & Audit Logs: Recent Activity + Supplier Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RecentStockActivity activities={recent_activity} />
        </div>
        <div className="lg:col-span-5">
          <SupplierSummary suppliers={top_suppliers} />
        </div>
      </div>

      {/* 12. Purchasing & Sales Impact Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <PurchaseOrders purchaseOrders={recent_purchase_orders} />
        </div>
        <div className="lg:col-span-6">
          <SalesImpact salesImpact={sales_impact} />
        </div>
      </div>

      {/* 13. Reports Catalog & Quick Generator */}
      <div id="inventory-reports-section">
        <InventoryReports
          reports={reports}
          onExport={(reportId) => handleExport(reportId)}
        />
      </div>

      {/* =========================================================================
          INTERACTIVE ACTION MODALS (Add Stock, Adjust Stock, Transfer, Add Product)
          ========================================================================= */}
      <AddStockModal
        isOpen={showAddStockModal}
        onClose={() => {
          setShowAddStockModal(false);
          setSelectedProductForRestock(null);
        }}
        initialProduct={selectedProductForRestock}
        onSuccess={() => {
          setShowAddStockModal(false);
          setSelectedProductForRestock(null);
          handleStockMutationSuccess('Stock added successfully to designated warehouse.');
        }}
      />

      <StockAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onSaved={() => {
          setShowAdjustmentModal(false);
          handleStockMutationSuccess('Stock adjustment recorded and inventory balance updated.');
        }}
      />

      <StockTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSaved={() => {
          setShowTransferModal(false);
          handleStockMutationSuccess('Stock transfer scheduled and logged in inventory records.');
        }}
      />

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSaved={() => {
          setShowAddProductModal(false);
          handleStockMutationSuccess('New product registered and catalog updated.');
        }}
      />
    </div>
  );
};

export default InventoryDashboard;
