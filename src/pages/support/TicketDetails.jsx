import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Ticket,
  ArrowLeft,
  Send,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Paperclip,
  BookOpen,
  Lock,
  GitMerge,
  UserPlus,
  RefreshCw,
  X,
  FileText,
  Calendar,
  Building,
} from 'lucide-react';
import supportService from '../../services/supportService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';

export const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Composer State
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [updateStatusTo, setUpdateStatusTo] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newAgentId, setNewAgentId] = useState(1);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [targetMergeId, setTargetMergeId] = useState('');
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [kbTitle, setKbTitle] = useState('');
  const [kbCategory, setKbCategory] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await supportService.getTicketDetails(id);
      setTicket(res);
      setUpdateStatusTo(res.status || 'in_progress');
      setKbTitle(`Resolution: ${res.subject}`);
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError('Unable to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      await supportService.replyTicket(ticket.id, {
        message: replyText,
        is_internal: isInternalNote,
        sender_type: 'agent',
        status: !isInternalNote && updateStatusTo ? updateStatusTo : undefined,
      });
      setReplyText('');
      setToast({
        type: 'success',
        text: isInternalNote ? 'Internal note appended to case ledger.' : 'Reply dispatched to customer.',
      });
      fetchTicket();
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to record message.' });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await supportService.updateTicketStatus(ticket.id, newStatus);
      setToast({ type: 'success', text: `Ticket status set to ${newStatus}` });
      fetchTicket();
    } catch (err) {
      setToast({ type: 'error', text: 'Status update failed.' });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await supportService.assignTicket(ticket.id, newAgentId);
      setToast({ type: 'success', text: 'Agent reassigned.' });
      setIsAssignModalOpen(false);
      fetchTicket();
    } catch (err) {
      setToast({ type: 'error', text: 'Reassignment failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMergeSubmit = async (e) => {
    e.preventDefault();
    if (!targetMergeId) return;
    try {
      setActionLoading(true);
      await supportService.mergeTicket(ticket.id, targetMergeId);
      setToast({ type: 'success', text: 'Tickets merged successfully!' });
      setIsMergeModalOpen(false);
      navigate(`/app/support/tickets/${targetMergeId}`);
    } catch (err) {
      setToast({ type: 'error', text: 'Merge failed. Verify target ticket ID.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleKbSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await supportService.convertTicketToKb(ticket.id, {
        title: kbTitle,
        category_id: kbCategory,
      });
      setToast({ type: 'success', text: 'Knowledge Base article published!' });
      setIsKbModalOpen(false);
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to publish Knowledge Base article.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton type="details" />;
  if (error || !ticket) return <ErrorState message={error} onRetry={fetchTicket} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}>
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="cursor-pointer text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/app/support/tickets')}>
            Back to Queue
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-teal-700">{ticket.ticket_number}</span>
              <Badge
                variant={
                  ticket.priority === 'urgent'
                    ? 'danger'
                    : ticket.priority === 'high'
                    ? 'warning'
                    : ticket.priority === 'medium'
                    ? 'info'
                    : 'neutral'
                }
                size="sm"
              >
                {ticket.priority}
              </Badge>
              <Badge
                variant={
                  ticket.status === 'resolved' || ticket.status === 'closed'
                    ? 'success'
                    : ticket.status === 'in_progress'
                    ? 'info'
                    : 'neutral'
                }
                size="sm"
              >
                {ticket.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{ticket.subject}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {ticket.status !== 'resolved' && (
            <Button variant="teal" size="sm" icon={CheckCircle2} onClick={() => handleStatusChange('resolved')}>
              Mark Resolved
            </Button>
          )}
          {ticket.status === 'resolved' && (
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => handleStatusChange('open')}>
              Reopen Ticket
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={UserPlus} onClick={() => setIsAssignModalOpen(true)}>
            Reassign
          </Button>
          <Button variant="secondary" size="sm" icon={BookOpen} onClick={() => setIsKbModalOpen(true)}>
            Publish to KB
          </Button>
          <Button variant="secondary" size="sm" icon={GitMerge} onClick={() => setIsMergeModalOpen(true)}>
            Merge
          </Button>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Conversation + Composer), Right 1 Col (Sidebar & Meta) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Conversation Ledger & Reply Box */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Header Card */}
          <Card title="Issue Overview" noPadding>
            <div className="p-5 text-xs text-slate-800 space-y-3 leading-relaxed">
              <p className="whitespace-pre-wrap">{ticket.description}</p>
              {ticket.tags && ticket.tags.length > 0 && (
                <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 flex-wrap">
                  <span className="text-slate-400 font-medium">Tags:</span>
                  {ticket.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Conversation Thread */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Conversation History ({ticket.messages?.length || 0} messages)</span>
              <span className="text-[11px] text-slate-400">All responses immutable & audited</span>
            </div>

            <div className="space-y-3">
              {ticket.messages && ticket.messages.map((m) => {
                const isInternal = m.is_internal || m.message_type === 'internal_note';
                const isAgent = m.sender_type === 'agent';
                const isSystem = m.sender_type === 'system';

                if (isSystem) {
                  return (
                    <div key={m.id} className="text-center my-3">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[11px] font-mono border border-slate-200">
                        ● {m.message} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                }

                if (isInternal) {
                  return (
                    <div key={m.id} className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs shadow-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                        <div className="flex items-center gap-2 text-amber-900 font-semibold">
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Internal Staff Note — {m.user?.name || 'Support Staff'}</span>
                        </div>
                        <span className="text-[10px] text-amber-700/80">{new Date(m.created_at).toLocaleString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-amber-950 leading-relaxed">{m.message}</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl text-xs space-y-2 border shadow-xs ${
                      isAgent
                        ? 'bg-slate-50 border-slate-200 ml-4'
                        : 'bg-white border-teal-100 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${isAgent ? 'bg-slate-800' : 'bg-teal-600'}`}>
                          {(m.user?.name || ticket.customer?.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {isAgent ? m.user?.name || 'Support Specialist' : ticket.customer?.name || 'Customer'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isAgent ? 'Staff Response' : 'Client Message'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{m.message}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reply & Internal Note Composer */}
          <Card title="Reply / Internal Note Composer" noPadding>
            <form onSubmit={handleReplySubmit} className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setIsInternalNote(false)}
                  className={`pb-1 font-semibold border-b-2 cursor-pointer transition-colors ${
                    !isInternalNote
                      ? 'border-teal-600 text-teal-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Public Customer Reply
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternalNote(true)}
                  className={`pb-1 font-semibold border-b-2 flex items-center gap-1 cursor-pointer transition-colors ${
                    isInternalNote
                      ? 'border-amber-500 text-amber-700'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Internal Team Note (Private)
                </button>
              </div>

              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  isInternalNote
                    ? 'Write notes visible only to internal agents and staff...'
                    : 'Compose response to customer. Will notify client email address...'
                }
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-hidden focus:bg-white ${
                  isInternalNote
                    ? 'bg-amber-50/40 border-amber-200 focus:border-amber-500'
                    : 'bg-slate-50 border-slate-200 focus:border-teal-500'
                }`}
              />

              <div className="flex items-center justify-between pt-2">
                {!isInternalNote ? (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Set status upon reply:</span>
                    <select
                      value={updateStatusTo}
                      onChange={(e) => setUpdateStatusTo(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
                    >
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_for_customer">Waiting for Client</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Internal notes do not trigger first-response SLA or client alerts.
                  </div>
                )}

                <Button
                  type="submit"
                  variant={isInternalNote ? 'secondary' : 'teal'}
                  size="sm"
                  icon={Send}
                  loading={submittingReply}
                >
                  {isInternalNote ? 'Save Internal Note' : 'Dispatch Customer Reply'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side: Meta & SLA Scorecard */}
        <div className="space-y-6">
          {/* SLA Performance Card */}
          <Card title="SLA Compliance Engine">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500">SLA Policy</span>
                <span className="font-semibold text-slate-900">{ticket.sla_policy?.name || 'Standard SLA'}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">First Response Target:</span>
                  <span className="font-bold text-slate-800">
                    {ticket.first_response_due_at ? new Date(ticket.first_response_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">First Responded At:</span>
                  <span className="text-emerald-700 font-medium">
                    {ticket.first_responded_at ? new Date(ticket.first_responded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Awaiting Reply'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Resolution Deadline:</span>
                  <span className="font-bold text-slate-800">
                    {ticket.resolution_due_at ? new Date(ticket.resolution_due_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">SLA Compliance:</span>
                  <span className={`font-bold ${ticket.sla_status === 'breached' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ● {ticket.sla_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Profile Card */}
          <Card title="Customer Account Information">
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                  {(ticket.customer?.name || 'C').charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{ticket.customer?.name || 'Guest User'}</h4>
                  <p className="text-slate-500 text-[11px]">{ticket.customer?.email}</p>
                </div>
              </div>

              <div className="space-y-1 text-slate-600 text-[11px]">
                {ticket.customer?.phone && <div>Phone: <span className="font-medium text-slate-900">{ticket.customer.phone}</span></div>}
                <div>Account Status: <Badge variant="success" size="xs">Active Customer</Badge></div>
              </div>
            </div>
          </Card>

          {/* Ticket Metadata Card */}
          <Card title="Ticket Details">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Assigned Agent</span>
                <span className="font-semibold text-slate-900">{ticket.agent?.name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Category</span>
                <span className="text-slate-700">{ticket.category?.name || 'Technical'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Source</span>
                <span className="text-slate-700 font-mono text-[11px]">{ticket.source}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Created At</span>
                <span className="text-slate-700">{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
              {ticket.resolved_at && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-400">Resolved At</span>
                  <span className="text-emerald-700 font-medium">{new Date(ticket.resolved_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Reassign Agent Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Reassign Ticket</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Support Agent</label>
                <select
                  value={newAgentId}
                  onChange={(e) => setNewAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value={1}>Alexander Wright (Admin Specialist)</option>
                  <option value={2}>Chloe Bennett (Tier 2)</option>
                  <option value={3}>James Wilson (Billing Lead)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" loading={actionLoading}>
                  Confirm Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Merge with Another Ticket</h3>
              <button onClick={() => setIsMergeModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleMergeSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                All messages and internal notes will be merged into the target ticket. This ticket will be marked as closed.
              </p>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Ticket ID *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1"
                  value={targetMergeId}
                  onChange={(e) => setTargetMergeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsMergeModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" icon={GitMerge} loading={actionLoading}>
                  Merge Cases
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to KB Modal */}
      {isKbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Publish Resolution as Article</h3>
              <button onClick={() => setIsKbModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleKbSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={kbTitle}
                  onChange={(e) => setKbTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Category *</label>
                <select
                  value={kbCategory}
                  onChange={(e) => setKbCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value={1}>Getting Started</option>
                  <option value={2}>Billing & Plans</option>
                  <option value={3}>Point of Sale (POS)</option>
                  <option value={4}>Fixed Assets</option>
                  <option value={5}>Security & RBAC</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsKbModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" icon={BookOpen} loading={actionLoading}>
                  Publish Article
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetails;
