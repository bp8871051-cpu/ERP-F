import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  DollarSign,
  FileText,
  CornerUpRight,
  MessageSquare,
  Send,
  MoreVertical,
} from 'lucide-react';
import { workflowService } from '../../../services/workflowService';
import { useAuth } from '../../../context/AuthContext';

export const WorkflowsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [metrics, setMetrics] = useState({
    pendingApprovals: 0,
    approved: 0,
    rejected: 0,
    myRequests: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'workflows'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Action Modal State (Approve / Reject / Request Changes)
  const [actionModal, setActionModal] = useState({
    open: false,
    type: 'approve', // 'approve', 'reject', 'request_changes'
    request: null,
    comments: '',
  });

  // Request Details & Audit Log drawer
  const [activeRequestDetails, setActiveRequestDetails] = useState(null);
  const [activePipelineDetails, setActivePipelineDetails] = useState(null);
  const [newComment, setNewComment] = useState('');

  // New Request Modal state
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    workflow_id: '1',
    title: '',
    description: '',
    amount: '',
  });

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await workflowService.getRequests();
      if (res && res.data) {
        setRequests(res.data.requests || []);
        if (res.data.workflows) setWorkflows(res.data.workflows);
        if (res.data.metrics) setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load workflows', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Submit Approval / Reject action
  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionModal.request) return;

    try {
      const id = actionModal.request.id;
      if (actionModal.type === 'approve') {
        await workflowService.approve(id, actionModal.comments);
      } else if (actionModal.type === 'reject') {
        await workflowService.reject(id, actionModal.comments);
      } else {
        await workflowService.requestChanges(id, actionModal.comments);
      }

      setActionModal({ open: false, type: 'approve', request: null, comments: '' });
      loadData();
    } catch (err) {
      console.error('Failed to submit approval action', err);
    }
  };

  // Submit New Request
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await workflowService.createRequest({
        workflow_id: requestFormData.workflow_id,
        title: requestFormData.title,
        description: requestFormData.description,
        amount: requestFormData.amount ? parseFloat(requestFormData.amount) : null,
      });
      setIsNewRequestModalOpen(false);
      setRequestFormData({ workflow_id: '1', title: '', description: '', amount: '' });
      loadData();
    } catch (err) {
      console.error('Failed to create request', err);
    }
  };

  // Post comment to request
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeRequestDetails) return;
    try {
      await workflowService.addComment(activeRequestDetails.id, newComment);
      setNewComment('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      r.title?.toLowerCase().includes(query) ||
      r.requester?.name?.toLowerCase().includes(query) ||
      r.module?.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return r.status === 'pending';
    if (statusFilter === 'approved') return r.status === 'approved';
    if (statusFilter === 'rejected') return r.status === 'rejected';
    if (statusFilter === 'my') return r.requester_id === user?.id;

    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workflows & Approval Engine</h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-stage sequential & parallel authorization pipelines with financial sign-offs
          </p>
        </div>

        <button
          onClick={() => setIsNewRequestModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Approval Request</span>
        </button>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{metrics.pendingApprovals}</span>
          <span className="text-[10px] text-amber-600 block mt-0.5">Awaiting decision</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Approved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-emerald-600">{metrics.approved}</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Signed off</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rejected</span>
            <XCircle className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-rose-600">{metrics.rejected}</span>
          <span className="text-[10px] text-rose-500 block mt-0.5">Declined requests</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">My Requests</span>
            <User className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{metrics.myRequests}</span>
          <span className="text-[10px] text-blue-600 block mt-0.5">Submitted by you</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Overdue</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold text-rose-600">{metrics.overdue}</span>
          <span className="text-[10px] text-rose-500 block mt-0.5">Past due date</span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Navigation Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approval Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeTab === 'workflows'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Workflow Pipelines ({workflows.length})
            </button>
          </div>

          {/* Sub Filters & Search */}
          {activeTab === 'requests' && (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-0.5 rounded-lg text-xs font-medium">
                {['all', 'pending', 'approved', 'rejected', 'my'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer ${
                      statusFilter === st ? 'bg-white text-teal-700 font-bold shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    {st === 'my' ? 'My' : st}
                  </button>
                ))}
              </div>

              <div className="relative w-48 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Table */}
        {activeTab === 'requests' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Request / Title</th>
                  <th className="py-3.5 px-4">Requester</th>
                  <th className="py-3.5 px-4">Module</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Stage Progress</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span>Loading approval requests...</span>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No approval requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => setActiveRequestDetails(req)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      {/* Title & Ref */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block truncate">{req.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {req.reference_no || `#REQ-${req.id}`} •{' '}
                          {req.createdDate || 'Unknown'}
                        </span>
                      </td>

                      {/* Requester */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              req.requester?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                            }
                            alt=""
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="font-semibold text-slate-800">{req.requester?.name || 'Staff'}</span>
                        </div>
                      </td>

                      {/* Module */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                          {req.module || 'Procurement'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {req.amount ? `$${Number(req.amount).toLocaleString()}` : '--'}
                      </td>

                      {/* Stage Progress (e.g. Step 1 -> Step 2 -> Step 3) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold">
                            Stage {req.current_step || 1}
                          </span>
                          <span className="text-slate-400">of {req.total_steps || 3}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : req.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : req.status === 'changes_requested'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {req.status?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {(() => {
                          // Check if user has already approved the current step
                          const hasApprovedCurrentStep = req.approvals?.some(app => app.stepName === req.currentStep?.name && app.approver === user?.name);
                          // Check if user is authorized to act on the current step
                          const isAuthorized = req.currentStep?.role === user?.role || req.currentStep?.approver?.name === user?.name;
                          // Determine if user can act
                          const canAct = req.status === 'pending' && !hasApprovedCurrentStep && isAuthorized;
                          
                          if (canAct) {
                            return (
                              <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() =>
                                    setActionModal({ open: true, type: 'approve', request: req, comments: '' })
                                  }
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold cursor-pointer shadow-2xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    setActionModal({ open: true, type: 'reject', request: req, comments: '' })
                                  }
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            );
                          } else {
                            return (
                              <span className="text-[11px] text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded">
                                {req.status === 'pending' ? `Waiting on ${req.currentStep?.role || 'Next Step'}` : 'Archived'}
                              </span>
                            );
                          }
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* WORKFLOW PIPELINES TAB */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700">
                      {wf.module || 'Core'}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        wf.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{wf.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {wf.description || 'Pre-configured corporate multi-step authorization pipeline.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {wf.steps?.length || 3} sequential steps
                  </span>
                  <button 
                    onClick={() => setActivePipelineDetails(wf)}
                    className="text-teal-600 font-semibold text-[11px] hover:text-teal-700 cursor-pointer"
                  >
                    View Pipeline →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Approval / Reject Confirmation Modal */}
      {actionModal.open && actionModal.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-sm font-bold text-slate-900 capitalize mb-1">
              {actionModal.type.replace('_', ' ')} Request
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              "{actionModal.request.title}" ({actionModal.request.amount ? `$${Number(actionModal.request.amount).toLocaleString()}` : 'Non-monetary'})
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Audit Remarks / Notes
                </label>
                <textarea
                  rows={3}
                  required={actionModal.type !== 'approve'}
                  placeholder="State justification or audit commentary..."
                  value={actionModal.comments}
                  onChange={(e) => setActionModal({ ...actionModal, comments: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal({ open: false, type: 'approve', request: null, comments: '' })}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg text-xs font-semibold shadow-xs ${
                    actionModal.type === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {actionModal.type.replace('_', ' ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Request Creation Modal */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Initiate Approval Request</h3>
              <button
                onClick={() => setIsNewRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Workflow</label>
                <select
                  value={requestFormData.workflow_id}
                  onChange={(e) => setRequestFormData({ ...requestFormData, workflow_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.module})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Request Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Cloud Infrastructure Renewal"
                  value={requestFormData.title}
                  onChange={(e) => setRequestFormData({ ...requestFormData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Amount ($ USD, optional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="12500.00"
                  value={requestFormData.amount}
                  onChange={(e) => setRequestFormData({ ...requestFormData, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Business Case / Details</label>
                <textarea
                  rows={3}
                  placeholder="Justification and executive rationale..."
                  value={requestFormData.description}
                  onChange={(e) => setRequestFormData({ ...requestFormData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Pipeline Details Modal */}
      {activePipelineDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative flex flex-col !overflow-visible m-auto">
            <button
              onClick={() => setActivePipelineDetails(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1 pr-6">{activePipelineDetails.name}</h3>
            <p className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-4">
              {activePipelineDetails.description}
            </p>

            <div className="flex-1 overflow-y-auto pr-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Pipeline Steps</h4>
              <div className="space-y-6">
                {activePipelineDetails.steps?.map((step, idx) => (
                  <div key={step.id} className="relative pl-6">
                    {idx !== activePipelineDetails.steps.length - 1 && (
                      <div className="absolute left-2.5 top-6 w-0.5 h-full bg-slate-200" />
                    )}
                    <div className="absolute left-1 top-1 w-3.5 h-3.5 rounded-full bg-teal-100 border-2 border-teal-500 flex items-center justify-center z-10" />
                    
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-800">Step {step.step_order}: {step.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded font-semibold uppercase">{step.type}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>Approver Role: <span className="font-semibold">{step.approver_role || 'Specific User'}</span></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>SLA Time: <span className="font-semibold">{step.sla_hours} hours</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setActivePipelineDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;
