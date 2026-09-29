import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  DollarSign,
  TrendingUp,
  Tag,
  Calendar,
  CheckSquare,
  FileText,
  PhoneCall,
  Clock,
  Edit,
  ArrowLeft,
  Plus,
  Receipt,
  ShoppingCart,
  Send,
} from 'lucide-react';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';
import ActivityTimeline from '../Activities/ActivityTimeline';
import {
  LogCallModal,
  ScheduleMeetingModal,
  SendEmailModal,
  AddTaskModal,
  AddNoteModal,
} from '../Activities/ActivityModals';
import ContactModal from './ContactModal';

export const ContactDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [stats, setStats] = useState({ total_deals: 0, total_revenue: 0, won_deals: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmService.getContact(id);
      setContact(res.data);
      setTimeline(res.timeline || []);
      setStats(res.stats || { total_deals: 0, total_revenue: 0, won_deals: 0 });
    } catch (err) {
      console.error('Failed to load contact details:', err);
      setError('Contact not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton type="details" />;
  if (error || !contact) return <ErrorState message={error} onRetry={fetchContact} />;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'deals', label: `Deals (${contact.deals?.length || 0})` },
    { key: 'activities', label: `Activities (${contact.activities?.length || 0})` },
    { key: 'tasks', label: `Tasks (${contact.tasks?.length || 0})` },
    { key: 'emails', label: `Emails (${contact.emails?.length || 0})` },
    { key: 'calls', label: `Calls (${contact.calls?.length || 0})` },
    { key: 'notes', label: `Notes (${contact.notes?.length || 0})` },
    { key: 'invoices', label: `Invoices (${contact.customer?.invoices?.length || 0})` },
    { key: 'sales_orders', label: `Sales Orders (${contact.customer?.sales_orders?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/app/crm/contacts')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Contacts Directory
        </button>
      </div>

      {/* Header Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
              {contact.first_name?.[0]}
              {contact.last_name?.[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {contact.first_name} {contact.last_name}
                </h1>
                <Badge variant={contact.status === 'active' ? 'success' : 'neutral'} size="sm">
                  {contact.status}
                </Badge>
                {contact.customer_id && (
                  <Badge variant="teal" size="sm">
                    Linked ERP Customer
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                {contact.job_title && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {contact.job_title}
                  </span>
                )}
                {(contact.company_name || contact.customer?.company_name) && (
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    {contact.company_name || contact.customer?.company_name}
                  </span>
                )}
                {contact.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {contact.city}, {contact.country || 'India'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
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
            <Button variant="secondary" size="sm" icon={FileText} onClick={() => setNoteOpen(true)}>
              Note
            </Button>
            <Button variant="teal" size="sm" icon={Edit} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          </div>
        </div>

        {/* 4 Summary KPIs for this contact */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Deals</span>
            <span className="text-lg font-bold text-slate-800">{stats.total_deals}</span>
            <span className="text-[10px] text-teal-600 block">{stats.won_deals} closed won</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Revenue</span>
            <span className="text-lg font-bold text-emerald-700">
              ₹{Number(stats.total_revenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block">From won deals</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Lead Source</span>
            <span className="text-xs font-semibold text-slate-700 block mt-1">
              {contact.lead_source?.name || 'Organic Direct'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Account Owner</span>
            <span className="text-xs font-semibold text-slate-700 block mt-1">
              {contact.owner?.name || 'Unassigned'}
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
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

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Details Card */}
          <Card title="Contact Information" className="lg:col-span-2">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Primary Email</dt>
                <dd className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-teal-600" />
                  {contact.email || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Secondary Email</dt>
                <dd className="text-slate-700 mt-0.5">{contact.secondary_email || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Phone</dt>
                <dd className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  {contact.phone || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">WhatsApp</dt>
                <dd className="text-emerald-700 font-semibold mt-0.5">{contact.whatsapp || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Website</dt>
                <dd className="text-teal-600 mt-0.5">
                  {contact.website ? (
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {contact.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Contact Type</dt>
                <dd className="text-slate-800 capitalize mt-0.5">{contact.contact_type || 'Business'}</dd>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <dt className="text-slate-400 font-medium">Address</dt>
                <dd className="text-slate-700 mt-0.5">
                  {contact.address ? `${contact.address}, ${contact.city || ''}, ${contact.state || ''} ${contact.postal_code || ''}, ${contact.country || ''}` : 'No physical address entered.'}
                </dd>
              </div>
              {contact.notes && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <dt className="text-slate-400 font-medium">Internal Notes</dt>
                  <dd className="text-slate-700 mt-0.5 italic">{contact.notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Linked Customer Profile */}
          <Card title="Linked ERP Customer" subtitle="Financial & Master Account Link">
            {contact.customer ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Customer Name</span>
                  <span className="font-bold text-slate-800 text-sm">{contact.customer.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Account Code</span>
                  <span className="font-mono text-teal-700 font-semibold">{contact.customer.customer_code}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Payment Terms</span>
                  <span className="text-slate-700">{contact.customer.payment_terms || 'Net 30'}</span>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => navigate(`/app/sales/customers/${contact.customer.id}`)}
                  >
                    Open Customer Master Profile
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No ERP customer linked directly. You can link this contact to an existing customer record when editing.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Chronological Timeline Tab */}
      {activeTab === 'timeline' && (
        <Card title="Chronological Activity Timeline" subtitle="Emails, calls, meetings, notes, and deal updates">
          <ActivityTimeline activities={timeline} />
        </Card>
      )}

      {/* Deals Tab */}
      {activeTab === 'deals' && (
        <Card title="Associated Deals" subtitle="Deals negotiated with this contact" noPadding>
          <div className="divide-y divide-slate-100">
            {contact.deals?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No deals linked to this contact.</div>
            ) : (
              contact.deals?.map((d) => (
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

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <Card title="Logged Activities" noPadding>
          <div className="divide-y divide-slate-100">
            {contact.activities?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No activities recorded.</div>
            ) : (
              contact.activities?.map((a) => (
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

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <Card title="Assigned Tasks" noPadding>
          <div className="divide-y divide-slate-100">
            {contact.tasks?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No tasks pending.</div>
            ) : (
              contact.tasks?.map((t) => (
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

      {/* Emails Tab */}
      {activeTab === 'emails' && (
        <Card title="Dispatched Emails" noPadding>
          <div className="divide-y divide-slate-100">
            {contact.emails?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No emails dispatched.</div>
            ) : (
              contact.emails?.map((e) => (
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

      {/* Calls Tab */}
      {activeTab === 'calls' && (
        <Card title="Call History" noPadding>
          <div className="divide-y divide-slate-100">
            {contact.calls?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No phone calls logged.</div>
            ) : (
              contact.calls?.map((c) => (
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

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <Card title="Saved Notes" noPadding>
          <div className="divide-y divide-slate-100">
            {contact.notes?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No notes logged.</div>
            ) : (
              contact.notes?.map((n) => (
                <div key={n.id} className="p-3.5 text-xs">
                  <span className="font-bold text-slate-800 block">{n.title}</span>
                  <p className="text-slate-600 mt-1 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card title="Customer Invoices" noPadding>
          <div className="divide-y divide-slate-100">
            {contact.customer?.invoices?.length ? (
              contact.customer.invoices.map((inv) => (
                <div key={inv.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{inv.invoice_number}</span>
                    <span className="text-slate-400 text-[11px]">Due: {inv.due_date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      ₹{Number(inv.grand_total).toLocaleString()}
                    </span>
                    <Badge variant={inv.status === 'paid' ? 'success' : 'neutral'} size="sm">
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No ERP invoices linked to this customer account.</div>
            )}
          </div>
        </Card>
      )}

      {/* Sales Orders Tab */}
      {activeTab === 'sales_orders' && (
        <Card title="Customer Sales Orders" noPadding>
          <div className="divide-y divide-slate-100">
            {contact.customer?.sales_orders?.length ? (
              contact.customer.sales_orders.map((so) => (
                <div key={so.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{so.order_number}</span>
                    <span className="text-slate-400 text-[11px]">Order Date: {so.order_date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      ₹{Number(so.grand_total).toLocaleString()}
                    </span>
                    <Badge variant={so.status === 'confirmed' ? 'success' : 'neutral'} size="sm">
                      {so.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">No Sales Orders linked.</div>
            )}
          </div>
        </Card>
      )}

      {/* Activity Modals */}
      <LogCallModal
        isOpen={callOpen}
        onClose={() => setCallOpen(false)}
        onSuccess={fetchContact}
        defaultEntity={{ contact_id: contact.id }}
      />
      <ScheduleMeetingModal
        isOpen={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        onSuccess={fetchContact}
        defaultEntity={{ contact_id: contact.id }}
      />
      <SendEmailModal
        isOpen={emailOpen}
        onClose={() => setEmailOpen(false)}
        onSuccess={fetchContact}
        defaultEntity={{ contact_id: contact.id, email: contact.email }}
      />
      <AddTaskModal
        isOpen={taskOpen}
        onClose={() => setTaskOpen(false)}
        onSuccess={fetchContact}
        defaultEntity={{ contact_id: contact.id }}
      />
      <AddNoteModal
        isOpen={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSuccess={fetchContact}
        defaultEntity={{ contact_id: contact.id }}
      />
      <ContactModal
        isOpen={editOpen}
        contact={contact}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchContact}
      />
    </div>
  );
};

export default ContactDetails;
