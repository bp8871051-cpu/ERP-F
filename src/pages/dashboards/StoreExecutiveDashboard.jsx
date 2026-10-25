import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  AlertTriangle,
  ArrowRightLeft,
  Warehouse,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Truck,
  RotateCcw,
  ShieldAlert,
  ChevronRight,
  Sliders,
  X,
} from 'lucide-react';
import { roleDashboardService } from '../../services/roleDashboardService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';

export default function StoreExecutiveDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Active Tab: 'movements' | 'requests' | 'inwards' | 'outwards' | 'alerts' | 'warehouses' | 'adjustments'
  const [activeTab, setActiveTab] = useState('movements');
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals: 'inward' | 'outward' | 'issue' | 'return' | 'transfer' | 'adjustment' | 'damage'
  const [modalType, setModalType] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [inwardForm, setInwardForm] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: 10,
    reference: '',
    unit_cost: 0,
    notes: '',
  });
  const [outwardForm, setOutwardForm] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: 5,
    reference: '',
    notes: '',
  });
  const [issueForm, setIssueForm] = useState({
    material_request_id: '',
    warehouse_id: '',
    notes: '',
  });
  const [returnForm, setReturnForm] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: 1,
    return_reason: 'Unused surplus material from site execution',
  });
  const [transferForm, setTransferForm] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    product_id: '',
    quantity: 5,
    notes: '',
  });
  const [adjustmentForm, setAdjustmentForm] = useState({
    warehouse_id: '',
    product_id: '',
    adjustment_type: 'decrease',
    quantity: 2,
    reason: 'Physical count discrepancy found in cycle audit',
    notes: 'Submitted for manager approval.',
  });
  const [damageForm, setDamageForm] = useState({
    product_id: '',
    warehouse_id: '',
    quantity: 1,
    damage_reason: 'Water/moisture corrosion found in secondary bin',
  });

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await roleDashboardService.storeExecutive.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load Store Executive dashboard:', err);
      setError(err.response?.data?.message || 'Unable to connect to Store Executive API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form Handlers
  const handleCreateInward = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.storeExecutive.createInward(inwardForm);
      showToast(res.message || 'Stock inward entry recorded successfully');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record stock inward', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOutward = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.storeExecutive.createOutward(outwardForm);
      showToast(res.message || 'Stock outward entry recorded successfully');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record stock outward', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueMaterial = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.storeExecutive.issueMaterial(issueForm);
      showToast(res.message || 'Material requisition issued and stock deducted');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to issue material', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordReturn = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.storeExecutive.recordMaterialReturn(returnForm);
      showToast(res.message || 'Material return recorded and stock restored');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record return', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.storeExecutive.requestTransfer(transferForm);
      showToast(res.message || 'Stock transfer request created');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request transfer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.storeExecutive.submitAdjustment(adjustmentForm);
      showToast(res.message || 'Stock adjustment request submitted for Manager approval');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit adjustment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordDamage = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await roleDashboardService.storeExecutive.recordDamaged(damageForm);
      showToast(res.message || 'Damaged stock quarantined successfully');
      setModalType(null);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record damaged stock', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={() => fetchDashboard()} />;

  const { cards, sections, lookups } = data;

  const filteredMovements = (sections.recent_stock_movements || []).filter((m) => {
    const matchesType = movementTypeFilter === 'all' || m.type === movementTypeFilter || m.movement_type === movementTypeFilter;
    const matchesSearch =
      !searchQuery ||
      m.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.warehouse?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-500" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4 text-emerald-400" />
            Inventory, Storage & Logistics Control
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Store Executive Dashboard</h1>
          <p className="text-xs text-emerald-100/80 mt-1">
            Manage material inward/outward slips, issue spare parts & project requests, inter-warehouse transfers, and physical audits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setInwardForm({
                product_id: lookups.products?.[0]?.id || '',
                warehouse_id: lookups.warehouses?.[0]?.id || '',
                quantity: 10,
                reference: 'INW-' + Date.now().toString().slice(-6),
                unit_cost: lookups.products?.[0]?.cost || 0,
                notes: 'Stock received at main engineering bay',
              });
              setModalType('inward');
            }}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            Receive Inward
          </button>

          <button
            onClick={() => {
              setOutwardForm({
                product_id: lookups.products?.[0]?.id || '',
                warehouse_id: lookups.warehouses?.[0]?.id || '',
                quantity: 5,
                reference: 'OUT-' + Date.now().toString().slice(-6),
                notes: 'Direct material dispatch',
              });
              setModalType('outward');
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Stock Outward
          </button>

          <button
            onClick={() => {
              setTransferForm({
                from_warehouse_id: lookups.warehouses?.[0]?.id || '',
                to_warehouse_id: lookups.warehouses?.[1]?.id || lookups.warehouses?.[0]?.id || '',
                product_id: lookups.products?.[0]?.id || '',
                quantity: 5,
                notes: 'Warehouse reallocation transfer',
              });
              setModalType('transfer');
            }}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer Stock
          </button>

          <button
            onClick={() => {
              setAdjustmentForm({
                warehouse_id: lookups.warehouses?.[0]?.id || '',
                product_id: lookups.products?.[0]?.id || '',
                adjustment_type: 'decrease',
                quantity: 2,
                reason: 'Discrepancy observed during physical audit',
                notes: 'Awaiting manager sign-off',
              });
              setModalType('adjustment');
            }}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            Adjustment Req
          </button>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition"
            title="Refresh Store Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Items */}
        <div
          onClick={() => setActiveTab('movements')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-emerald-400 hover:shadow-md cursor-pointer transition space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Items</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">{cards.total_stock_items}</div>
          <div className="text-[10px] text-slate-400">Total catalog items</div>
        </div>

        {/* 2. Available Units */}
        <div
          onClick={() => setActiveTab('warehouses')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-emerald-400 hover:shadow-md cursor-pointer transition space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">In Stock</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700">{cards.total_available_stock}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Available across bins</div>
        </div>

        {/* 3. Inward Today */}
        <div
          onClick={() => setActiveTab('inwards')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-blue-400 hover:shadow-md cursor-pointer transition space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inward Today</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-blue-700">+{cards.today_stock_inward}</div>
          <div className="text-[10px] text-blue-600 font-medium">Received today</div>
        </div>

        {/* 4. Outward Today */}
        <div
          onClick={() => setActiveTab('outwards')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-indigo-400 hover:shadow-md cursor-pointer transition space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Outward Today</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-700">-{cards.today_stock_outward}</div>
          <div className="text-[10px] text-indigo-600 font-medium">Dispatched today</div>
        </div>

        {/* 5. Material Requests */}
        <div
          onClick={() => setActiveTab('requests')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-purple-400 hover:shadow-md cursor-pointer transition space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Material Reqs</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-700">{cards.pending_material_requests}</div>
          <div className="text-[10px] text-purple-600 font-medium">Waiting for issue</div>
        </div>

        {/* 6. Low Stock */}
        <div
          onClick={() => setActiveTab('alerts')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-rose-400 hover:shadow-md cursor-pointer transition space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Low Stock</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-700">{cards.low_stock_items}</div>
          <div className="text-[10px] text-rose-600 font-medium">Below min limit</div>
        </div>

        {/* 7. Transfers */}
        <div
          onClick={() => setActiveTab('warehouses')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-cyan-400 hover:shadow-md cursor-pointer transition space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transfers</span>
            <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-cyan-700">{cards.pending_stock_transfers}</div>
          <div className="text-[10px] text-cyan-600 font-medium">In transit</div>
        </div>

        {/* 8. Damaged / Held */}
        <div
          onClick={() => setActiveTab('adjustments')}
          className="p-4 bg-white border border-slate-200/80 rounded-xl hover:border-amber-400 hover:shadow-md cursor-pointer transition space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Damaged</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-700">{cards.damaged_held_stock}</div>
          <div className="text-[10px] text-amber-600 font-medium">Quarantined units</div>
        </div>
      </div>

      {/* Middle Grid: Pending Material Issue Requests (Priority Workflow) + Warehouse Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Material Issue Requisitions from Service & Project Engineers */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Pending Material Issue Requests ({sections.pending_material_issue_requests?.length || 0})
              </h2>
            </div>
            <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold">
              Service & Project Requisitions
            </span>
          </div>

          {sections.pending_material_issue_requests && sections.pending_material_issue_requests.length > 0 ? (
            <div className="space-y-3">
              {sections.pending_material_issue_requests.map((mr) => (
                <div
                  key={mr.id}
                  className="p-3.5 bg-purple-50/40 border border-purple-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="text-purple-700 font-mono">{mr.request_number}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-white border border-purple-200 text-purple-800">
                        {mr.request_type?.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          mr.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {mr.priority}
                      </span>
                    </div>

                    <div className="mt-1 text-slate-700 font-medium">
                      Requested by: <span className="text-slate-900 font-bold">{mr.requester?.name || 'Engineer'}</span>
                      {mr.site_location && <span className="ml-2 text-slate-500">| Site: {mr.site_location}</span>}
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {(mr.items || []).map((it, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-semibold text-slate-800">
                          {it.product?.name || 'Item'} × {it.quantity_requested} {it.unit}
                        </span>
                      ))}
                    </div>

                    {mr.notes && <p className="text-[11px] text-slate-500 italic mt-1">{mr.notes}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setIssueForm({
                          material_request_id: mr.id,
                          warehouse_id: mr.warehouse_id || lookups.warehouses?.[0]?.id || '',
                          notes: 'Issued by Store Executive',
                        });
                        setSelectedRequest(mr);
                        setModalType('issue');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Issue Material
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
              No pending material requests from field or project engineers.
            </div>
          )}
        </div>

        {/* Right Col: Warehouse Stock Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Warehouse className="w-4 h-4 text-emerald-600" />
              Warehouse Locations Summary
            </h3>
            <span className="text-[11px] text-slate-400">{sections.warehouse_wise_stock_summary?.length || 0} Sites</span>
          </div>

          <div className="space-y-3">
            {(sections.warehouse_wise_stock_summary || []).map((w) => (
              <div key={w.id} className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{w.name}</span>
                  <span className="text-emerald-700 font-bold">{w.total_units} units</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="font-mono text-slate-400">[{w.code}]</span> {w.location}
                </div>
              </div>
            ))}
          </div>

          {/* Low Stock Quick Warning Card */}
          <div className="pt-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between text-rose-800 font-bold">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Low Stock Alerts
                </span>
                <span>{cards.low_stock_items} items</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Products currently at or below minimum reorder thresholds.
              </p>
              <button
                onClick={() => setActiveTab('alerts')}
                className="mt-1 text-[11px] text-rose-900 font-bold hover:underline flex items-center gap-1"
              >
                View Low Stock List <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section for Deep Tables */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 p-4 gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'movements' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Stock Movements Log ({sections.recent_stock_movements?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('inwards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'inwards' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Recent Inwards ({sections.recent_inward_transactions?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('outwards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'outwards' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Recent Outwards ({sections.recent_outward_transactions?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'alerts' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock Warnings ({sections.low_stock_alerts?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('adjustments')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'adjustments' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Count Discrepancies ({sections.physical_stock_count_differences?.length || 0})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reference, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
            />
          </div>
        </div>

        {/* Tab Content: Movements */}
        {activeTab === 'movements' && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-xs overflow-x-auto">
              <span className="text-slate-400 font-medium">Type filter:</span>
              {['all', 'in', 'out', 'transfer', 'damage'].map((t) => (
                <button
                  key={t}
                  onClick={() => setMovementTypeFilter(t)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase transition ${
                    movementTypeFilter === t ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Product Name & SKU</th>
                    <th className="p-3">Movement Type</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Warehouse</th>
                    <th className="p-3">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-emerald-700 font-mono">{m.reference || 'REF-' + m.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{m.product?.name || 'Product'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">SKU: {m.product?.sku || 'N/A'}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.quantity_in > 0 ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {m.movement_type || m.type}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        {m.quantity_in > 0 ? (
                          <span className="text-blue-700">+{m.quantity_in} units</span>
                        ) : (
                          <span className="text-indigo-700">-{m.quantity_out} units</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700">{m.warehouse?.name || 'Warehouse A'}</td>
                      <td className="p-3 text-slate-400 text-[11px]">{new Date(m.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Low Stock Alerts */}
        {activeTab === 'alerts' && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Current Stock</th>
                    <th className="p-3">Alert Threshold</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(sections.low_stock_alerts || []).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 font-mono text-slate-500">{p.sku}</td>
                      <td className="p-3 font-bold text-rose-700">{p.quantity} units</td>
                      <td className="p-3 font-semibold text-slate-500">{p.alert_quantity || 10} units</td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setInwardForm({
                              product_id: p.id,
                              warehouse_id: lookups.warehouses?.[0]?.id || '',
                              quantity: 20,
                              reference: 'INW-REPLENISH-' + Date.now().toString().slice(-4),
                              unit_cost: p.cost || 0,
                              notes: 'Stock replenishment for low inventory alert',
                            });
                            setModalType('inward');
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-[11px] transition"
                        >
                          Replenish Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Inwards */}
        {activeTab === 'inwards' && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Inward Reference</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Quantity Received</th>
                    <th className="p-3">Warehouse</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(sections.recent_inward_transactions || []).map((inw) => (
                    <tr key={inw.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-blue-700 font-mono">{inw.reference}</td>
                      <td className="p-3 font-semibold text-slate-900">{inw.product?.name}</td>
                      <td className="p-3 font-bold text-blue-600">+{inw.quantity_in} units</td>
                      <td className="p-3 text-slate-600">{inw.warehouse?.name}</td>
                      <td className="p-3 text-slate-400">{new Date(inw.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Outwards */}
        {activeTab === 'outwards' && (
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Outward Reference</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Quantity Dispatched</th>
                    <th className="p-3">Warehouse</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(sections.recent_outward_transactions || []).map((outw) => (
                    <tr key={outw.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-indigo-700 font-mono">{outw.reference}</td>
                      <td className="p-3 font-semibold text-slate-900">{outw.product?.name}</td>
                      <td className="p-3 font-bold text-indigo-600">-{outw.quantity_out} units</td>
                      <td className="p-3 text-slate-600">{outw.warehouse?.name}</td>
                      <td className="p-3 text-slate-400">{new Date(outw.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Adjustments */}
        {activeTab === 'adjustments' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Physical Inventory Audit Adjustments
              </h4>
              <button
                onClick={() => setModalType('adjustment')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Submit Adjustment Request
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Adjustment #</th>
                    <th className="p-3">Warehouse</th>
                    <th className="p-3">Audit Reason</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Approval Status</th>
                    <th className="p-3">Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(sections.physical_stock_count_differences || []).map((adj) => (
                    <tr key={adj.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-mono font-bold text-amber-700">{adj.reference_number}</td>
                      <td className="p-3 text-slate-800">{adj.warehouse?.name}</td>
                      <td className="p-3 text-slate-600">{adj.reason}</td>
                      <td className="p-3 uppercase text-[10px] font-bold">{adj.adjustment_type}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase">
                          {adj.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{adj.creator?.name || 'Store Executive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* QUICK ACTION MODALS */}

      {/* Modal 1: Inward */}
      <AnimatePresence>
        {modalType === 'inward' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> Record Stock Inward Entry
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInward} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product *</label>
                  <select
                    value={inwardForm.product_id}
                    onChange={(e) => setInwardForm({ ...inwardForm, product_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                    required
                  >
                    <option value="">Select product...</option>
                    {(lookups.products || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Warehouse *</label>
                    <select
                      value={inwardForm.warehouse_id}
                      onChange={(e) => setInwardForm({ ...inwardForm, warehouse_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select warehouse...</option>
                      {(lookups.warehouses || []).map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity Received *</label>
                    <input
                      type="number"
                      min="1"
                      value={inwardForm.quantity}
                      onChange={(e) => setInwardForm({ ...inwardForm, quantity: parseInt(e.target.value, 10) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference / PO Slip Number</label>
                  <input
                    type="text"
                    value={inwardForm.reference}
                    onChange={(e) => setInwardForm({ ...inwardForm, reference: e.target.value })}
                    placeholder="e.g. INW-PO-8821"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={inwardForm.notes}
                    onChange={(e) => setInwardForm({ ...inwardForm, notes: e.target.value })}
                    placeholder="Supplier delivery notes, bin location..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Recording...' : 'Record Inward'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Outward */}
      <AnimatePresence>
        {modalType === 'outward' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" /> Create Stock Outward Entry
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOutward} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product *</label>
                  <select
                    value={outwardForm.product_id}
                    onChange={(e) => setOutwardForm({ ...outwardForm, product_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  >
                    <option value="">Select product...</option>
                    {(lookups.products || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Available: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Warehouse *</label>
                    <select
                      value={outwardForm.warehouse_id}
                      onChange={(e) => setOutwardForm({ ...outwardForm, warehouse_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select warehouse...</option>
                      {(lookups.warehouses || []).map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantity Dispatched *</label>
                    <input
                      type="number"
                      min="1"
                      value={outwardForm.quantity}
                      onChange={(e) => setOutwardForm({ ...outwardForm, quantity: parseInt(e.target.value, 10) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Outward Slip Reference</label>
                  <input
                    type="text"
                    value={outwardForm.reference}
                    onChange={(e) => setOutwardForm({ ...outwardForm, reference: e.target.value })}
                    placeholder="e.g. OUT-DISPATCH-1029"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes / Destination</label>
                  <input
                    type="text"
                    value={outwardForm.notes}
                    onChange={(e) => setOutwardForm({ ...outwardForm, notes: e.target.value })}
                    placeholder="Site project delivery, carrier details..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Dispatching...' : 'Confirm Outward'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Issue Material */}
      <AnimatePresence>
        {modalType === 'issue' && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Issue Requisition {selectedRequest.request_number}
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleIssueMaterial} className="p-5 space-y-3.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-900">Requester: {selectedRequest.requester?.name}</p>
                  <p className="text-slate-500">Destination: {selectedRequest.site_location || 'Field'}</p>
                  <div className="pt-1 mt-1 border-t border-slate-200 font-medium text-slate-700">
                    Items to Issue:
                    <ul className="list-disc list-inside mt-0.5">
                      {(selectedRequest.items || []).map((it, idx) => (
                        <li key={idx}>
                          {it.product?.name} - Qty: {it.quantity_requested} {it.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue From Warehouse *</label>
                  <select
                    value={issueForm.warehouse_id}
                    onChange={(e) => setIssueForm({ ...issueForm, warehouse_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {(lookups.warehouses || []).map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store Issue Notes</label>
                  <input
                    type="text"
                    value={issueForm.notes}
                    onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                    placeholder="Handed over to field driver, gate pass #..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Processing...' : 'Authorize Issue & Deduct Stock'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Request Transfer */}
      <AnimatePresence>
        {modalType === 'transfer' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-600" /> Request Stock Transfer
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRequestTransfer} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product *</label>
                  <select
                    value={transferForm.product_id}
                    onChange={(e) => setTransferForm({ ...transferForm, product_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                    required
                  >
                    <option value="">Select product...</option>
                    {(lookups.products || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">From Warehouse *</label>
                    <select
                      value={transferForm.from_warehouse_id}
                      onChange={(e) => setTransferForm({ ...transferForm, from_warehouse_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select source...</option>
                      {(lookups.warehouses || []).map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">To Warehouse *</label>
                    <select
                      value={transferForm.to_warehouse_id}
                      onChange={(e) => setTransferForm({ ...transferForm, to_warehouse_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select destination...</option>
                      {(lookups.warehouses || []).map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transfer Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Requesting...' : 'Submit Transfer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 5: Submit Adjustment Request (Manager Approval Workflow) */}
      <AnimatePresence>
        {modalType === 'adjustment' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" /> Submit Stock Adjustment Request
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitAdjustment} className="p-5 space-y-3.5 text-xs">
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                  <strong>Policy Restriction:</strong> Store Executives cannot self-approve stock adjustments. Submitting this request places it in pending status for Manager authorization.
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product *</label>
                  <select
                    value={adjustmentForm.product_id}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, product_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold"
                    required
                  >
                    <option value="">Select product...</option>
                    {(lookups.products || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current: {p.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Adjustment Type</label>
                    <select
                      value={adjustmentForm.adjustment_type}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adjustment_type: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-semibold"
                    >
                      <option value="decrease">Decrease Stock (Missing/Damage)</option>
                      <option value="increase">Increase Stock (Found/Surplus)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Discrepancy Units *</label>
                    <input
                      type="number"
                      min="1"
                      value={adjustmentForm.quantity}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: parseInt(e.target.value, 10) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audit Discrepancy Reason *</label>
                  <input
                    type="text"
                    value={adjustmentForm.reason}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold shadow-xs"
                  >
                    {submitting ? 'Submitting...' : 'Submit for Manager Approval'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
