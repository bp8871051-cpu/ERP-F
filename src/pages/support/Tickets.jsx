import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Tag,
  X,
} from 'lucide-react';
import supportService from '../../services/supportService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import SearchableSelect from '../../components/ui/SearchableSelect';

export const Tickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [slaStatus, setSlaStatus] = useState('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    subject: '',
    description: '',
    customer_name: '',
    customer_email: '',
    priority: 'medium',
    category_id: 1,
    source: 'web',
  });
  const [toast, setToast] = useState(null);

  const fetchTickets = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await supportService.getTickets({
        page,
        search,
        status: status !== 'all' ? status : undefined,
        priority: priority !== 'all' ? priority : undefined,
        sla_status: slaStatus !== 'all' ? slaStatus : undefined,
      });
      setTickets(res.data || []);
      setPagination({
        current_page: res.current_page || 1,
        last_page: res.last_page || 1,
        total: res.total || 0,
      });
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Unable to load support tickets from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, [status, priority, slaStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets(1);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const newTicket = await supportService.createTicket(createForm);
      setToast({ type: 'success', text: `Ticket #${newTicket.ticket_number} created with SLA target assigned!` });
      setIsCreateOpen(false);
      setCreateForm({
        subject: '',
        description: '',
        customer_name: '',
        customer_email: '',
        priority: 'medium',
        category_id: 1,
        source: 'web',
      });
      fetchTickets(1);
    } catch (err) {
      setToast({ type: 'error', text: 'Failed to create ticket. Verify required fields.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}>
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="cursor-pointer text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Ticket Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end incident tracking, multi-tier escalation, dynamic SLA countdown, and resolution audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => fetchTickets(pagination.current_page)}>
            Refresh
          </Button>
          <Button variant="teal" size="sm" icon={PlusCircle} onClick={() => setIsCreateOpen(true)}>
            New Ticket
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <Card noPadding className="!overflow-visible">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 !overflow-visible">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket #, subject, customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </form>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 z-30">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Status:</span>
              <div className="w-32">
                <SearchableSelect
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'open', label: 'Open' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'waiting_for_customer', label: 'Waiting for Client' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'closed', label: 'Closed' }
                  ]}
                  value={status}
                  onChange={(val) => setStatus(val)}
                  searchable={false}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 z-20">
              <span className="text-slate-500 font-medium">Priority:</span>
              <div className="w-32">
                <SearchableSelect
                  options={[
                    { value: 'all', label: 'All Priorities' },
                    { value: 'urgent', label: 'Urgent (P1)' },
                    { value: 'high', label: 'High (P2)' },
                    { value: 'medium', label: 'Medium (P3)' },
                    { value: 'low', label: 'Low (P4)' }
                  ]}
                  value={priority}
                  onChange={(val) => setPriority(val)}
                  searchable={false}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 z-10">
              <span className="text-slate-500 font-medium">SLA:</span>
              <div className="w-32">
                <SearchableSelect
                  options={[
                    { value: 'all', label: 'All SLAs' },
                    { value: 'within_sla', label: 'Within SLA' },
                    { value: 'warning', label: 'SLA Warning' },
                    { value: 'breached', label: 'Breached' }
                  ]}
                  value={slaStatus}
                  onChange={(val) => setSlaStatus(val)}
                  searchable={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        {loading ? (
          <LoadingSkeleton type="table" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchTickets(1)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Subject & Issue</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assigned Agent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">SLA Compliance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-400">
                      No support tickets found in this filter range.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-teal-700">
                        {t.ticket_number}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{t.subject}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{t.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{t.customer?.name || 'Guest User'}</div>
                        <div className="text-[10px] text-slate-500">{t.customer?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {t.category?.name || 'Technical'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            t.priority === 'urgent'
                              ? 'danger'
                              : t.priority === 'high'
                              ? 'warning'
                              : t.priority === 'medium'
                              ? 'info'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {t.agent?.name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            t.status === 'resolved' || t.status === 'closed'
                              ? 'success'
                              : t.status === 'in_progress'
                              ? 'info'
                              : t.status === 'waiting_for_customer'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {t.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold ${
                            t.sla_status === 'breached'
                              ? 'text-rose-600'
                              : t.sla_status === 'warning'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {t.sla_status === 'breached' ? <ShieldAlert className="w-3.5 h-3.5 mr-1" /> : <ShieldCheck className="w-3.5 h-3.5 mr-1" />}
                          {t.sla_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={ArrowRight}
                          onClick={() => navigate(`/app/support/tickets/${t.id}`)}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total tickets)</span>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="xs"
              disabled={pagination.current_page <= 1}
              onClick={() => fetchTickets(pagination.current_page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="xs"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchTickets(pagination.current_page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 !overflow-visible">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Create New Support Ticket</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Ticket Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inbound API Latency / Invoice Correction"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Vance"
                    value={createForm.customer_name}
                    onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@example.com"
                    value={createForm.customer_email}
                    onChange={(e) => setCreateForm({ ...createForm, customer_email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="z-20">
                  <label className="block font-medium text-slate-700 mb-1">Priority Tier *</label>
                  <SearchableSelect
                    options={[
                      { value: 'low', label: 'Low (72h SLA)' },
                      { value: 'medium', label: 'Medium (24h SLA)' },
                      { value: 'high', label: 'High (8h SLA)' },
                      { value: 'urgent', label: 'Urgent (4h SLA)' }
                    ]}
                    value={createForm.priority}
                    onChange={(val) => setCreateForm({ ...createForm, priority: val })}
                    searchable={false}
                  />
                </div>
                <div className="z-10">
                  <label className="block font-medium text-slate-700 mb-1">Incident Category *</label>
                  <SearchableSelect
                    options={[
                      { value: 1, label: 'Technical & Infrastructure' },
                      { value: 2, label: 'Billing & Invoicing' },
                      { value: 3, label: 'Software & API' },
                      { value: 4, label: 'Hardware Workstation' },
                      { value: 5, label: 'Account Access' }
                    ]}
                    value={createForm.category_id}
                    onChange={(val) => setCreateForm({ ...createForm, category_id: val })}
                    searchable={false}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Issue Description & Technical Notes *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the client issue, error messages or logs..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="teal" size="sm" icon={Ticket} loading={actionLoading}>
                  Create & Launch SLA
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
