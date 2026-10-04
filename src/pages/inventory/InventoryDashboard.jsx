import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Plus,
  Package,
} from 'lucide-react';

import inventoryService from '../../services/inventoryService';

// Redesigned Dashboard Modular Components (Sections 3 to 15)
import InventoryHeader from './components/InventoryHeader';
import InventoryAlertCenter from './components/InventoryAlertCenter';
import InventoryKPICards from './components/InventoryKPICards';
import StockMovementAnalytics from './components/StockMovementAnalytics';
import StockHealthDonut from './components/StockHealthDonut';
import InventoryValuationCard from './components/InventoryValuationCard';
import WarehouseOverviewCards from './components/WarehouseOverviewCards';
import LowStockProductsTable from './components/LowStockProductsTable';
import TopPerformingProductsTable from './components/TopPerformingProductsTable';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import CategoryInventoryCard from './components/CategoryInventoryCard';
import QuickActionsToolbar from './components/QuickActionsToolbar';
import InventoryFilterBar from './components/InventoryFilterBar';

// Operational Modals
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

  // Filter States (Section 15)
  const [search, setSearch] = useState('');
  const [warehouse, setWarehouse] = useState('all');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [supplier, setSupplier] = useState('all');
  const [stockStatus, setStockStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30 Days');

  // Live Time Tracker
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState(Date.now());
  const timerRef = useRef(null);

  // Toast Notification State
  const [notification, setNotification] = useState(null);

  // Modals Visibility
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProductForRestock, setSelectedProductForRestock] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Fetch Dashboard Data from Backend API
  const fetchDashboardData = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = {
        date_range: dateRange,
        warehouse_id: warehouse !== 'all' ? warehouse : undefined,
        category_id: category !== 'all' ? category : undefined,
        brand_id: brand !== 'all' ? brand : undefined,
        supplier_id: supplier !== 'all' ? supplier : undefined,
        stock_status: stockStatus !== 'all' ? stockStatus : undefined,
        search: search || undefined,
      };

      const res = await inventoryService.getDashboardData(params);
      const payload = res?.data || res;
      setData(payload);
      setLastUpdatedTimestamp(Date.now());
      setLastUpdated('Just now');

      if (isManual) {
        showToast('Inventory dashboard synchronized with live database.', 'success');
      }
    } catch (err) {
      console.error('Failed to load inventory dashboard:', err);
      setError(
        err?.response?.data?.message ||
          'Unable to load inventory dashboard. Please verify backend connection and MySQL database.'
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange, warehouse, category, brand, supplier, stockStatus, search]);

  // Initial fetch and on filter changes (with debounce on search)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDashboardData();
    }, 250);
    return () => clearTimeout(handler);
  }, [fetchDashboardData]);

  // Periodic Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Live dynamic time ticker
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

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setWarehouse('all');
    setCategory('all');
    setBrand('all');
    setSupplier('all');
    setStockStatus('all');
    setDateRange('30 Days');
  };

  // Scroll to section helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Restock action trigger
  const handleRestock = (product) => {
    setSelectedProductForRestock(product);
    setShowAddStockModal(true);
  };

  // Export handler
  const handleExport = (type = 'stock_summary') => {
    try {
      showToast(`Generating ${type.replace(/_/g, ' ')} export...`, 'info');
      if (data?.low_stock_products || data?.top_products) {
        const rows = [
          ['Product Name', 'SKU', 'Category', 'Stock Qty', 'Min Stock', 'Status'],
          ...(data.low_stock_products || []).map((p) => [
            p.name,
            p.sku,
            p.category,
            p.current_stock,
            p.minimum_stock,
            p.status,
          ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `inventory_${type}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Inventory report exported successfully.', 'success');
      }
    } catch (err) {
      console.error('Export error:', err);
      showToast('Export failed. Please try again.', 'error');
    }
  };

  // Alert action router
  const handleAlertAction = (alert) => {
    if (alert.type === 'out_of_stock' || alert.action_type === 'add_stock') {
      setShowAddStockModal(true);
    } else if (alert.type === 'low_stock' || alert.action_type === 'view_low_stock') {
      scrollToSection('low-stock-products-section');
    } else if (alert.type === 'warehouse_capacity' || alert.action_type === 'stock_transfer') {
      setShowTransferModal(true);
    } else if (alert.type === 'pending_po' || alert.action_type === 'view_po') {
      navigate('/app/procurement/orders');
    } else if (alert.type === 'pending_transfers' || alert.action_type === 'view_transfers') {
      navigate('/app/inventory/stock/transfer');
    } else if (alert.type === 'inventory_adjustment' || alert.action_type === 'view_adjustments') {
      setShowAdjustmentModal(true);
    } else {
      scrollToSection('low-stock-products-section');
    }
  };

  // Success handler for stock mutations
  const handleMutationSuccess = (msg) => {
    showToast(msg || 'Inventory records successfully updated.', 'success');
    fetchDashboardData(true);
  };

  // =========================================================================
  // SECTION 19: LOADING STATE (SKELETON)
  // =========================================================================
  if (loading && !data) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-[1920px] mx-auto animate-pulse">
        <div className="h-24 bg-slate-200/80 rounded-2xl" />
        <div className="h-16 bg-slate-200/80 rounded-2xl" />
        <div className="h-32 bg-slate-200/80 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200/80 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-slate-200/80 rounded-2xl" />
          <div className="lg:col-span-4 h-96 bg-slate-200/80 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 h-96 bg-slate-200/80 rounded-2xl" />
          <div className="lg:col-span-6 h-96 bg-slate-200/80 rounded-2xl" />
        </div>
        <div className="h-80 bg-slate-200/80 rounded-2xl" />
      </div>
    );
  }

  // =========================================================================
  // SECTION 19: ERROR STATE
  // =========================================================================
  if (error && !data) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-2xl shadow-sm text-center">
        <div className="w-14 h-14 mx-auto mb-4 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Unable to Load Inventory Dashboard
        </h2>
        <p className="text-sm text-slate-600 mb-6">{error}</p>
        <button
          onClick={() => fetchDashboardData(false)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F9D8A] hover:bg-[#0c7c6d] text-white font-semibold text-sm transition-colors shadow-sm active:scale-98"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // SECTION 19: EMPTY STATE
  // =========================================================================
  const {
    kpi = {},
    alert_center = [],
    stock_movement = [],
    stock_health = {},
    inventory_value = {},
    warehouse_overview = [],
    low_stock_products = [],
    top_products = [],
    recent_transactions = [],
    category_inventory = [],
    filters_meta = {},
  } = data || {};

  const totalProductsCount = kpi?.total_products?.value || 0;

  if (totalProductsCount === 0 && !loading && !search && warehouse === 'all') {
    return (
      <div className="max-w-xl mx-auto my-20 p-10 bg-white border border-slate-200 rounded-2xl shadow-sm text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center">
          <Package className="w-8 h-8 text-[#0F9D8A]" />
        </div>
        <h2 className="text-2xl font-bold text-[#172033]">No Inventory Data</h2>
        <p className="text-sm text-[#64748B] max-w-md mx-auto">
          Add your first product to start tracking inventory, stock movements, and warehouse capacity.
        </p>
        <button
          onClick={() => setShowAddProductModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F9D8A] hover:bg-[#0c7c6d] text-white font-semibold text-sm transition-all shadow-sm active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>
    );
  }

  // Metadata for filter dropdowns
  const availableWarehouses = filters_meta?.warehouses || warehouse_overview || [];
  const availableCategories = filters_meta?.categories || category_inventory || [];
  const availableBrands = filters_meta?.brands || [];
  const availableSuppliers = filters_meta?.suppliers || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F7F8FA] pb-16 space-y-6 max-w-[1920px] mx-auto px-4 sm:px-6 pt-2"
    >
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

      {/* =========================================================================
          1. HEADER (Section 3)
          ========================================================================= */}
      <InventoryHeader
        warehouse={warehouse}
        onWarehouseChange={setWarehouse}
        warehouses={availableWarehouses}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExport={handleExport}
        onRefresh={() => fetchDashboardData(true)}
        onAddInventory={() => setShowAddStockModal(true)}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* =========================================================================
          15. SEARCH & FILTERS BAR (Section 15)
          ========================================================================= */}
      <InventoryFilterBar
        search={search}
        onSearchChange={setSearch}
        warehouse={warehouse}
        onWarehouseChange={setWarehouse}
        warehouses={availableWarehouses}
        category={category}
        onCategoryChange={setCategory}
        categories={availableCategories}
        brand={brand}
        onBrandChange={setBrand}
        brands={availableBrands}
        supplier={supplier}
        onSupplierChange={setSupplier}
        suppliers={availableSuppliers}
        stockStatus={stockStatus}
        onStockStatusChange={setStockStatus}
        onResetFilters={handleResetFilters}
      />

      {/* =========================================================================
          2. INVENTORY ALERT CENTER (Section 4)
          ========================================================================= */}
      <div id="inventory-alert-center-section">
        <InventoryAlertCenter
          alerts={alert_center}
          onAlertAction={handleAlertAction}
        />
      </div>

      {/* =========================================================================
          3. KPI CARDS (Section 5)
          ========================================================================= */}
      <div id="kpi-cards-section">
        <InventoryKPICards
          kpi={kpi}
          onCardClick={(key) => {
            if (key === 'low_stock_items' || key === 'out_of_stock') {
              scrollToSection('low-stock-products-section');
            } else if (key === 'warehouse_utilization') {
              scrollToSection('warehouse-overview-section');
            } else if (key === 'inventory_value') {
              scrollToSection('inventory-value-section');
            }
          }}
        />
      </div>

      {/* =========================================================================
          4 & 5. STOCK MOVEMENT ANALYTICS & STOCK HEALTH (Sections 6 & 7)
          ========================================================================= */}
      <div id="stock-movement-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 4. Stock Movement (8 cols) */}
        <div className="lg:col-span-8">
          <StockMovementAnalytics
            movementData={stock_movement}
            timeframe={dateRange}
            onTimeframeChange={setDateRange}
          />
        </div>

        {/* 5. Stock Health (4 cols) */}
        <div className="lg:col-span-4">
          <StockHealthDonut stockHealth={stock_health} />
        </div>
      </div>

      {/* =========================================================================
          6 & 11. INVENTORY VALUE & CATEGORY INVENTORY (Sections 8 & 13)
          ========================================================================= */}
      <div id="inventory-value-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 6. Inventory Value Trend (6 cols) */}
        <div className="lg:col-span-6">
          <InventoryValuationCard valueStats={inventory_value} />
        </div>

        {/* 11. Category Inventory (6 cols) */}
        <div className="lg:col-span-6">
          <CategoryInventoryCard categories={category_inventory} />
        </div>
      </div>

      {/* =========================================================================
          7. WAREHOUSE OVERVIEW (Section 9)
          ========================================================================= */}
      <div id="warehouse-overview-section">
        <WarehouseOverviewCards warehouses={warehouse_overview} />
      </div>

      {/* =========================================================================
          8. LOW STOCK PRODUCTS (Section 10)
          ========================================================================= */}
      <div id="low-stock-products-section">
        <LowStockProductsTable
          lowStockProducts={low_stock_products}
          onRestockProduct={handleRestock}
        />
      </div>

      {/* =========================================================================
          9. TOP PERFORMING PRODUCTS (Section 11) - Full Width Table
          ========================================================================= */}
      <div id="top-products-section">
        <TopPerformingProductsTable products={top_products} />
      </div>

      {/* =========================================================================
          10. RECENT INVENTORY TRANSACTIONS (Section 12) - Full Width Table
          ========================================================================= */}
      <div id="recent-transactions-section">
        <RecentTransactionsTable transactions={recent_transactions} />
      </div>

      {/* =========================================================================
          12. QUICK ACTIONS TOOLBAR (Section 14) - Full Width 4x2 Grid
          ========================================================================= */}
      <div id="quick-actions-section">
        <QuickActionsToolbar
          onAddProduct={() => setShowAddProductModal(true)}
          onStockIn={() => setShowAddStockModal(true)}
          onStockOut={() => setShowAdjustmentModal(true)}
          onStockTransfer={() => setShowTransferModal(true)}
          onCreatePO={() => navigate('/app/procurement/orders')}
          onAddSupplier={() => navigate('/app/inventory/suppliers')}
          onViewLowStock={() => scrollToSection('low-stock-products-section')}
          onViewReports={() => handleExport('consolidated_audit')}
        />
      </div>

      {/* =========================================================================
          OPERATIONAL ACTION MODALS
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
          handleMutationSuccess('Stock added successfully to designated warehouse.');
        }}
      />

      <StockAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onSaved={() => {
          setShowAdjustmentModal(false);
          handleMutationSuccess('Stock adjustment logged and inventory balance updated.');
        }}
      />

      <StockTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSaved={() => {
          setShowTransferModal(false);
          handleMutationSuccess('Stock transfer scheduled and recorded in ledger.');
        }}
      />

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSaved={() => {
          setShowAddProductModal(false);
          handleMutationSuccess('New catalog product registered successfully.');
        }}
      />
    </motion.div>
  );
};

export default InventoryDashboard;
