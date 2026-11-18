import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Users,
  Building2,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Laptop,
  FileText,
  Calendar,
  Lock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { roleDashboardService } from '../../services/roleDashboardService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';

export default function LicensingManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter / Tab State
  const [activeTab, setActiveTab] = useState('licenses'); // 'licenses' | 'expiring' | 'allocations'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    software_name: '',
    license_type: 'subscription',
    seats_total: 10,
    issued_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    cost: '',
    vendor: '',
    customer_name: '',
    notes: '',
  });

  const [allocateForm, setAllocateForm] = useState({
    assigned_name: '',
    department: 'Engineering',
    device_id: '',
  });

  const [renewForm, setRenewForm] = useState({
    new_expiry_date: '',
    renewal_cost: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchDashboard = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await roleDashboardService.licensingManager.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load Licensing Manager dashboard:', err);
      setError(err.response?.data?.message || 'Unable to connect to Licensing Manager API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateLicense = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await roleDashboardService.licensingManager.createLicense(createForm);
      showToast('New software license registered successfully');
      setIsCreateModalOpen(false);
      setCreateForm({
        software_name: '',
        license_type: 'subscription',
        seats_total: 10,
        issued_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        cost: '',
        vendor: '',
        customer_name: '',
        notes: '',
      });
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create license', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAllocateSeat = async (e) => {
    e.preventDefault();
    if (!selectedLicense) return;
    try {
      setSubmitting(true);
      await roleDashboardService.licensingManager.allocateSeat({
        license_id: selectedLicense.id,
        ...allocateForm,
      });
      showToast(`Seat allocated to ${allocateForm.assigned_name} successfully`);
      setIsAllocateModalOpen(false);
      setAllocateForm({ assigned_name: '', department: 'Engineering', device_id: '' });
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to allocate seat', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenewLicense = async (e) => {
    e.preventDefault();
    if (!selectedLicense) return;
    try {
      setSubmitting(true);
      await roleDashboardService.licensingManager.renewLicense(selectedLicense.id, renewForm);
      showToast('License renewed successfully');
      setIsRenewModalOpen(false);
      setRenewForm({ new_expiry_date: '', renewal_cost: '' });
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to renew license', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (licenseId, newStatus) => {
    try {
      await roleDashboardService.licensingManager.updateStatus(licenseId, newStatus);
      showToast(`License status changed to ${newStatus}`);
      fetchDashboard(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <LoadingSkeleton type="kpi" count={4} />
        <LoadingSkeleton type="table" rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <ErrorState message={error} onRetry={() => fetchDashboard(false)} />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const allLicenses = data?.licenses || [];
  const expiringLicenses = data?.expiring_licenses || [];

  const filteredLicenses = allLicenses.filter((lic) => {
    const matchesSearch =
      lic.software_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.license_key?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || lic.license_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium flex items-center gap-2 animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Licensing Manager Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise software licenses, seat allocations, SaaS renewals, and client activation telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Add License
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Licenses */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Licenses</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.active_licenses || 0}</div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {kpis.total_licenses || 0} Total in Registry
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Expiring in 30 Days</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{kpis.expiring_soon || 0}</div>
            <span className="text-[11px] text-amber-600 font-medium">Requires Renewal Action</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Seat Utilization */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Seat Utilization</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{kpis.utilization_rate || 0}%</div>
            <span className="text-[11px] text-slate-500 font-medium">
              {kpis.allocated_seats || 0} / {kpis.total_seats || 0} Seats Active
            </span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total License Cost */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Annual Investment</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              ₹{(kpis.total_annual_cost || 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-indigo-600 font-medium">Software & Subscriptions</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('licenses')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'licenses'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Licenses ({allLicenses.length})
            </button>
            <button
              onClick={() => setActiveTab('expiring')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'expiring'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Expiring Soon ({expiringLicenses.length})
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search software, key, vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-64"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs border border-slate-200 rounded-xl outline-none text-slate-600 bg-white"
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="perpetual">Perpetual</option>
              <option value="seat_based">Seat Based</option>
              <option value="trial">Trial</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Software & License Key</th>
                <th className="py-3 px-4">Vendor & Beneficiary</th>
                <th className="py-3 px-4">Seats Allocated</th>
                <th className="py-3 px-4">Issued / Expiry Date</th>
                <th className="py-3 px-4">Type & Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(activeTab === 'expiring' ? expiringLicenses : filteredLicenses).length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                    No license records match your criteria.
                  </td>
                </tr>
              ) : (
                (activeTab === 'expiring' ? expiringLicenses : filteredLicenses).map((lic) => {
                  const isExpiringSoon =
                    lic.expiry_date &&
                    new Date(lic.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                    new Date(lic.expiry_date) >= new Date();

                  return (
                    <tr key={lic.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{lic.software_name}</div>
                        <div className="font-mono text-[11px] text-indigo-600 flex items-center gap-1 mt-0.5">
                          <Lock className="w-3 h-3 text-slate-400" /> {lic.license_key}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{lic.vendor || 'In-House Falcon'}</div>
                        <div className="text-slate-500 text-[11px]">{lic.customer_name || 'Internal'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {lic.seats_allocated} / {lic.seats_total}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({Math.round((lic.seats_allocated / (lic.seats_total || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${
                              lic.seats_allocated >= lic.seats_total ? 'bg-rose-500' : 'bg-indigo-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.round((lic.seats_allocated / (lic.seats_total || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800">
                          {lic.expiry_date ? (
                            <span className={isExpiringSoon ? 'text-amber-600 font-semibold' : ''}>
                              {lic.expiry_date}
                            </span>
                          ) : (
                            <span className="text-slate-400">Lifetime / Perpetual</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">Issued: {lic.issued_date || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {lic.license_type?.replace('_', ' ')}
                        </span>
                        {lic.cost > 0 && (
                          <div className="text-slate-600 font-semibold mt-1">₹{Number(lic.cost).toLocaleString()}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full font-medium text-[11px] ${
                            lic.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : lic.status === 'expired'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {lic.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedLicense(lic);
                              setIsAllocateModalOpen(true);
                            }}
                            title="Allocate Seat / Device"
                            className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          >
                            Allocate
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLicense(lic);
                              setRenewForm({
                                new_expiry_date: lic.expiry_date || '',
                                renewal_cost: lic.cost || '',
                              });
                              setIsRenewModalOpen(true);
                            }}
                            title="Renew License"
                            className="px-2 py-1 text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                          >
                            Renew
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE LICENSE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Register New Software License</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLicense} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Software / Platform Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AutoCAD 3D, Microsoft 365, Tally Prime"
                  value={createForm.software_name}
                  onChange={(e) => setCreateForm({ ...createForm, software_name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">License Type *</label>
                  <select
                    value={createForm.license_type}
                    onChange={(e) => setCreateForm({ ...createForm, license_type: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none bg-white"
                  >
                    <option value="subscription">Subscription</option>
                    <option value="perpetual">Perpetual (Lifetime)</option>
                    <option value="seat_based">Seat-Based Pool</option>
                    <option value="trial">Trial / Sandbox</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total Seats / Devices *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={createForm.seats_total}
                    onChange={(e) => setCreateForm({ ...createForm, seats_total: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Issued Date *</label>
                  <input
                    type="date"
                    required
                    value={createForm.issued_date}
                    onChange={(e) => setCreateForm({ ...createForm, issued_date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={createForm.expiry_date}
                    onChange={(e) => setCreateForm({ ...createForm, expiry_date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Vendor / Provider</label>
                  <input
                    type="text"
                    placeholder="e.g. Autodesk, Microsoft, In-House"
                    value={createForm.vendor}
                    onChange={(e) => setCreateForm({ ...createForm, vendor: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={createForm.cost}
                    onChange={(e) => setCreateForm({ ...createForm, cost: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Beneficiary / Customer Name</label>
                <input
                  type="text"
                  placeholder="Leave empty for Internal Corporate use"
                  value={createForm.customer_name}
                  onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                >
                  {submitting ? 'Registering...' : 'Register License'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALLOCATE SEAT MODAL */}
      {isAllocateModalOpen && selectedLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Allocate License Seat</h2>
                <p className="text-[11px] text-slate-500">{selectedLicense.software_name}</p>
              </div>
              <button
                onClick={() => setIsAllocateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAllocateSeat} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Staff / User Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={allocateForm.assigned_name}
                  onChange={(e) => setAllocateForm({ ...allocateForm, assigned_name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Project Engineering, QC, Accounts"
                  value={allocateForm.department}
                  onChange={(e) => setAllocateForm({ ...allocateForm, department: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Device ID / Hostname (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WS-LAP-402 or MAC Address"
                  value={allocateForm.device_id}
                  onChange={(e) => setAllocateForm({ ...allocateForm, device_id: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                >
                  {submitting ? 'Assigning...' : 'Assign Seat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENEW LICENSE MODAL */}
      {isRenewModalOpen && selectedLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Renew Software License</h2>
                <p className="text-[11px] text-slate-500">{selectedLicense.software_name}</p>
              </div>
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRenewLicense} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">New Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={renewForm.new_expiry_date}
                  onChange={(e) => setRenewForm({ ...renewForm, new_expiry_date: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Renewal Cost (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={renewForm.renewal_cost}
                  onChange={(e) => setRenewForm({ ...renewForm, renewal_cost: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                >
                  {submitting ? 'Renewing...' : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

