import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CopyCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  ArrowRight,
  Search,
  Filter,
  ShieldAlert,
  RefreshCw,
  Globe,
  FileText,
  Send,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const DuplicateLeads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin' || user?.is_super_admin === true;
  const isManager = user?.is_manager || user?.role?.toLowerCase().includes('manager') || isSuperAdmin;
  const canApprove = isSuperAdmin || isManager;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  // Processing state
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await crmService.getDuplicateRequests({
        status: statusFilter || undefined,
        page,
        per_page: 15,
      });
      const dataPayload = res.data?.data || res.data || [];
      const items = Array.isArray(dataPayload) ? dataPayload : (dataPayload.data || []);
      setRequests(items);
      setMeta({
        current_page: res.data?.current_page || 1,
        last_page: res.data?.last_page || 1,
        total: res.data?.total || items.length,
      });
    } catch (err) {
      console.error('Error fetching duplicate requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this duplicate lead request? This will register the lead into CRM.')) {
      return;
    }
    try {
      setActionLoadingId(id);
      await crmService.approveDuplicate(id, {
        admin_notes: adminNotes[id] || 'Approved by Admin/Manager',
      });
      alert('Duplicate lead successfully approved and registered into CRM!');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve duplicate request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    const notes = adminNotes[id] || prompt('Reason for rejection (optional):');
    if (notes === null) return;

    try {
      setActionLoadingId(id);
      await crmService.rejectDuplicate(id, {
        admin_notes: notes || 'Rejected by Admin',
      });
      alert('Duplicate lead request rejected.');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject duplicate request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter local search on name / email / matched value
  const filteredRequests = requests.filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const reqName = r.lead_data?.name?.toLowerCase() || '';
    const reqEmail = r.lead_data?.email?.toLowerCase() || '';
    const reqPhone = r.lead_data?.phone || '';
    const matchedVal = r.matched_value?.toLowerCase() || '';
    const requester = r.requester?.name?.toLowerCase() || '';
    return reqName.includes(s) || reqEmail.includes(s) || reqPhone.includes(s) || matchedVal.includes(s) || requester.includes(s);
  });

  // Calculate summary counts
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CopyCheck className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 shrink-0" />
            <span>Duplicate Lead Requests & Approvals</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and authorize duplicate lead requests. When duplicate name, phone, or email is detected during lead registration, admin approval is required before adding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchRequests}>
            Refresh
          </Button>
          <Button variant="teal" size="sm" onClick={() => navigate('/app/crm/leads')}>
            Back to CRM Leads
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
            <CopyCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Requests</div>
            <div className="text-lg font-bold text-slate-900">{meta.total || totalCount}</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-700 font-medium">Pending Review</div>
            <div className="text-lg font-bold text-amber-900">{pendingCount}</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-700 font-medium">Approved Leads</div>
            <div className="text-lg font-bold text-emerald-900">{approvedCount}</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-rose-700 font-medium">Rejected</div>
            <div className="text-lg font-bold text-rose-900">{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5 !overflow-visible">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by prospect name, email, phone, or requester..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                statusFilter === '' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                statusFilter === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                statusFilter === 'rejected' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      {loading ? (
        <Card className="p-6">
          <LoadingSkeleton type="table" />
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center mb-3">
            <CopyCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No duplicate lead requests found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            When users register leads that share an identical Phone number, Email, or Contact name with existing CRM leads, duplicate requests will be listed here for Admin review.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const proposed = req.lead_data || {};
            const existing = req.existing_lead || {};
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <Card key={req.id} className="p-5 border-slate-200 shadow-xs hover:border-slate-300 transition-all">
                {/* Request Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{req.id}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      Matched on {req.matched_field?.toUpperCase()}: {req.matched_value}
                    </span>

                    {/* Status Badge */}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-500" />
                        Pending Admin Review
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        Rejected
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Requested by: <strong className="font-semibold text-slate-700">{req.requester?.name || 'Staff User'}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison: Existing Lead vs Proposed Lead */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  {/* Left Column: Existing Lead in Database */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        Existing CRM Lead (હાજર લીડ)
                      </span>
                      {existing.id && (
                        <button
                          onClick={() => navigate(`/app/crm/leads/${existing.id}`)}
                          className="text-[10px] text-teal-600 hover:text-teal-800 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          View Profile
                        </button>
                      )}
                    </div>

                    <div className="text-xs space-y-1 text-slate-700">
                      <div>
                        <span className="text-slate-400">Name:</span> <strong className="font-semibold">{existing.name || 'N/A'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Company:</span> <span className="font-medium">{existing.company_name || 'Individual'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Email:</span> <span className="font-mono text-[11px]">{existing.email || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span> <span className="font-mono text-[11px]">{existing.phone || 'None'}</span>
                      </div>
                      <div className="pt-1 flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400">Assigned To:</span>
                        <strong className="font-semibold text-emerald-700">
                          {existing.assigned_user?.name || existing.owner?.name || 'Unassigned'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Proposed Duplicate Lead */}
                  <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-200 space-y-2">
                    <div className="flex items-center justify-between border-b border-teal-200 pb-1.5">
                      <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-teal-600" />
                        Proposed New Lead (નવી લીડ વિગતો)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-teal-100 text-teal-800">
                        {proposed.lead_source_name || 'Website'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-800">
                      <div>
                        <span className="text-slate-500">Name:</span> <strong className="font-semibold">{proposed.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Company:</span> <span className="font-medium">{proposed.company_name || 'Individual'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Email:</span> <span className="font-mono text-[11px]">{proposed.email || 'None'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Phone:</span> <span className="font-mono text-[11px]">{proposed.phone || 'None'}</span>
                      </div>
                      {proposed.other_source_details && (
                        <div className="text-[11px] text-teal-900 bg-teal-50 p-1.5 rounded border border-teal-200">
                          <span className="font-semibold">Other Source Details:</span> {proposed.other_source_details}
                        </div>
                      )}
                      {(proposed.city || proposed.pincode) && (
                        <div className="text-[11px] text-slate-600">
                          <span className="text-slate-400">Location:</span> {proposed.city} {proposed.state && `(${proposed.state})`} - {proposed.pincode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requester Explanation & Admin Notes */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs space-y-1.5 mb-3">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>Requester Reason / Explanation:</span>
                  </div>
                  <p className="text-slate-800 italic bg-white/80 p-2 rounded-lg border border-amber-200/60">
                    "{req.reason || 'No reason provided'}"
                  </p>

                  {req.admin_notes && (
                    <div className="pt-1.5 border-t border-amber-200/60 text-[11px] text-slate-700">
                      <strong className="font-semibold text-slate-900">Admin Remarks:</strong> {req.admin_notes}
                      {req.reviewer && <span className="text-slate-500"> (by {req.reviewer.name})</span>}
                    </div>
                  )}
                </div>

                {/* Action Controls for Admin */}
                {isPending && canApprove && (
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                    <div className="flex-1 max-w-md">
                      <input
                        type="text"
                        placeholder="Admin notes / decision comments (optional)..."
                        value={adminNotes[req.id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [req.id]: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleReject(req.id)}
                        className="px-3.5 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleApprove(req.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {actionLoadingId === req.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Approve & Create Lead</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* If approved, show link to created lead */}
                {isApproved && req.created_lead_id && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Lead created in CRM with ID #{req.created_lead_id}
                    </span>
                    <button
                      onClick={() => navigate(`/app/crm/leads/${req.created_lead_id}`)}
                      className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-md font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      View Created Lead
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DuplicateLeads;
