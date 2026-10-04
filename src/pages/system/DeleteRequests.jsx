import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, ShieldAlert, CheckCircle, XCircle, Search, Filter, 
  Plus, Eye, Clock, User, Check, X, AlertTriangle, RefreshCw, 
  FileText, CornerDownRight
} from 'lucide-react';
import systemService from '../../services/systemService';

const statusBadges = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function DeleteRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Create form
  const [form, setForm] = useState({
    module: 'Sales',
    record_type: 'Invoice',
    record_id: '',
    record_name: '',
    reason: ''
  });

  // Review Form
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState('approve'); // 'approve' | 'reject'
  const [submitting, setSubmitting] = useState(false);

  const fetchDeleteRequests = async () => {
    try {
      setLoading(true);
      const data = await systemService.getDeleteRequests({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setRequests(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error fetching delete requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleteRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDeleteRequests();
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await systemService.createDeleteRequest(form);
      setShowCreateModal(false);
      setForm({
        module: 'Sales',
        record_type: 'Invoice',
        record_id: '',
        record_name: '',
        reason: ''
      });
      setNotification({ type: 'success', message: 'Safe deletion request submitted for admin review.' });
      setTimeout(() => setNotification(null), 3000);
      fetchDeleteRequests();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to submit request' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessReview = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      setSubmitting(true);
      if (reviewAction === 'approve') {
        await systemService.approveDeleteRequest(selectedRequest.id, reviewNotes);
        setNotification({ type: 'success', message: `Request #${selectedRequest.id} approved and record safely soft-deleted!` });
      } else {
        await systemService.rejectDeleteRequest(selectedRequest.id, reviewNotes);
        setNotification({ type: 'success', message: `Request #${selectedRequest.id} rejected.` });
      }
      setShowReviewModal(false);
      setReviewNotes('');
      setTimeout(() => setNotification(null), 3000);
      fetchDeleteRequests();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Review processing failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Safe Deletion & Purge Requests</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise two-step safety workflow. Crucial ERP records are protected from accidental removal until reviewed by an administrator.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Request Record Deletion
        </button>
      </div>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by record, module, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Request Statuses</option>
            <option value="pending">Pending Admin Review</option>
            <option value="approved">Approved & Soft Deleted</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={fetchDeleteRequests}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Req #</th>
                <th className="p-3.5">Requester</th>
                <th className="p-3.5">Target Module & Entity</th>
                <th className="p-3.5">Record Identifier</th>
                <th className="p-3.5">Business Justification</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Requested At</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(n => (
                  <tr key={n}>
                    <td colSpan="8" className="p-4">
                      <div className="h-6 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <Trash2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No delete requests logged</p>
                    <p className="text-xs text-slate-400 mt-0.5">Critical ERP records submitted for deletion will appear here.</p>
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      DEL-{String(req.id).padStart(5, '0')}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">
                        {req.user?.name || req.requester_name || 'System Admin'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {req.user?.email || 'admin@falconerp.com'}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-800">{req.module}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-indigo-600 font-medium">{req.record_type}</span>
                    </td>

                    <td className="p-3.5 font-mono font-semibold text-slate-700">
                      {req.record_name || `#${req.record_id}`}
                    </td>

                    <td className="p-3.5 text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        statusBadges[req.status] || statusBadges.pending
                      }`}>
                        {req.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-400">
                      {new Date(req.created_at).toLocaleString()}
                    </td>

                    <td className="p-3.5 text-right">
                      {req.status === 'pending' ? (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowReviewModal(true);
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition"
                        >
                          Review & Decide
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {req.reviewed_by_user?.name ? `By ${req.reviewed_by_user.name}` : 'Reviewed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Delete Request Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" /> Request Record Deletion
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Two-Step Approval Notice
                  </div>
                  <div>This action will not immediately destroy data. An authorized Super Admin must review and grant approval.</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target ERP Module *</label>
                    <select
                      value={form.module}
                      onChange={(e) => setForm({ ...form, module: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="Sales">Sales & Invoicing</option>
                      <option value="CRM">CRM & Customers</option>
                      <option value="Inventory">Inventory & Products</option>
                      <option value="Finance">Finance & Ledger</option>
                      <option value="HRM">HRM & Employees</option>
                      <option value="Documents">Documents Vault</option>
                      <option value="Support">Support Tickets</option>
                      <option value="Membership">Membership Subscriptions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Record Type *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Invoice, Customer, Ticket"
                      value={form.record_type}
                      onChange={(e) => setForm({ ...form, record_type: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Record ID # *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 104"
                      value={form.record_id}
                      onChange={(e) => setForm({ ...form, record_id: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Identifier / Name</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-0045"
                      value={form.record_name}
                      onChange={(e) => setForm({ ...form, record_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Deletion *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide mandatory business reason and compliance justification..."
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Delete Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" /> Admin Review: DEL-{selectedRequest.id}
                </h2>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleProcessReview} className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requester:</span>
                    <span className="font-bold text-slate-800">{selectedRequest.user?.name || selectedRequest.requester_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Entity:</span>
                    <span className="font-bold text-indigo-700">{selectedRequest.module} / {selectedRequest.record_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Record:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedRequest.record_name || `#${selectedRequest.record_id}`}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-0.5">Reason:</span>
                    <span className="text-slate-700 italic">"{selectedRequest.reason}"</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Decision</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewAction('approve')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        reviewAction === 'approve' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs ring-1 ring-emerald-300' 
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      <Check className="w-4 h-4 text-emerald-600" /> Approve (Soft Delete)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('reject')}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        reviewAction === 'reject' 
                          ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs ring-1 ring-rose-300' 
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      <X className="w-4 h-4 text-rose-600" /> Reject Request
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Review Notes / Audit Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Add audit notes explaining approval or grounds for rejection..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-md transition disabled:opacity-50 ${
                      reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {submitting ? 'Processing...' : (reviewAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection')}
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
