import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  UserCheck,
  Wrench,
  Download,
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Tag,
  Building2,
  MapPin,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import assetService from '../../services/assetService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const AssetRegister = () => {
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & Pagination
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [newAsset, setNewAsset] = useState({
    name: '',
    asset_code: `AST-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    category_id: '',
    subcategory: '',
    serial_number: '',
    model_number: '',
    brand: '',
    vendor: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_invoice: '',
    purchase_cost: '',
    tax: '0',
    total_cost: '',
    warranty_start: '',
    warranty_end: '',
    useful_life_years: '5',
    depreciation_method: 'straight_line',
    salvage_value: '0',
    department: 'IT Infrastructure',
    location: 'Headquarters Floor 3',
    status: 'available',
    notes: '',
  });

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [page, search, selectedCategory, selectedDepartment, selectedStatus]);

  const fetchLookups = async () => {
    try {
      const res = await assetService.getLookups();
      const data = res.data || res;
      if (data.categories) setCategories(data.categories);
      if (data.departments) setDepartments(data.departments);
      if (data.locations) setLocations(data.locations);
    } catch (err) {
      console.warn('Could not load asset lookups:', err);
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: 15,
        search,
        category_id: selectedCategory || undefined,
        department: selectedDepartment || undefined,
        status: selectedStatus || undefined,
      };
      const res = await assetService.getAssets(params);
      const data = res.data || res;
      setAssets(data.data || data || []);
      setTotalPages(data.last_page || 1);
      setTotalCount(data.total || (data.data ? data.data.length : (data.length || 0)));
    } catch (err) {
      console.error('Failed to fetch assets register:', err);
      setError('Unable to load asset register records.');
    } finally {
      setLoading(false);
    }
  };

  const handleCostChange = (costVal, taxVal) => {
    const cost = parseFloat(costVal) || 0;
    const tax = parseFloat(taxVal) || 0;
    const total = cost + tax;
    setNewAsset((prev) => ({
      ...prev,
      purchase_cost: costVal,
      tax: taxVal,
      total_cost: total.toFixed(2),
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.purchase_cost) {
      setFormError('Asset Name and Purchase Cost are required.');
      return;
    }
    try {
      setSubmitting(true);
      setFormError('');
      await assetService.createAsset({
        ...newAsset,
        purchase_cost: parseFloat(newAsset.purchase_cost),
        tax: parseFloat(newAsset.tax || 0),
        total_cost: parseFloat(newAsset.total_cost || newAsset.purchase_cost),
        useful_life_years: parseInt(newAsset.useful_life_years, 10),
        salvage_value: parseFloat(newAsset.salvage_value || 0),
      });

      setShowCreateModal(false);
      // Reset form
      setNewAsset({
        name: '',
        asset_code: `AST-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        category_id: '',
        subcategory: '',
        serial_number: '',
        model_number: '',
        brand: '',
        vendor: '',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_invoice: '',
        purchase_cost: '',
        tax: '0',
        total_cost: '',
        warranty_start: '',
        warranty_end: '',
        useful_life_years: '5',
        depreciation_method: 'straight_line',
        salvage_value: '0',
        department: 'IT Infrastructure',
        location: 'Headquarters Floor 3',
        status: 'available',
        notes: '',
      });
      await fetchAssets();
    } catch (err) {
      console.error('Error creating asset:', err);
      setFormError(err.response?.data?.message || 'Error saving new asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete asset "${name}"?`)) return;
    try {
      await assetService.deleteAsset(id);
      await fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusBadge = (status) => {
    const s = (status || 'available').toLowerCase();
    switch (s) {
      case 'available':
        return <Badge variant="success">AVAILABLE</Badge>;
      case 'assigned':
        return <Badge variant="info">ASSIGNED</Badge>;
      case 'under maintenance':
      case 'maintenance':
        return <Badge variant="warning">UNDER MAINTENANCE</Badge>;
      case 'damaged':
      case 'lost':
        return <Badge variant="danger">{s.toUpperCase()}</Badge>;
      case 'disposed':
      case 'retired':
        return <Badge variant="default">{s.toUpperCase()}</Badge>;
      default:
        return <Badge variant="default">{status?.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" />
            Fixed Asset Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Master repository of enterprise capital assets, custody, locations, and depreciation balances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" /> Register New Asset
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by asset name, code, serial number..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-teal-500"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-teal-500 font-medium text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-teal-500 font-medium text-slate-700"
            >
              <option value="">All Departments</option>
              {departments.map((d, i) => (
                <option key={i} value={typeof d === 'string' ? d : d.name}>
                  {typeof d === 'string' ? d : d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-teal-500 font-medium text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="under maintenance">Under Maintenance</option>
              <option value="lost">Lost</option>
              <option value="damaged">Damaged</option>
              <option value="disposed">Disposed</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Assets Table */}
      <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset ID / Code</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Serial No</th>
                <th className="py-3 px-3">Purchase Date</th>
                <th className="py-3 px-3 text-right">Purchase Cost</th>
                <th className="py-3 px-3 text-right">Current Book Val</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Assigned To</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="12" className="py-3 px-4">
                      <LoadingSkeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : assets.length > 0 ? (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {asset.asset_code || `AST-${asset.id}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 hover:text-teal-600 cursor-pointer" onClick={() => navigate(`/app/assets/${asset.id}`)}>
                        {asset.name}
                      </div>
                      {asset.brand && (
                        <div className="text-[10px] text-slate-400">
                          {asset.brand} {asset.model_number ? `• ${asset.model_number}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {asset.category?.name || asset.category_name || 'General'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{asset.serial_number || '—'}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-800">
                      {formatCurrency(asset.purchase_cost || asset.total_cost)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-teal-700">
                      {formatCurrency(asset.current_book_value || asset.book_value || asset.purchase_cost)}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{asset.department || '—'}</td>
                    <td className="py-3 px-3">
                      {asset.assigned_to_user ? (
                        <span className="font-medium text-slate-800">{asset.assigned_to_user.name}</span>
                      ) : asset.assigned_to_employee ? (
                        <span className="font-medium text-slate-800">{asset.assigned_to_employee.name}</span>
                      ) : asset.assigned_to ? (
                        <span className="font-medium text-slate-800">{asset.assigned_to}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-[120px]">{asset.location || 'HQ'}</td>
                    <td className="py-3 px-3 text-center">{getStatusBadge(asset.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/assets/${asset.id}`)}
                          title="View Details"
                          className="p-1 text-slate-500 hover:text-teal-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(asset.id, asset.name)}
                          title="Delete Asset"
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="py-8 text-center text-slate-400">
                    <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No assets found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total: <strong>{totalCount}</strong> assets registered
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Register Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Boxes className="w-4 h-4 text-teal-400" />
                Register Capital Asset
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {formError}
                </div>
              )}

              {/* Section 1: Basic Info */}
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-teal-700">
                  1. Asset Identification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Asset Name *</label>
                    <input
                      type="text"
                      required
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      placeholder="e.g. MacBook Pro M3 Max 16-inch"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Asset Code (Auto)</label>
                    <input
                      type="text"
                      value={newAsset.asset_code}
                      onChange={(e) => setNewAsset({ ...newAsset, asset_code: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono bg-slate-50 focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={newAsset.category_id}
                      onChange={(e) => setNewAsset({ ...newAsset, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subcategory</label>
                    <input
                      type="text"
                      value={newAsset.subcategory}
                      onChange={(e) => setNewAsset({ ...newAsset, subcategory: e.target.value })}
                      placeholder="e.g. Laptops"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand / Manufacturer</label>
                    <input
                      type="text"
                      value={newAsset.brand}
                      onChange={(e) => setNewAsset({ ...newAsset, brand: e.target.value })}
                      placeholder="e.g. Apple Inc."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                    <input
                      type="text"
                      value={newAsset.serial_number}
                      onChange={(e) => setNewAsset({ ...newAsset, serial_number: e.target.value })}
                      placeholder="e.g. C02G45TYMD6R"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Model Number</label>
                    <input
                      type="text"
                      value={newAsset.model_number}
                      onChange={(e) => setNewAsset({ ...newAsset, model_number: e.target.value })}
                      placeholder="e.g. A2991"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Vendor / Supplier</label>
                    <input
                      type="text"
                      value={newAsset.vendor}
                      onChange={(e) => setNewAsset({ ...newAsset, vendor: e.target.value })}
                      placeholder="e.g. Apple India Retail"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Purchase & Financials */}
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-teal-700">
                  2. Purchase & Valuation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Purchase Date *</label>
                    <input
                      type="date"
                      required
                      value={newAsset.purchase_date}
                      onChange={(e) => setNewAsset({ ...newAsset, purchase_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Purchase Cost (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newAsset.purchase_cost}
                      onChange={(e) => handleCostChange(e.target.value, newAsset.tax)}
                      placeholder="120000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tax Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAsset.tax}
                      onChange={(e) => handleCostChange(newAsset.purchase_cost, e.target.value)}
                      placeholder="21600"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Capitalized (₹)</label>
                    <input
                      type="text"
                      readOnly
                      value={newAsset.total_cost}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-bold text-teal-700"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Depreciation Parameters */}
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-teal-700">
                  3. Depreciation Engine Settings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Useful Life (Years)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newAsset.useful_life_years}
                      onChange={(e) => setNewAsset({ ...newAsset, useful_life_years: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Depreciation Method</label>
                    <select
                      value={newAsset.depreciation_method}
                      onChange={(e) => setNewAsset({ ...newAsset, depreciation_method: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                    >
                      <option value="straight_line">Straight Line (SLM)</option>
                      <option value="declining_balance">Declining Balance (WDV)</option>
                      <option value="double_declining">Double Declining Balance</option>
                      <option value="units_of_production">Units of Production</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Salvage Value (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newAsset.salvage_value}
                      onChange={(e) => setNewAsset({ ...newAsset, salvage_value: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Custody & Location */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-teal-700">
                  4. Department, Location & Warranty
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={newAsset.department}
                      onChange={(e) => setNewAsset({ ...newAsset, department: e.target.value })}
                      placeholder="IT Infrastructure"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Physical Location</label>
                    <input
                      type="text"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                      placeholder="Headquarters Floor 3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                    <select
                      value={newAsset.status}
                      onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500 capitalize"
                    >
                      <option value="available">Available</option>
                      <option value="assigned">Assigned</option>
                      <option value="under maintenance">Under Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Warranty Start</label>
                    <input
                      type="date"
                      value={newAsset.warranty_start}
                      onChange={(e) => setNewAsset({ ...newAsset, warranty_start: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Warranty End</label>
                    <input
                      type="date"
                      value={newAsset.warranty_end}
                      onChange={(e) => setNewAsset({ ...newAsset, warranty_end: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Purchase Invoice Ref</label>
                    <input
                      type="text"
                      value={newAsset.purchase_invoice}
                      onChange={(e) => setNewAsset({ ...newAsset, purchase_invoice: e.target.value })}
                      placeholder="INV-APL-2026-908"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block font-semibold text-slate-700 mb-1">Notes / Description</label>
                  <textarea
                    rows="2"
                    value={newAsset.notes}
                    onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                    placeholder="Asset details, specifications, accessories included..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {submitting ? 'Registering...' : 'Register Asset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetRegister;
