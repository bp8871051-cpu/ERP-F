import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  RotateCcw,
  Boxes,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building2,
  MapPin,
  Eye,
  History,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import assetService from '../../services/assetService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const Assignments = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [assignForm, setAssignForm] = useState({
    asset_id: '',
    assigned_to: '',
    department: 'Engineering',
    location: 'HQ Floor 2',
    assigned_date: new Date().toISOString().split('T')[0],
    expected_return_date: '',
    condition: 'good',
    notes: '',
  });

  const [returnForm, setReturnForm] = useState({
    return_date: new Date().toISOString().split('T')[0],
    condition: 'good',
    notes: '',
  });

  useEffect(() => {
    fetchAssignments();
    fetchAvailableAssets();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await assetService.getAssignments();
      const list = res.data?.data || res.data || [];
      setAssignments(list);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAssets = async () => {
    try {
      const res = await assetService.getAssets({ status: 'available', per_page: 100 });
      const list = res.data?.data || res.data || [];
      setAvailableAssets(list);
      if (list.length > 0) {
        setAssignForm((prev) => ({ ...prev, asset_id: list[0].id }));
      }
    } catch (err) {
      console.warn('Could not fetch available assets pool:', err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.asset_id || !assignForm.assigned_to) {
      alert('Please select an asset and specify the custodian.');
      return;
    }
    try {
      setActionLoading(true);
      await assetService.assignAsset(assignForm.asset_id, assignForm);
      setShowAssignModal(false);
      setAssignForm({
        asset_id: availableAssets[0]?.id || '',
        assigned_to: '',
        department: 'Engineering',
        location: 'HQ Floor 2',
        assigned_date: new Date().toISOString().split('T')[0],
        expected_return_date: '',
        condition: 'good',
        notes: '',
      });
      await fetchAssignments();
      await fetchAvailableAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const openReturnModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowReturnModal(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    try {
      setActionLoading(true);
      const assetId = selectedAssignment.asset_id || selectedAssignment.asset?.id;
      await assetService.returnAsset(assetId, returnForm);
      setShowReturnModal(false);
      await fetchAssignments();
      await fetchAvailableAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing return');
    } finally {
      setActionLoading(false);
    }
  };

  const activeAssignments = assignments.filter((a) => a.status !== 'returned');
  const historyAssignments = assignments.filter((a) => a.status === 'returned');

  const filteredList = (activeTab === 'active' ? activeAssignments : historyAssignments).filter((item) => {
    const term = search.toLowerCase();
    const assetName = (item.asset?.name || item.asset_name || '').toLowerCase();
    const assetCode = (item.asset?.asset_code || '').toLowerCase();
    const holder = (item.employee?.name || item.assigned_to || '').toLowerCase();
    const dept = (item.department || '').toLowerCase();

    const matchesSearch = assetName.includes(term) || assetCode.includes(term) || holder.includes(term);
    const matchesDept = !selectedDept || dept === selectedDept.toLowerCase();
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            Asset Custody & Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage employee hardware custody, checkout periods, condition grading, and return workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowAssignModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" /> New Custody Assignment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Active Custody</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{activeAssignments.length}</p>
          <span className="text-[11px] text-teal-600 font-medium">Currently deployed to staff</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Available in Pool</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">{availableAssets.length}</p>
          <span className="text-[11px] text-slate-400">Ready for assignment</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Return Handled</span>
          <p className="text-xl font-bold text-slate-700 mt-1">{historyAssignments.length}</p>
          <span className="text-[11px] text-slate-400">Returned to storage</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Overdue Checkouts</span>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {
              activeAssignments.filter(
                (a) => a.expected_return_date && new Date(a.expected_return_date) < new Date()
              ).length
            }
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Past expected return</span>
        </Card>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex border-b border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Active Deployments ({activeAssignments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Return History ({historyAssignments.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search asset, holder..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset Details</th>
                <th className="py-3 px-3">Assigned Custodian</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Physical Location</th>
                <th className="py-3 px-3">Assigned Date</th>
                <th className="py-3 px-3">Expected Return</th>
                <th className="py-3 px-3">Condition</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="8" className="py-3 px-4">
                      <LoadingSkeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredList.length > 0 ? (
                filteredList.map((item) => {
                  const isOverdue =
                    item.status !== 'returned' &&
                    item.expected_return_date &&
                    new Date(item.expected_return_date) < new Date();

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div
                          className="font-semibold text-slate-900 hover:text-teal-600 cursor-pointer"
                          onClick={() => navigate(`/app/assets/${item.asset_id || item.asset?.id}`)}
                        >
                          {item.asset?.name || item.asset_name || 'Enterprise Asset'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {item.asset?.asset_code || `AST-${item.asset_id}`}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {item.employee?.name || item.assigned_to_user?.name || item.assigned_to || 'Staff Member'}
                        </div>
                        <div className="text-[10px] text-slate-400">ID: {item.employee_id || 'Internal'}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{item.department || '—'}</td>
                      <td className="py-3 px-3 text-slate-600">{item.location || '—'}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {item.assigned_date ? new Date(item.assigned_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3">
                        {item.expected_return_date ? (
                          <span
                            className={`font-medium ${
                              isOverdue ? 'text-rose-600 font-bold flex items-center gap-1' : 'text-slate-600'
                            }`}
                          >
                            {isOverdue && <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />}
                            {new Date(item.expected_return_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Open-ended</span>
                        )}
                      </td>
                      <td className="py-3 px-3 capitalize">
                        <Badge variant={item.condition === 'damaged' ? 'danger' : 'default'}>
                          {item.condition || 'GOOD'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status !== 'returned' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openReturnModal(item)}
                              title="Process Return"
                              className="text-[11px] py-1 px-2 border-slate-300 text-teal-700 hover:bg-teal-50"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" /> Return
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/app/assets/${item.asset_id || item.asset?.id}`)}
                            title="View Asset"
                            className="p-1 text-slate-400 hover:text-slate-800"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No custody records found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Custody Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-teal-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600" />
                New Asset Custody Checkout
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Available Asset *</label>
                <select
                  required
                  value={assignForm.asset_id}
                  onChange={(e) => setAssignForm({ ...assignForm, asset_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500 font-medium"
                >
                  <option value="">Choose an available asset</option>
                  {availableAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.asset_code || `AST-${a.id}`}) — {a.department || 'HQ'}
                    </option>
                  ))}
                </select>
                {availableAssets.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    No assets currently in 'Available' status. Register a new asset or process returns first.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Custodian (Name / Employee) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson (Lead Designer)"
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
                  <label className="block font-semibold text-slate-700 mb-1">Physical Location</label>
                  <input
                    type="text"
                    value={assignForm.location}
                    onChange={(e) => setAssignForm({ ...assignForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Checkout Date</label>
                  <input
                    type="date"
                    value={assignForm.assigned_date}
                    onChange={(e) => setAssignForm({ ...assignForm, assigned_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
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
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Checkout Condition</label>
                <select
                  value={assignForm.condition}
                  onChange={(e) => setAssignForm({ ...assignForm, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500 capitalize"
                >
                  <option value="good">Brand New / Excellent</option>
                  <option value="fair">Good / Operational</option>
                  <option value="minor_wear">Minor Cosmetic Wear</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Handover Notes</label>
                <textarea
                  rows="2"
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="Included accessories: power adapter, case, mouse..."
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

      {/* Return Asset Modal */}
      {showReturnModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-teal-600" />
                Process Custody Return
              </h3>
              <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleReturnSubmit} className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="font-semibold text-slate-800">{selectedAssignment.asset?.name || selectedAssignment.asset_name}</div>
                <div className="text-[10px] text-slate-500">
                  Custodian: {selectedAssignment.employee?.name || selectedAssignment.assigned_to}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Return Condition *</label>
                <select
                  value={returnForm.condition}
                  onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500 font-semibold"
                >
                  <option value="good">Good Condition (Return to Available Pool)</option>
                  <option value="fair">Fair (Normal Wear & Tear)</option>
                  <option value="damaged">Damaged (Move directly to Maintenance)</option>
                  <option value="needs_repair">Needs Repair / Servicing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Return Inspection Remarks</label>
                <textarea
                  rows="2"
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  placeholder="Verification check completed. All accessories returned."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowReturnModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
                  {actionLoading ? 'Processing...' : 'Complete Return'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
