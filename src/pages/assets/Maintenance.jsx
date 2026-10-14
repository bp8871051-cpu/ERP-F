import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  DollarSign,
  User,
  Building2,
  Boxes,
  Eye,
  Edit,
  RotateCcw,
} from 'lucide-react';
import assetService from '../../services/assetService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../components/ui/SearchableSelect';

export const Maintenance = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [ticketForm, setTicketForm] = useState({
    asset_id: '',
    maintenance_type: 'preventive',
    priority: 'medium',
    issue: '',
    description: '',
    vendor: '',
    technician: '',
    start_date: new Date().toISOString().split('T')[0],
    expected_completion: '',
    estimated_cost: '',
    notes: '',
  });

  const [updateForm, setUpdateForm] = useState({
    status: 'completed',
    actual_completion: new Date().toISOString().split('T')[0],
    actual_cost: '',
    notes: '',
  });

  useEffect(() => {
    fetchMaintenance();
    fetchAssets();
  }, [selectedStatus, selectedPriority]);

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const res = await assetService.getMaintenance({
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
      });
      const list = res.data?.data || res.data || [];
      setTickets(list);
    } catch (err) {
      console.error('Failed to load maintenance tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await assetService.getAssets({ per_page: 100 });
      const list = res.data?.data || res.data || [];
      setAssets(list);
      if (list.length > 0) {
        setTicketForm((prev) => ({ ...prev, asset_id: list[0].id }));
      }
    } catch (err) {
      console.warn('Could not load assets list for maintenance:', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.asset_id || !ticketForm.issue) {
      alert('Please select an asset and specify the issue.');
      return;
    }
    try {
      setActionLoading(true);
      await assetService.createMaintenanceTicket({
        ...ticketForm,
        estimated_cost: parseFloat(ticketForm.estimated_cost || 0),
      });
      setShowCreateModal(false);
      setTicketForm({
        asset_id: assets[0]?.id || '',
        maintenance_type: 'preventive',
        priority: 'medium',
        issue: '',
        description: '',
        vendor: '',
        technician: '',
        start_date: new Date().toISOString().split('T')[0],
        expected_completion: '',
        estimated_cost: '',
        notes: '',
      });
      await fetchMaintenance();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating maintenance ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const openUpdateModal = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateForm({
      status: ticket.status === 'completed' ? 'completed' : 'completed',
      actual_completion: new Date().toISOString().split('T')[0],
      actual_cost: ticket.actual_cost || ticket.estimated_cost || '',
      notes: ticket.notes || '',
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      setActionLoading(true);
      await assetService.updateMaintenanceTicket(selectedTicket.id, {
        ...updateForm,
        actual_cost: parseFloat(updateForm.actual_cost || 0),
      });
      setShowUpdateModal(false);
      await fetchMaintenance();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating maintenance ticket');
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
    const s = (status || 'requested').toLowerCase();
    switch (s) {
      case 'completed':
        return <Badge variant="success">COMPLETED</Badge>;
      case 'in progress':
      case 'in_progress':
        return <Badge variant="info">IN PROGRESS</Badge>;
      case 'scheduled':
        return <Badge variant="warning">SCHEDULED</Badge>;
      case 'cancelled':
        return <Badge variant="danger">CANCELLED</Badge>;
      case 'requested':
      default:
        return <Badge variant="default">REQUESTED</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    switch (p) {
      case 'urgent':
        return <Badge variant="danger">URGENT</Badge>;
      case 'high':
        return <Badge variant="warning">HIGH</Badge>;
      case 'low':
        return <Badge variant="default">LOW</Badge>;
      case 'medium':
      default:
        return <Badge variant="info">MEDIUM</Badge>;
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const term = search.toLowerCase();
    const assetName = (t.asset?.name || t.asset_name || '').toLowerCase();
    const issue = (t.issue || '').toLowerCase();
    const vendor = (t.vendor || t.technician || '').toLowerCase();
    return assetName.includes(term) || issue.includes(term) || vendor.includes(term);
  });

  const totalCost = tickets.reduce((acc, t) => acc + Number(t.actual_cost || t.estimated_cost || 0), 0);
  const activeCount = tickets.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length;
  const completedCount = tickets.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            Asset Maintenance & Repairs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log preventative servicing, breakdown repairs, technician allocations, and maintenance cost expenditures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" /> Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Work Orders</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{tickets.length}</p>
          <span className="text-[11px] text-slate-400">All recorded jobs</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active In-Progress</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{activeCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Currently in service</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Completed Repairs</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{completedCount}</p>
          <span className="text-[11px] text-slate-400">Returned to operational pool</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Maintenance Expense</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(totalCost)}</p>
          <span className="text-[11px] text-slate-400">Total repair costs</span>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs !overflow-visible">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 !overflow-visible">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset, issue, vendor, technician..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
            />
          </div>

          <div className="z-20">
            <SearchableSelect
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'requested', label: 'Requested' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              searchable={false}
            />
          </div>

          <div className="z-10">
            <SearchableSelect
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'urgent', label: 'Urgent Priority' }
              ]}
              value={selectedPriority}
              onChange={(val) => setSelectedPriority(val)}
              searchable={false}
            />
          </div>
        </div>
      </Card>

      {/* Maintenance Tickets Table */}
      <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset Details</th>
                <th className="py-3 px-3">Issue / Job</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Start Date</th>
                <th className="py-3 px-3">Expected / Actual Done</th>
                <th className="py-3 px-3">Vendor / Technician</th>
                <th className="py-3 px-3 text-right">Cost (Est / Act)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="10" className="py-3 px-4">
                      <LoadingSkeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div
                        className="font-semibold text-slate-900 hover:text-teal-600 cursor-pointer"
                        onClick={() => navigate(`/app/assets/${t.asset_id || t.asset?.id}`)}
                      >
                        {t.asset?.name || t.asset_name || 'Enterprise Asset'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {t.asset?.asset_code || `AST-${t.asset_id}`}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{t.issue}</div>
                      {t.description && <div className="text-[10px] text-slate-400 line-clamp-1">{t.description}</div>}
                    </td>
                    <td className="py-3 px-3 capitalize text-slate-600">{t.maintenance_type || 'Preventive'}</td>
                    <td className="py-3 px-3">{getPriorityBadge(t.priority)}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {t.start_date ? new Date(t.start_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {t.actual_completion
                        ? new Date(t.actual_completion).toLocaleDateString()
                        : t.expected_completion
                        ? `${new Date(t.expected_completion).toLocaleDateString()} (Est)`
                        : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{t.vendor || t.technician || 'Internal Service'}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-800">
                      {formatCurrency(t.actual_cost || t.estimated_cost)}
                    </td>
                    <td className="py-3 px-3 text-center">{getStatusBadge(t.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {t.status !== 'completed' && t.status !== 'cancelled' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openUpdateModal(t)}
                            title="Update Progress / Complete"
                            className="text-[11px] py-1 px-2 border-slate-300 text-teal-700 hover:bg-teal-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> Update
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/assets/${t.asset_id || t.asset?.id}`)}
                          title="View Asset"
                          className="p-1 text-slate-400 hover:text-slate-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400">
                    <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No maintenance tickets found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Schedule Maintenance Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col my-8 !overflow-visible">
            <div className="p-4 border-b border-slate-200 bg-amber-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                Schedule Asset Maintenance Work Order
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3 text-xs">
              <div className="z-30">
                <label className="block font-semibold text-slate-700 mb-1">Select Target Asset *</label>
                <SearchableSelect
                  options={assets.map((a) => ({
                    value: a.id,
                    label: `${a.name} (${a.asset_code || `AST-${a.id}`}) — Status: ${a.status}`
                  }))}
                  value={ticketForm.asset_id}
                  onChange={(val) => setTicketForm({ ...ticketForm, asset_id: val })}
                  searchable={true}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maintenance Issue / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual calibration & hardware testing"
                  value={ticketForm.issue}
                  onChange={(e) => setTicketForm({ ...ticketForm, issue: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="z-20">
                  <label className="block font-semibold text-slate-700 mb-1">Maintenance Type</label>
                  <SearchableSelect
                    options={[
                      { value: 'preventive', label: 'Preventative (Routine)' },
                      { value: 'corrective', label: 'Corrective (Breakdown)' },
                      { value: 'upgrade', label: 'Upgrade / Enhancement' },
                      { value: 'inspection', label: 'Regulatory Inspection' }
                    ]}
                    value={ticketForm.maintenance_type}
                    onChange={(val) => setTicketForm({ ...ticketForm, maintenance_type: val })}
                    searchable={false}
                  />
                </div>

                <div className="z-10">
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <SearchableSelect
                    options={[
                      { value: 'low', label: 'Low Priority' },
                      { value: 'medium', label: 'Medium Priority' },
                      { value: 'high', label: 'High Priority' },
                      { value: 'urgent', label: 'Urgent Priority' }
                    ]}
                    value={ticketForm.priority}
                    onChange={(val) => setTicketForm({ ...ticketForm, priority: val })}
                    searchable={false}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">External Vendor / Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Dell Authorized Service"
                    value={ticketForm.vendor}
                    onChange={(e) => setTicketForm({ ...ticketForm, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    placeholder="e.g. Robert Smith"
                    value={ticketForm.technician}
                    onChange={(e) => setTicketForm({ ...ticketForm, technician: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={ticketForm.start_date}
                    onChange={(e) => setTicketForm({ ...ticketForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Completion</label>
                  <input
                    type="date"
                    value={ticketForm.expected_completion}
                    onChange={(e) => setTicketForm({ ...ticketForm, expected_completion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={ticketForm.estimated_cost}
                    onChange={(e) => setTicketForm({ ...ticketForm, estimated_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Scope of Work</label>
                <textarea
                  rows="2"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Details of defects, diagnostic symptoms, replacement parts needed..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {actionLoading ? 'Scheduling...' : 'Create Work Order'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Maintenance Ticket Modal */}
      {showUpdateModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md !overflow-visible">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                Update Maintenance Work Order
              </h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="font-semibold text-slate-800">{selectedTicket.issue}</div>
                <div className="text-[10px] text-slate-500">Asset: {selectedTicket.asset?.name || selectedTicket.asset_name}</div>
              </div>

              <div className="z-10">
                <label className="block font-semibold text-slate-700 mb-1">Job Status</label>
                <SearchableSelect
                  options={[
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed (Mark Asset as Available)' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ]}
                  value={updateForm.status}
                  onChange={(val) => setUpdateForm({ ...updateForm, status: val })}
                  searchable={false}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actual Completion Date</label>
                <input
                  type="date"
                  value={updateForm.actual_completion}
                  onChange={(e) => setUpdateForm({ ...updateForm, actual_completion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Final Actual Invoiced Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={updateForm.actual_cost}
                  onChange={(e) => setUpdateForm({ ...updateForm, actual_cost: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Remarks</label>
                <textarea
                  rows="2"
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                  placeholder="Work finished successfully, tested operational."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {actionLoading ? 'Updating...' : 'Save & Update'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
