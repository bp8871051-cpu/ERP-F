import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  DollarSign,
  TrendingDown,
  UserCheck,
  Wrench,
  Trash2,
  Calendar,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  Tag,
  CheckCircle,
  Layers,
  History,
  Activity,
  Edit,
  RotateCcw,
} from 'lucide-react';
import assetService from '../../services/assetService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'depreciation' | 'assignments' | 'maintenance' | 'audit'

  // Modals for Actions
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDisposalModal, setShowDisposalModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [assignForm, setAssignForm] = useState({
    assigned_to: '',
    department: '',
    location: '',
    expected_return_date: '',
    condition: 'good',
    notes: '',
  });

  const [returnForm, setReturnForm] = useState({
    return_date: new Date().toISOString().split('T')[0],
    condition: 'good',
    notes: '',
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenance_type: 'preventive',
    priority: 'medium',
    issue: '',
    description: '',
    vendor: '',
    technician: '',
    start_date: new Date().toISOString().split('T')[0],
    estimated_cost: '',
  });

  const [disposalForm, setDisposalForm] = useState({
    disposal_type: 'sell',
    disposal_date: new Date().toISOString().split('T')[0],
    sale_value: '0',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const res = await assetService.getAssetDetails(id);
      const data = res.data || res;
      setAsset(data);
      if (data) {
        setAssignForm((prev) => ({
          ...prev,
          department: data.department || '',
          location: data.location || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load asset details:', err);
      setError('Unable to load asset details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.assigned_to) {
      alert('Please specify the person or employee assigned to.');
      return;
    }
    try {
      setActionLoading(true);
      await assetService.assignAsset(id, assignForm);
      setShowAssignModal(false);
      await fetchAsset();
    } catch (err) {
      alert(err.response?.data?.message || 'Error assigning asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await assetService.returnAsset(id, returnForm);
      setShowReturnModal(false);
      await fetchAsset();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing asset return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await assetService.createMaintenanceTicket({
        asset_id: id,
        ...maintenanceForm,
        estimated_cost: parseFloat(maintenanceForm.estimated_cost || 0),
      });
      setShowMaintenanceModal(false);
      await fetchAsset();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating maintenance ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisposalSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await assetService.createDisposal({
        asset_id: id,
        ...disposalForm,
        sale_value: parseFloat(disposalForm.sale_value || 0),
      });
      setShowDisposalModal(false);
      await fetchAsset();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating disposal request');
    } finally {
      setActionLoading(false);
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

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
          <LoadingSkeleton className="h-24" />
        </div>
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <Card className="p-8 text-center bg-white shadow-xs border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800 mb-1">Asset Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">{error || 'Asset record could not be loaded.'}</p>
        <Button variant="secondary" onClick={() => navigate('/app/assets/register')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Asset Register
        </Button>
      </Card>
    );
  }

  const assignments = asset.assignments || asset.assignment_history || [];
  const depreciations = asset.depreciations || asset.depreciation_schedules || [];
  const maintenanceRecords = asset.maintenance || asset.maintenance_tickets || [];
  const auditLogs = asset.audit_logs || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/assets/register')}
            className="text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Register
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{asset.name}</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                {asset.asset_code || `AST-${asset.id}`}
              </span>
              {getStatusBadge(asset.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: {asset.category?.name || 'General'} • Brand: {asset.brand || 'N/A'} • Serial:{' '}
              {asset.serial_number || 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {asset.status === 'available' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAssignModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" /> Assign Asset
            </Button>
          )}

          {asset.status === 'assigned' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowReturnModal(true)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-teal-600" /> Return to Custody
            </Button>
          )}

          {asset.status !== 'disposed' && asset.status !== 'retired' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMaintenanceModal(true)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
              >
                <Wrench className="w-3.5 h-3.5 mr-1 text-amber-600" /> Maintenance
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDisposalModal(true)}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" /> Dispose
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Purchase Cost</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(asset.purchase_cost || asset.total_cost)}</p>
          <span className="text-[11px] text-slate-400">
            Invoice: {asset.purchase_invoice || 'N/A'}
          </span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Book Value</span>
          <p className="text-lg font-bold text-teal-600 mt-1">
            {formatCurrency(asset.current_book_value || asset.book_value || asset.purchase_cost)}
          </p>
          <span className="text-[11px] text-teal-600 font-medium">Current balance</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Accum. Depreciation</span>
          <p className="text-lg font-bold text-amber-600 mt-1">
            {formatCurrency(asset.accumulated_depreciation || 0)}
          </p>
          <span className="text-[11px] text-slate-400">Amortized over {asset.useful_life_years || 5} yrs</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Salvage Value</span>
          <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(asset.salvage_value || 0)}</p>
          <span className="text-[11px] text-slate-400">Residual value at end of life</span>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4">
        {[
          { id: 'overview', label: 'Specifications & Info', icon: Boxes },
          { id: 'depreciation', label: 'Depreciation Schedule', icon: TrendingDown },
          { id: 'assignments', label: 'Custody & Assignments', icon: UserCheck },
          { id: 'maintenance', label: 'Maintenance History', icon: Wrench },
          { id: 'audit', label: 'Audit Timeline', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-teal-600 text-teal-600 bg-teal-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Info Card */}
          <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">General Specifications</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Brand / Manufacturer</span>
                <span className="font-semibold text-slate-800">{asset.brand || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Model Number</span>
                <span className="font-semibold text-slate-800">{asset.model_number || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Serial Number</span>
                <span className="font-mono font-semibold text-slate-800">{asset.serial_number || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Subcategory</span>
                <span className="font-semibold text-slate-800">{asset.subcategory || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-semibold text-slate-800">{asset.department || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Physical Location</span>
                <span className="font-semibold text-slate-800">{asset.location || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Custodian</span>
                <span className="font-semibold text-teal-700">
                  {asset.assigned_to_user?.name || asset.assigned_to || 'Unassigned (In Store)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Depreciation Method</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {asset.depreciation_method ? asset.depreciation_method.replace('_', ' ') : 'Straight Line'}
                </span>
              </div>
            </div>

            {asset.notes && (
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 block text-[11px] mb-1">Asset Notes</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg">{asset.notes}</p>
              </div>
            )}
          </Card>

          {/* Purchase & Warranty Card */}
          <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase & Warranty</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Vendor / Supplier</span>
                <span className="font-semibold text-slate-800">{asset.vendor || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Purchase Date</span>
                <span className="font-semibold text-slate-800">
                  {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Purchase Invoice No</span>
                <span className="font-mono font-semibold text-slate-800">{asset.purchase_invoice || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Useful Life</span>
                <span className="font-semibold text-slate-800">{asset.useful_life_years || 5} Years</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Warranty Start</span>
                <span className="font-semibold text-slate-800">
                  {asset.warranty_start ? new Date(asset.warranty_start).toLocaleDateString() : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Warranty End</span>
                <span className="font-semibold text-slate-800">
                  {asset.warranty_end ? new Date(asset.warranty_end).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>

            {/* Warranty Status Banner */}
            <div className="pt-2">
              {asset.warranty_end && new Date(asset.warranty_end) < new Date() ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Warranty expired on {new Date(asset.warranty_end).toLocaleDateString()}.</span>
                </div>
              ) : asset.warranty_end ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Warranty active until {new Date(asset.warranty_end).toLocaleDateString()}.
                  </span>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Depreciation Schedule */}
      {activeTab === 'depreciation' && (
        <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Depreciation Amortization Table</h3>
              <p className="text-xs text-slate-500">Method: {asset.depreciation_method || 'Straight Line'}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Period</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Opening Book Value</th>
                  <th className="py-2.5 px-3 text-right">Depreciation Expensed</th>
                  <th className="py-2.5 px-3 text-right">Accumulated Depr</th>
                  <th className="py-2.5 px-4 text-right">Closing Book Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depreciations.length > 0 ? (
                  depreciations.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{d.period || `Year ${i + 1}`}</td>
                      <td className="py-2.5 px-3 text-slate-600">{d.date ? new Date(d.date).toLocaleDateString() : '—'}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{formatCurrency(d.opening_value)}</td>
                      <td className="py-2.5 px-3 text-right text-amber-600 font-medium">-{formatCurrency(d.depreciation_amount)}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">{formatCurrency(d.accumulated_depreciation)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-teal-700">{formatCurrency(d.closing_value)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No depreciation periods calculated yet. Run the batch depreciation calculation from the Depreciation menu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Assignments */}
      {activeTab === 'assignments' && (
        <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Custody & Assignment Ledger</h3>
            {asset.status === 'available' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAssignModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" /> New Assignment
              </Button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Assigned To</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Assigned Date</th>
                  <th className="py-2.5 px-3">Returned Date</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.length > 0 ? (
                  assignments.map((a, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {a.employee?.name || a.assigned_to_user?.name || a.assigned_to || 'Staff Member'}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{a.department || '—'}</td>
                      <td className="py-3 px-3 text-slate-600">{a.location || '—'}</td>
                      <td className="py-3 px-3 text-slate-600">{a.assigned_date ? new Date(a.assigned_date).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-3 text-slate-600">{a.returned_date ? new Date(a.returned_date).toLocaleDateString() : 'Currently Active'}</td>
                      <td className="py-3 px-3 capitalize">{a.condition || 'Good'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={a.status === 'returned' ? 'default' : 'success'}>
                          {a.status?.toUpperCase() || 'ACTIVE'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No assignment history on record for this asset.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: Maintenance */}
      {activeTab === 'maintenance' && (
        <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Maintenance & Repair Work Orders</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowMaintenanceModal(true)}
              className="text-xs"
            >
              <Wrench className="w-3.5 h-3.5 mr-1 text-teal-600" /> Log Maintenance Ticket
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Ticket / Issue</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Vendor / Tech</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenanceRecords.length > 0 ? (
                  maintenanceRecords.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{m.issue || 'Routine Service'}</div>
                        {m.description && <div className="text-[10px] text-slate-400 line-clamp-1">{m.description}</div>}
                      </td>
                      <td className="py-3 px-3 capitalize text-slate-600">{m.maintenance_type || 'Preventive'}</td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            m.priority === 'urgent'
                              ? 'danger'
                              : m.priority === 'high'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {m.priority?.toUpperCase() || 'NORMAL'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{m.start_date ? new Date(m.start_date).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-3 text-slate-600">{m.vendor || m.technician || 'Internal IT'}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">
                        {formatCurrency(m.actual_cost || m.estimated_cost)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={m.status === 'completed' ? 'success' : 'warning'}>
                          {m.status?.toUpperCase() || 'SCHEDULED'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No maintenance tickets logged for this asset.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 5: Audit Logs */}
      {activeTab === 'audit' && (
        <Card className="p-5 bg-white border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Asset Audit Trail</h3>
          <div className="space-y-4">
            {auditLogs.length > 0 ? (
              auditLogs.map((log, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 pb-3 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800 capitalize">{log.action || 'Updated'}</span>
                      <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{log.description || `Action taken by ${log.user?.name || 'Administrator'}`}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
                Asset created and registered into enterprise ledger.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modals for Assign, Return, Maintenance, Disposal */}
      {/* 1. Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-teal-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                Assign Asset Custody
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign To (Staff / Employee) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / emp-0042"
                  value={assignForm.assigned_to}
                  onChange={(e) => setAssignForm({ ...assignForm, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={assignForm.department}
                    onChange={(e) => setAssignForm({ ...assignForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={assignForm.location}
                    onChange={(e) => setAssignForm({ ...assignForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expected Return Date</label>
                <input
                  type="date"
                  value={assignForm.expected_return_date}
                  onChange={(e) => setAssignForm({ ...assignForm, expected_return_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-teal-600" />
                Return Asset to Available Pool
              </h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleReturnSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset Return Condition</label>
                <select
                  value={returnForm.condition}
                  onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                >
                  <option value="good">Good (Ready for Reassignment)</option>
                  <option value="fair">Fair (Normal Wear & Tear)</option>
                  <option value="damaged">Damaged (Requires Maintenance)</option>
                  <option value="needs_repair">Needs Repair</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Return Inspection Notes</label>
                <textarea
                  rows="2"
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  placeholder="Condition upon return, missing cables, scratches..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowReturnModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {actionLoading ? 'Processing...' : 'Accept Return'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-amber-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                Log Maintenance Work Order
              </h3>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleMaintenanceSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue / Service Required *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Battery replacement, OS reinstalls"
                  value={maintenanceForm.issue}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, issue: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={maintenanceForm.maintenance_type}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective / Repair</option>
                    <option value="upgrade">Upgrade</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={maintenanceForm.priority}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimated Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={maintenanceForm.estimated_cost}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, estimated_cost: e.target.value })}
                  placeholder="2500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowMaintenanceModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {actionLoading ? 'Logging...' : 'Submit Work Order'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Disposal Modal */}
      {showDisposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-rose-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Initiate Asset Disposal
              </h3>
              <button onClick={() => setShowDisposalModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleDisposalSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Disposal Method</label>
                <select
                  value={disposalForm.disposal_type}
                  onChange={(e) => setDisposalForm({ ...disposalForm, disposal_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="sell">Sell (Liquidate)</option>
                  <option value="scrap">Scrap (Recycle)</option>
                  <option value="donate">Donate (CSR)</option>
                  <option value="write_off">Write Off (Damaged / Obsolete)</option>
                  <option value="lost">Lost / Stolen</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sale Recovery Value (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={disposalForm.sale_value}
                  onChange={(e) => setDisposalForm({ ...disposalForm, sale_value: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Disposal *</label>
                <textarea
                  rows="2"
                  required
                  value={disposalForm.reason}
                  onChange={(e) => setDisposalForm({ ...disposalForm, reason: e.target.value })}
                  placeholder="End of economic useful life, irreparable damage..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowDisposalModal(false)}>Cancel</Button>
                <Button type="submit" variant="danger" size="sm" disabled={actionLoading}>
                  {actionLoading ? 'Processing...' : 'Submit Disposal Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetails;
