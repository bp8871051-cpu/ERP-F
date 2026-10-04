import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  Trash2,
  Archive,
  RefreshCw,
  PlusCircle,
  Ticket as TicketIcon,
  UserCheck,
  X,
  MessageSquare,
  Globe,
  Inbox,
} from 'lucide-react';
import supportService from '../../services/supportService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';

export const ContactMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [source, setSource] = useState('all');

  // Modals
  const [viewMessage, setViewMessage] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [convertMessage, setConvertMessage] = useState(null);
  const [convertPriority, setConvertPriority] = useState('medium');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await supportService.getContactMessages({
        page,
        search,
        status: status !== 'all' ? status : undefined,
        source: source !== 'all' ? source : undefined,
      });
      setMessages(res.data || []);
      setPagination({
        current_page: res.current_page || 1,
        last_page: res.last_page || 1,
        total: res.total || 0,
      });
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      setError('Unable to load customer inquiries from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(1);
  }, [status, source]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMessages(1);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage || !replyText.trim()) return;

    try {
      setActionLoading(true);
      await supportService.replyContactMessage(replyMessage.id, replyText);
      setToast({ type: 'success', text: `Reply sent successfully to ${replyMessage.email}` });
      setReplyMessage(null);
      setReplyText('');
      fetchMessages(pagination.current_page);
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to dispatch reply.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    if (!convertMessage) return;

    try {
      setActionLoading(true);
      const res = await supportService.convertContactMessage(convertMessage.id, {
        priority: convertPriority,
      });
      setToast({ type: 'success', text: `Message successfully converted to Ticket #${res.ticket_number || ''}` });
      setConvertMessage(null);
      fetchMessages(pagination.current_page);
    } catch (err) {
      setToast({ type: 'error', text: 'Conversion to ticket failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}>
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="cursor-pointer text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Messages & Inquiries</h1>
          <p className="text-xs text-slate-500 mt-1">
            Inbound queries from website contact forms, CRM channels, support portal, and email endpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => fetchMessages(pagination.current_page)}>
            Refresh
          </Button>
          <Button variant="teal" size="sm" icon={TicketIcon} onClick={() => navigate('/app/support/tickets')}>
            View All Tickets
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card noPadding>
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </form>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="converted">Converted</option>
                <option value="archived">Archived</option>
                <option value="spam">Spam</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Source:</span>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
              >
                <option value="all">All Sources</option>
                <option value="website">Website Form</option>
                <option value="email">Direct Email</option>
                <option value="crm">CRM Lead</option>
                <option value="support_form">Support Form</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSkeleton type="table" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchMessages(1)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Sender Contact</th>
                  <th className="px-4 py-3">Subject & Inquiry</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Received At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      No inbound contact inquiries match the active criteria.
                    </td>
                  </tr>
                ) : (
                  messages.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-500">{m.email}</div>
                        {m.phone && <div className="text-[10px] text-slate-400">{m.phone}</div>}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-slate-900 truncate">{m.subject}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{m.message}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {m.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            m.status === 'new'
                              ? 'info'
                              : m.status === 'replied'
                              ? 'success'
                              : m.status === 'converted'
                              ? 'primary'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {m.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {m.assigned_agent?.name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="xs" onClick={() => setViewMessage(m)}>
                            View
                          </Button>
                          <Button variant="secondary" size="xs" onClick={() => { setReplyMessage(m); setReplyText(''); }}>
                            Reply
                          </Button>
                          {m.status !== 'converted' && (
                            <Button variant="teal" size="xs" icon={TicketIcon} onClick={() => setConvertMessage(m)}>
                              Convert
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} inquiries)</span>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="xs"
              disabled={pagination.current_page <= 1}
              onClick={() => fetchMessages(pagination.current_page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="xs"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchMessages(pagination.current_page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* View Message Modal */}
      {viewMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Inquiry Details</h3>
              <button onClick={() => setViewMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">From</span>
                  <span className="font-semibold text-slate-900">{viewMessage.name}</span>
                  <span className="text-slate-500 block">{viewMessage.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Source & Status</span>
                  <span className="font-medium text-slate-700">{viewMessage.source} • {viewMessage.status}</span>
                  <span className="text-slate-400 block">{new Date(viewMessage.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Subject</span>
                <p className="font-semibold text-slate-900">{viewMessage.subject}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Message Body</span>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-wrap text-slate-800 leading-relaxed">
                  {viewMessage.message}
                </div>
              </div>
              {viewMessage.reply_message && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Staff Reply Dispatched</span>
                  <div className="bg-teal-50/60 p-4 rounded-lg border border-teal-100 whitespace-pre-wrap text-teal-900 leading-relaxed">
                    {viewMessage.reply_message}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setViewMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Message Modal */}
      {replyMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Reply to {replyMessage.name}</h3>
              <button onClick={() => setReplyMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleReplySubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500">Replying to inquiry regarding:</div>
                <div className="font-semibold text-slate-900">{replyMessage.subject}</div>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Dispatch Response (Sent to {replyMessage.email}) *</label>
                <textarea
                  required
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Dear client, thank you for reaching out..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setReplyMessage(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" icon={Send} loading={actionLoading}>
                  Send Email Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Ticket Modal */}
      {convertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Convert Inquiry to Support Ticket</h3>
              <button onClick={() => setConvertMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConvertSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                This will create a formal ticket in the support queue for <b>{convertMessage.name}</b> and assign SLA resolution deadlines. Existing customer records are matched automatically.
              </p>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Ticket Subject</label>
                <input
                  type="text"
                  disabled
                  value={convertMessage.subject}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Set Ticket Priority *</label>
                <select
                  value={convertPriority}
                  onChange={(e) => setConvertPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                >
                  <option value="low">Low Priority (72h SLA)</option>
                  <option value="medium">Medium Priority (24h SLA)</option>
                  <option value="high">High Priority (8h SLA)</option>
                  <option value="urgent">Urgent Escalation (4h SLA)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setConvertMessage(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" icon={TicketIcon} loading={actionLoading}>
                  Generate Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
