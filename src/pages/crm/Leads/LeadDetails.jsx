import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Target,
  Building2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  DollarSign,
  Tag,
  Calendar,
  CheckSquare,
  FileText,
  PhoneCall,
  Clock,
  Edit,
  ArrowLeft,
  UserCheck,
  Flame,
  Snowflake,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lock,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import ErrorState from '../../../components/ui/ErrorState';
import ActivityTimeline from '../Activities/ActivityTimeline';
import {
  LogCallModal,
  ScheduleMeetingModal,
  SendEmailModal,
  AddTaskModal,
  AddNoteModal,
} from '../Activities/ActivityModals';
import LeadModal from './LeadModal';
import LeadConvertModal from './LeadConvertModal';

export const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin' || user?.is_super_admin === true;

  const [lead, setLead] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(undefined);
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [id]);

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

  const handleAssign = async (newAssigneeId) => {
    try {
      setAssigning(true);
      await crmService.assignLead(id, newAssigneeId);
      await fetchLead();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign lead.');
    } finally {
      setAssigning(false);
    }
  };

  const fetchLead = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmService.getLead(id);
      setLead(res.data);
      setTimeline(res.timeline || []);
      setScoreDetails(res.score_details || null);
    } catch (err) {
      console.error('Failed to load lead details:', err);
      setError('Lead not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleReScore = async () => {
    try {
      const res = await crmService.scoreLead(id);
      alert(`Lead scored! Authoritative Score: ${res.score} (${res.category})`);
      fetchLead();
    } catch (err) {
      alert('Error updating score.');
    }
  };

  if (loading) return <LoadingSkeleton type="details" />;
  if (error || !lead) return <ErrorState message={error} onRetry={fetchLead} />;

  const getScoreBadge = (score) => {
    const s = Number(score || 0);
    if (s >= 81) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <Flame className="w-4 h-4 text-rose-600" />
          {s} / 100 • Very Hot Lead
        </span>
      );
    }
    if (s >= 61) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Flame className="w-4 h-4 text-amber-600" />
          {s} / 100 • Hot Lead
        </span>
      );
    }
    if (s >= 31) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Sparkles className="w-4 h-4 text-blue-600" />
          {s} / 100 • Warm Lead
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Snowflake className="w-4 h-4 text-slate-400" />
        {s} / 100 • Cold Lead
      </span>
    );
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'score', label: 'Score Rules Breakdown' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'activities', label: `Activities (${lead.activities?.length || 0})` },
    { key: 'deals', label: `Deals (${lead.deals?.length || 0})` },
    { key: 'tasks', label: `Tasks (${lead.tasks?.length || 0})` },
    { key: 'emails', label: `Emails (${lead.emails?.length || 0})` },
    { key: 'calls', label: `Calls (${lead.calls?.length || 0})` },
    { key: 'meetings', label: `Meetings (${lead.meetings?.length || 0})` },
    { key: 'notes', label: `Notes (${lead.notes?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/app/crm/leads')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Leads Directory
        </button>
      </div>

      {/* Header Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
              {lead.name?.[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{lead.name}</h1>
                <Badge
                  variant={
                    lead.status === 'qualified'
                      ? 'teal'
                      : lead.status === 'converted'
                      ? 'success'
                      : lead.status === 'lost'
                      ? 'danger'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {lead.status}
                </Badge>
                {getScoreBadge(lead.score)}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                {lead.job_title && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {lead.job_title}
                  </span>
                )}
                {lead.company_name && (
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    {lead.company_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Source: {lead.lead_source?.name || 'Website Inbound'}
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  Assigned: {lead.assigned_to ? (lead.assigned_user?.name || lead.owner?.name || 'Assigned') : 'Unassigned'}
                </span>
                {lead.has_contact_access === false && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-600" />
                    Contact Protected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {lead.status !== 'converted' && (
              <Button
                variant="teal"
                size="sm"
                icon={UserCheck}
                onClick={() => setConvertOpen(true)}
              >
                Convert Lead
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleReScore}>
              Re-Calculate Score
            </Button>
            <Button variant="secondary" size="sm" icon={PhoneCall} onClick={() => setCallOpen(true)}>
              Call
            </Button>
            <Button variant="secondary" size="sm" icon={Mail} onClick={() => setEmailOpen(true)}>
              Email
            </Button>
            <Button variant="secondary" size="sm" icon={Calendar} onClick={() => setMeetingOpen(true)}>
              Meeting
            </Button>
            <Button variant="secondary" size="sm" icon={CheckSquare} onClick={() => setTaskOpen(true)}>
              Task
            </Button>
            <Button variant="secondary" size="sm" icon={Edit} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          </div>
        </div>

        {/* 4 Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Expected Value</span>
            <span className="text-lg font-bold text-slate-900">
              ₹{Number(lead.expected_value || lead.budget || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Budget Indicated</span>
            <span className="text-lg font-bold text-teal-700">
              ₹{Number(lead.budget || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Expected Close</span>
            <span className="text-xs font-semibold text-slate-700 block mt-1">
              {lead.expected_close_date || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Assigned Employee</span>
            <span className="text-xs font-semibold text-slate-700 block mt-1">
              {lead.assigned_to ? (lead.assigned_user?.name || lead.owner?.name || 'Assigned') : 'Unassigned'}
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Lead Information" className="lg:col-span-2">
            {lead.has_contact_access === false && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Contact Details Protected by Privacy Policy</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    This lead is unassigned or assigned to another employee. Full email and phone number are visible only to the currently assigned employee or a Super Admin.
                  </div>
                </div>
              </div>
            )}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <dt className="text-slate-400 font-medium flex items-center justify-between">
                  <span>Email Address</span>
                  {lead.has_contact_access === false && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                      <Lock className="w-2.5 h-2.5" /> Protected
                    </span>
                  )}
                </dt>
                <dd className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  <span className={lead.has_contact_access === false ? 'font-mono text-slate-500' : ''}>
                    {lead.email || '—'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium flex items-center justify-between">
                  <span>Phone</span>
                  {lead.has_contact_access === false && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                      <Lock className="w-2.5 h-2.5" /> Protected
                    </span>
                  )}
                </dt>
                <dd className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span className={lead.has_contact_access === false ? 'font-mono text-slate-500' : ''}>
                    {lead.phone || '—'}
                  </span>
                </dd>
              </div>

              {/* Super Admin Assignment Control Row */}
              <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                <dt className="text-slate-400 font-medium mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    Lead Assignment {isSuperAdmin ? '(Super Admin Assignment Control)' : ''}
                  </span>
                  {isSuperAdmin && (
                    <span className="text-[10px] font-bold text-amber-700 uppercase">
                      Super Admin Only
                    </span>
                  )}
                </dt>
                {isSuperAdmin ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md mt-1">
                    <div className="flex-1">
                      <SearchableSelect
                        options={[
                          { value: '', label: '-- Assign Lead To --' },
                          ...assignees.map((a) => ({
                            value: String(a.id),
                            label: `${a.name} (${typeof a.department === 'string' ? a.department : (a.department?.name || a.role)})`
                          }))
                        ]}
                        value={selectedAssignee !== undefined ? String(selectedAssignee) : (lead.assigned_to ? String(lead.assigned_to) : '')}
                        onChange={(val) => setSelectedAssignee(val)}
                        placeholder="-- Assign Lead To --"
                        searchPlaceholder="Search employee name..."
                        disabled={assigning}
                        menuClassName="w-72 shadow-2xl"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={assigning}
                      onClick={() => {
                        const val = selectedAssignee !== undefined ? selectedAssignee : (lead.assigned_to ? String(lead.assigned_to) : '');
                        handleAssign(val ? Number(val) : null);
                      }}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-lg text-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs disabled:opacity-50 whitespace-nowrap"
                      title="Assign Lead"
                    >
                      {assigning ? (
                        <RefreshCw className="w-3.5 h-3.5 text-white animate-spin shrink-0" />
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Assign Lead</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <dd className="font-semibold text-slate-800 mt-1 flex items-center gap-2">
                    <span>{lead.assigned_to ? (lead.assigned_user?.name || lead.owner?.name || 'Assigned') : 'Unassigned'}</span>
                    {lead.assigned_to === user?.id && (
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded text-[10px] font-bold border border-teal-200">
                        Assigned to You
                      </span>
                    )}
                  </dd>
                )}
              </div>

              <div>
                <dt className="text-slate-400 font-medium">Website</dt>
                <dd className="text-teal-600 mt-0.5">
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {lead.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Industry & Company Size</dt>
                <dd className="text-slate-800 mt-0.5">
                  {lead.industry || 'Technology'} • {lead.company_size || '50-200'} employees
                </dd>
              </div>
              {lead.campaign && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <dt className="text-slate-400 font-medium">Associated Marketing Campaign</dt>
                  <dd className="font-semibold text-purple-700 mt-0.5">{lead.campaign.name} ({lead.campaign.type})</dd>
                </div>
              )}
              {lead.notes && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <dt className="text-slate-400 font-medium">Notes & Qualification Criteria</dt>
                  <dd className="text-slate-700 mt-0.5 italic">{lead.notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Lead Qualification Status */}
          <Card title="Lead Qualification Status" subtitle="Authoritative Engine">
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Authoritative Score
                </span>
                <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
                  {lead.score} / 100
                </span>
                <span className="text-xs font-semibold text-teal-700 mt-1 block">
                  Status: {lead.status?.toUpperCase()}
                </span>
              </div>

              {lead.status !== 'converted' ? (
                <Button
                  variant="teal"
                  size="sm"
                  className="w-full justify-center"
                  icon={UserCheck}
                  onClick={() => setConvertOpen(true)}
                >
                  Convert Lead to Customer & Deal
                </Button>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-xs font-medium text-center">
                  This lead has been successfully converted into an active customer and deal.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Score Rules Breakdown */}
      {activeTab === 'score' && (
        <Card
          title="Authoritative Lead Scoring Engine"
          subtitle="Score calculated by Laravel LeadScoringService rules (Max 100)"
        >
          <div className="space-y-3">
            {[
              { rule: 'Valid Email Provided', points: 10, passed: !!lead.email },
              { rule: 'Phone Number Provided', points: 10, passed: !!lead.phone },
              { rule: 'Company Website Provided', points: 10, passed: !!lead.website },
              { rule: 'Budget Indicated (> 0)', points: 15, passed: Number(lead.budget) > 0 },
              {
                rule: 'Corporate Domain Email (Non-Gmail/Yahoo)',
                points: 10,
                passed:
                  lead.email &&
                  !lead.email.includes('@gmail') &&
                  !lead.email.includes('@yahoo') &&
                  !lead.email.includes('@hotmail'),
              },
              { rule: 'Engaged with Marketing Campaign', points: 15, passed: !!lead.campaign_id },
              { rule: 'Meeting or Call Completed', points: 20, passed: (lead.activities?.length || 0) > 0 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className={item.passed ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                    {item.rule}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">+{item.points} pts</span>
                  <Badge variant={item.passed ? 'success' : 'neutral'} size="sm">
                    {item.passed ? 'Earned' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab: Timeline */}
      {activeTab === 'timeline' && (
        <Card title="Chronological Activity Timeline" subtitle="Interactions logged on this prospect">
          <ActivityTimeline activities={timeline} />
        </Card>
      )}

      {/* Tab: Deals */}
      {activeTab === 'deals' && (
        <Card title="Deals Linked to Lead" noPadding>
          <div className="divide-y divide-slate-100">
            {lead.deals?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No deals linked to this lead.</div>
            ) : (
              lead.deals?.map((d) => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/app/crm/deals/${d.id}`)}
                  className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-900 block hover:text-teal-600">{d.name}</span>
                    <span className="text-slate-400 text-[11px]">
                      Pipeline: {d.pipeline?.name} • Stage: {d.stage?.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      {d.currency === 'INR' ? '₹' : '$'}{Number(d.value).toLocaleString()}
                    </span>
                    <Badge variant={d.status === 'won' ? 'success' : d.status === 'lost' ? 'danger' : 'teal'} size="sm">
                      {d.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab: Activities */}
      {activeTab === 'activities' && (
        <Card title="Logged Activities" noPadding>
          <div className="divide-y divide-slate-100">
            {lead.activities?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No activities recorded.</div>
            ) : (
              lead.activities?.map((a) => (
                <div key={a.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">{a.subject}</span>
                    <span className="text-[11px] text-slate-400">{a.description}</span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {a.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab: Tasks */}
      {activeTab === 'tasks' && (
        <Card title="Tasks" noPadding>
          <div className="divide-y divide-slate-100">
            {lead.tasks?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No pending tasks.</div>
            ) : (
              lead.tasks?.map((t) => (
                <div key={t.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">{t.title}</span>
                    <span className="text-[11px] text-slate-400">Due: {t.due_date}</span>
                  </div>
                  <Badge variant={t.priority === 'urgent' ? 'danger' : 'neutral'} size="sm">
                    {t.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab: Emails */}
      {activeTab === 'emails' && (
        <Card title="Dispatched Emails" noPadding>
          <div className="divide-y divide-slate-100">
            {lead.emails?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No emails sent.</div>
            ) : (
              lead.emails?.map((e) => (
                <div key={e.id} className="p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{e.subject}</span>
                    <span className="text-[10px] text-slate-400">{e.sent_at || e.created_at}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{e.body}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab: Calls */}
      {activeTab === 'calls' && (
        <Card title="Calls" noPadding>
          <div className="divide-y divide-slate-100">
            {lead.calls?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No calls logged.</div>
            ) : (
              lead.calls?.map((c) => (
                <div key={c.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 capitalize block">
                      {c.call_type} Call ({c.duration_minutes} mins)
                    </span>
                    <span className="text-slate-500 text-[11px]">{c.notes}</span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {c.outcome}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab: Meetings */}
      {activeTab === 'meetings' && (
        <Card title="Scheduled Meetings" noPadding>
          <div className="divide-y divide-slate-100">
            {lead.meetings?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No meetings scheduled.</div>
            ) : (
              lead.meetings?.map((m) => (
                <div key={m.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">{m.title}</span>
                    <span className="text-slate-400 text-[11px]">
                      {m.meeting_date} • {m.start_time} - {m.end_time} • {m.location}
                    </span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {m.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <Card title="Saved Notes" noPadding>
          <div className="divide-y divide-slate-100">
            {lead.notes?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No notes logged.</div>
            ) : (
              lead.notes?.map((n) => (
                <div key={n.id} className="p-3.5 text-xs">
                  <span className="font-bold text-slate-800 block">{n.title}</span>
                  <p className="text-slate-600 mt-1 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Activity Modals */}
      <LogCallModal
        isOpen={callOpen}
        onClose={() => setCallOpen(false)}
        onSuccess={fetchLead}
        defaultEntity={{ lead_id: lead.id }}
      />
      <ScheduleMeetingModal
        isOpen={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        onSuccess={fetchLead}
        defaultEntity={{ lead_id: lead.id }}
      />
      <SendEmailModal
        isOpen={emailOpen}
        onClose={() => setEmailOpen(false)}
        onSuccess={fetchLead}
        defaultEntity={{ lead_id: lead.id, email: lead.email }}
      />
      <AddTaskModal
        isOpen={taskOpen}
        onClose={() => setTaskOpen(false)}
        onSuccess={fetchLead}
        defaultEntity={{ lead_id: lead.id }}
      />
      <AddNoteModal
        isOpen={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSuccess={fetchLead}
        defaultEntity={{ lead_id: lead.id }}
      />
      <LeadModal
        isOpen={editOpen}
        lead={lead}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchLead}
      />
      <LeadConvertModal
        isOpen={convertOpen}
        lead={lead}
        onClose={() => setConvertOpen(false)}
        onSuccess={fetchLead}
      />
    </div>
  );
};

export default LeadDetails;
