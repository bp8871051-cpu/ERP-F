import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  Building2,
  UserCheck,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Flame,
  Snowflake,
  Sparkles,
  Lock,
  Shield,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import LeadModal from './LeadModal';
import LeadConvertModal from './LeadConvertModal';

export const LeadList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin' || user?.is_super_admin === true;

  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Assignment states for Super Admin
  const [assignees, setAssignees] = useState([]);
  const [rowAssignees, setRowAssignees] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [assignmentNotice, setAssignmentNotice] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [leadSourceId, setLeadSourceId] = useState('');
  const [leadSources, setLeadSources] = useState([]);
  const [page, setPage] = useState(1);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState(null);

  useEffect(() => {
    loadLeadSources();
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      loadAssignees();
    }
  }, [isSuperAdmin]);

  const loadAssignees = async () => {
    try {
      const res = await crmService.getAssignees();
      setAssignees(res.data || []);
    } catch (err) {
      console.error('Failed to load assignees:', err);
    }
  };

  const handleExecuteAssign = async (leadId, targetAssigneeId) => {
    try {
      setAssigningId(leadId);
      await crmService.assignLead(leadId, targetAssigneeId);

      // Update lead assignment in local state immediately
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id === leadId) {
            const assignedUser = assignees.find((a) => a.id === targetAssigneeId) || null;
            return {
              ...l,
              assigned_to: targetAssigneeId,
              assigned_user: assignedUser,
              owner: assignedUser || l.owner,
            };
          }
          return l;
        })
      );

      const targetLead = leads.find((l) => l.id === leadId);
      const assigneeName = assignees.find((a) => a.id === targetAssigneeId)?.name || 'Unassigned';
      setAssignmentNotice(`Lead "${targetLead?.name || leadId}" successfully assigned to ${assigneeName}`);
      setTimeout(() => setAssignmentNotice(null), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign lead.');
    } finally {
      setAssigningId(null);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, status, leadSourceId, page]);

  const loadLeadSources = async () => {
    try {
      const res = await crmService.getLeadSources();
      setLeadSources(res.data || []);
    } catch (err) {
      console.error('Failed to load lead sources:', err);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await crmService.getLeads({
        search: search || undefined,
        status: status || undefined,
        lead_source_id: leadSourceId || undefined,
        page,
        per_page: 15,
      });
      const payload = res;
      setLeads(payload.data || payload || []);
      setMeta({
        current_page: payload.meta?.current_page || payload.current_page || 1,
        last_page: payload.meta?.last_page || payload.last_page || 1,
        total: payload.meta?.total || payload.total || 0,
      });
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await crmService.deleteLead(id);
        fetchLeads();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting lead.');
      }
    }
  };

  const handleScoreLead = async (id) => {
    try {
      const res = await crmService.scoreLead(id);
      alert(`Lead scored! Authoritative Score: ${res.score} (${res.category})`);
      fetchLeads();
    } catch (err) {
      alert('Error calculating score.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await crmService.exportLeads({ search, status });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error downloading CSV export.');
    }
  };

  const getScoreBadge = (score) => {
    const s = Number(score || 0);
    if (s >= 81) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <Flame className="w-3 h-3 text-rose-600" />
          {s} • Very Hot
        </span>
      );
    }
    if (s >= 61) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Flame className="w-3 h-3 text-amber-600" />
          {s} • Hot
        </span>
      );
    }
    if (s >= 31) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Sparkles className="w-3 h-3 text-blue-600" />
          {s} • Warm
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Snowflake className="w-3 h-3 text-slate-400" />
        {s} • Cold
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 shrink-0" />
            <span>CRM Lead Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative lead scoring (0-100), automated qualification rules, and one-click customer conversion.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingLead(null);
              setModalOpen(true);
            }}
          >
            Register Lead
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4 !overflow-visible">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative w-full lg:max-w-xs xl:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by lead name, company, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 sm:flex-none sm:w-40 relative z-10">
              <SearchableSelect
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'unqualified', label: 'Unqualified' },
                  { value: 'converted', label: 'Converted' },
                  { value: 'lost', label: 'Lost' }
                ]}
                value={status}
                onChange={(val) => {
                  setStatus(val);
                  setPage(1);
                }}
                placeholder="All Statuses"
                searchable={false}
              />
            </div>

            <div className="flex-1 sm:flex-none sm:w-40 relative z-10">
              <SearchableSelect
                options={[
                  { value: '', label: 'All Sources' },
                  ...leadSources.map((s) => ({ value: String(s.id), label: s.name }))
                ]}
                value={String(leadSourceId)}
                onChange={(val) => {
                  setLeadSourceId(val);
                  setPage(1);
                }}
                placeholder="All Sources"
                searchable={false}
              />
            </div>

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchLeads} className="shrink-0">
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Assignment Success Notice */}
      {assignmentNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{assignmentNotice}</span>
          </div>
          <button onClick={() => setAssignmentNotice(null)} className="text-emerald-600 hover:text-emerald-800 text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Leads Table */}
      <Card className="overflow-hidden" noPadding>
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto min-h-[460px] pb-24">
              <table className="w-full min-w-[1100px] text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Lead Name</th>
                    <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Company</th>
                    <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">Contact Info</th>
                    <th className="py-3 px-4 min-w-[90px] whitespace-nowrap">Source</th>
                    <th className="py-3 px-4 min-w-[80px] whitespace-nowrap">Score</th>
                    <th className="py-3 px-4 min-w-[85px] whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 min-w-[270px] whitespace-nowrap">Assigned To</th>
                    <th className="py-3 px-4 min-w-[95px] whitespace-nowrap">Created Date</th>
                    <th className="py-3 px-4 text-right min-w-[130px] whitespace-nowrap sticky right-0 bg-slate-50 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">
                        No CRM leads found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    leads.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <button
                            onClick={() => navigate(`/app/crm/leads/${l.id}`)}
                            className="hover:text-teal-600 text-left font-bold cursor-pointer"
                          >
                            {l.name}
                          </button>
                          {l.job_title && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {l.job_title}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {l.company_name || 'Individual Prospect'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col text-[11px] text-slate-600 gap-0.5">
                            {l.email && (
                              <span className="flex items-center gap-1.5 truncate max-w-[170px]">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className={l.has_contact_access === false ? 'font-mono text-slate-400' : ''}>
                                  {l.email}
                                </span>
                                {l.has_contact_access === false && (
                                  <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" title="Contact details protected - Assigned employee only" />
                                )}
                              </span>
                            )}
                            {l.phone && (
                              <span className="flex items-center gap-1.5 text-slate-500">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className={l.has_contact_access === false ? 'font-mono text-slate-400' : ''}>
                                  {l.phone}
                                </span>
                              </span>
                            )}
                            {l.has_contact_access === false && (
                              <span className="inline-flex items-center gap-1 text-[9px] text-amber-600 font-medium">
                                <Lock className="w-2.5 h-2.5" /> Protected
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant="neutral" size="sm">
                            {l.lead_source?.name || 'Website'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">{getScoreBadge(l.score)}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge
                            variant={
                              l.status === 'qualified'
                                ? 'teal'
                                : l.status === 'converted'
                                ? 'success'
                                : l.status === 'lost'
                                ? 'danger'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {l.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {isSuperAdmin ? (
                            <div className="flex flex-col gap-1 py-0.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-44 sm:w-48 shrink-0">
                                  <SearchableSelect
                                    options={[
                                      { value: '', label: '-- Assign Lead To --' },
                                      ...assignees.map((a) => ({
                                        value: String(a.id),
                                        label: `${a.name} (${typeof a.department === 'string' ? a.department : (a.department?.name || a.role)})`
                                      }))
                                    ]}
                                    value={rowAssignees[l.id] !== undefined ? String(rowAssignees[l.id]) : (l.assigned_to ? String(l.assigned_to) : '')}
                                    onChange={(val) => setRowAssignees(prev => ({ ...prev, [l.id]: val }))}
                                    placeholder="-- Assign Lead To --"
                                    searchPlaceholder="Search employee name..."
                                    disabled={assigningId === l.id}
                                    menuClassName="w-64 shadow-2xl"
                                  />
                                </div>
                                <button
                                  type="button"
                                  disabled={assigningId === l.id}
                                  onClick={() => {
                                    const val = rowAssignees[l.id] !== undefined ? rowAssignees[l.id] : (l.assigned_to ? String(l.assigned_to) : '');
                                    handleExecuteAssign(l.id, val ? Number(val) : null);
                                  }}
                                  title="Assign Lead"
                                  className="px-2.5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-lg text-xs shrink-0 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs disabled:opacity-50 whitespace-nowrap"
                                >
                                  {assigningId === l.id ? (
                                    <RefreshCw className="w-3.5 h-3.5 text-white animate-spin shrink-0" />
                                  ) : (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                                      <span>Assign Lead</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              {l.assigned_to ? (
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                  Current: <strong className="text-teal-700">{l.assigned_user?.name || l.owner?.name}</strong>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="font-medium text-slate-700">
                                {l.assigned_to ? (l.assigned_user?.name || l.owner?.name || 'Assigned') : 'Unassigned'}
                              </span>
                              {l.assigned_to && l.assigned_to === user?.id && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                  You
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {new Date(l.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 transition-colors z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">
                          <div className="flex items-center justify-end gap-1.5 shrink-0">
                            {l.status !== 'converted' && (
                              <button
                                onClick={() => {
                                  setConvertingLead(l);
                                  setConvertModalOpen(true);
                                }}
                                title="Convert to Customer & Deal"
                                className="px-2 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                              >
                                <UserCheck className="w-3 h-3" /> Convert
                              </button>
                            )}

                            <button
                              onClick={() => navigate(`/app/crm/leads/${l.id}`)}
                              title="View Lead Details"
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingLead(l);
                                setModalOpen(true);
                              }}
                              title="Edit Lead"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(l.id)}
                              title="Delete Lead"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing <strong>{leads.length}</strong> of <strong>{meta.total}</strong> leads
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="xs"
                  icon={ChevronLeft}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="px-2 font-medium">
                  Page {meta.current_page} of {meta.last_page}
                </span>
                <Button
                  variant="secondary"
                  size="xs"
                  icon={ChevronRight}
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Lead Create / Edit Modal */}
      <LeadModal
        isOpen={modalOpen}
        lead={editingLead}
        onClose={() => {
          setModalOpen(false);
          setEditingLead(null);
        }}
        onSuccess={fetchLeads}
      />

      {/* Lead Convert Modal */}
      <LeadConvertModal
        isOpen={convertModalOpen}
        lead={convertingLead}
        onClose={() => {
          setConvertModalOpen(false);
          setConvertingLead(null);
        }}
        onSuccess={fetchLeads}
      />
    </div>
  );
};

export default LeadList;
