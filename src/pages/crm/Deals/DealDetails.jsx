import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Users,
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
  ShoppingCart,
  Award,
  CheckCircle,
  XCircle,
  Package,
  Layers,
  ArrowRight,
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
import DealModal from './DealModal';

export const DealDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmService.getDeal(id);
      setDeal(res.data);
      setTimeline(res.timeline || []);
    } catch (err) {
      console.error('Failed to load deal:', err);
      setError('Deal not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSalesOrder = async () => {
    if (!window.confirm('Create an ERP Sales Order from this Won Deal?')) return;
    try {
      setCreatingOrder(true);
      const res = await crmService.createSalesOrderFromDeal(deal.id);
      alert(`Sales Order ${res.sales_order?.order_number || ''} created successfully!`);
      if (res.sales_order?.id) {
        navigate(`/app/sales/orders/${res.sales_order.id}`);
      } else {
        fetchDeal();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating sales order.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleStageSelect = async (stageId) => {
    try {
      await crmService.updateDealStage(deal.id, stageId, 'Stage updated via Deal Details page');
      fetchDeal();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stage.');
    }
  };

  if (loading) return <LoadingSkeleton type="details" />;
  if (error || !deal) return <ErrorState message={error} onRetry={fetchDeal} />;

  const formatCurrency = (val) => {
    const symbol = deal.currency === 'INR' ? '₹' : '$';
    return `${symbol}${Number(val || 0).toLocaleString('en-IN')}`;
  };

  const pipelineStages = deal.pipeline?.stages || [];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'products', label: `Products & Items (${deal.deal_items?.length || 0})` },
    { key: 'timeline', label: 'Timeline' },
    { key: 'activities', label: `Activities (${deal.activities?.length || 0})` },
    { key: 'tasks', label: `Tasks (${deal.tasks?.length || 0})` },
    { key: 'notes', label: `Notes (${deal.notes?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/app/crm/deals')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Deals Directory
        </button>
      </div>

      {/* Header Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{deal.name}</h1>
                <Badge
                  variant={
                    deal.status === 'won'
                      ? 'success'
                      : deal.status === 'lost'
                      ? 'danger'
                      : 'teal'
                  }
                  size="sm"
                >
                  {deal.status?.toUpperCase()}
                </Badge>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: `${deal.stage?.color || '#0F8B7A'}15`,
                    borderColor: `${deal.stage?.color || '#0F8B7A'}40`,
                    color: deal.stage?.color || '#0F8B7A',
                  }}
                >
                  {deal.stage?.name} ({deal.probability}%)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                {deal.customer && (
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    Customer: {deal.customer.name}
                  </span>
                )}
                {deal.contact && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Contact: {deal.contact.first_name} {deal.contact.last_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  Pipeline: {deal.pipeline?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Won deal integration with Sales Order! */}
            {deal.status === 'won' && (
              <Button
                variant="teal"
                size="sm"
                icon={ShoppingCart}
                onClick={handleCreateSalesOrder}
                disabled={creatingOrder}
              >
                {creatingOrder ? 'Creating Order...' : 'Create Sales Order'}
              </Button>
            )}

            <Button variant="secondary" size="sm" icon={PhoneCall} onClick={() => setCallOpen(true)}>
              Call
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
            <Button variant="secondary" size="sm" icon={Edit} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          </div>
        </div>

        {/* Stage Workflow Progression Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Stage Workflow Progress
            </span>
            <span className="text-xs text-slate-500">
              Click stage to advance deal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {pipelineStages.map((st, index) => {
              const isCurrent = st.id === deal.stage_id;
              const isPast = (st.stage_order || 0) <= (deal.stage?.stage_order || 0);

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStageSelect(st.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-teal-600 bg-teal-50 shadow-xs ring-1 ring-teal-500'
                      : isPast
                      ? 'border-slate-300 bg-slate-50/80 text-slate-700'
                      : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span>STEP {index + 1}</span>
                    <span>{st.probability}%</span>
                  </div>
                  <span className="text-xs font-semibold block mt-0.5 truncate text-slate-900">
                    {st.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Total Deal Value</span>
            <span className="text-xl font-extrabold text-slate-900 block">
              {formatCurrency(deal.value)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Expected Revenue</span>
            <span className="text-xl font-extrabold text-emerald-700 block">
              {formatCurrency(deal.expected_revenue)}
            </span>
            <span className="text-[10px] text-slate-400 block">{deal.probability}% win probability</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Expected Close</span>
            <span className="text-xs font-semibold text-slate-700 block mt-1">
              {deal.expected_close_date || 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Account Owner</span>
            <span className="text-xs font-semibold text-slate-700 block mt-1">
              {deal.owner?.name || 'Unassigned'}
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
          <Card title="Deal Overview & Terms" className="lg:col-span-2">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Customer Account</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">
                  {deal.customer?.name || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Key Contact</dt>
                <dd className="text-slate-800 mt-0.5">
                  {deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Pipeline</dt>
                <dd className="text-slate-800 mt-0.5">{deal.pipeline?.name}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Stage Status</dt>
                <dd className="font-semibold text-teal-700 mt-0.5">{deal.stage?.name}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Currency</dt>
                <dd className="text-slate-800 mt-0.5">{deal.currency}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Creation Date</dt>
                <dd className="text-slate-800 font-mono mt-0.5">
                  {new Date(deal.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              {deal.notes && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <dt className="text-slate-400 font-medium">Deal Notes</dt>
                  <dd className="text-slate-700 mt-0.5 italic">{deal.notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Sales Order Integration Banner */}
          <Card title="ERP Sales Integration" subtitle="Convert Won Deal to Sales Order">
            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                When a deal reaches the <strong>WON</strong> stage, seamless integration converts products, quantities, prices, and tax lines directly into an ERP Sales Order without duplicate entry.
              </p>

              {deal.status === 'won' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 font-medium flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Deal Won! Ready to generate Sales Order.</span>
                  </div>
                  <Button
                    variant="teal"
                    size="sm"
                    icon={ShoppingCart}
                    className="w-full justify-center"
                    onClick={handleCreateSalesOrder}
                    disabled={creatingOrder}
                  >
                    {creatingOrder ? 'Creating Order...' : 'Create Sales Order Now'}
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px]">
                  Current Status: <strong>{deal.status?.toUpperCase()}</strong>. Advance stage to WON to enable Sales Order creation.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <Card title="Deal Line Items & Products" subtitle="Line item calculations for quotation and invoice" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Product / Item</th>
                  <th className="py-3 px-4 w-20">Quantity</th>
                  <th className="py-3 px-4 w-28">Unit Price</th>
                  <th className="py-3 px-4 w-24">Discount</th>
                  <th className="py-3 px-4 w-24">Tax</th>
                  <th className="py-3 px-4 w-32 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {deal.deal_items?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No products listed on this deal.
                    </td>
                  </tr>
                ) : (
                  deal.deal_items?.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {it.product_name}
                      </td>
                      <td className="py-3 px-4">{it.quantity}</td>
                      <td className="py-3 px-4">{formatCurrency(it.unit_price)}</td>
                      <td className="py-3 px-4 text-slate-500">{it.discount_percentage}%</td>
                      <td className="py-3 px-4 text-slate-500">{it.tax_percentage}%</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(it.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Timeline */}
      {activeTab === 'timeline' && (
        <Card title="Chronological Activity Timeline" subtitle="Interactions and stage transitions">
          <ActivityTimeline activities={timeline} />
        </Card>
      )}

      {/* Tab: Activities */}
      {activeTab === 'activities' && (
        <Card title="Activities" noPadding>
          <div className="divide-y divide-slate-100">
            {deal.activities?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No activities recorded.</div>
            ) : (
              deal.activities?.map((a) => (
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
            {deal.tasks?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No tasks logged.</div>
            ) : (
              deal.tasks?.map((t) => (
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

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <Card title="Notes" noPadding>
          <div className="divide-y divide-slate-100">
            {deal.notes_list?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No notes saved.</div>
            ) : (
              deal.notes_list?.map((n) => (
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
        onSuccess={fetchDeal}
        defaultEntity={{ deal_id: deal.id }}
      />
      <ScheduleMeetingModal
        isOpen={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        onSuccess={fetchDeal}
        defaultEntity={{ deal_id: deal.id }}
      />
      <AddTaskModal
        isOpen={taskOpen}
        onClose={() => setTaskOpen(false)}
        onSuccess={fetchDeal}
        defaultEntity={{ deal_id: deal.id }}
      />
      <AddNoteModal
        isOpen={noteOpen}
        onClose={() => setNoteOpen(false)}
        onSuccess={fetchDeal}
        defaultEntity={{ deal_id: deal.id }}
      />
      <DealModal
        isOpen={editOpen}
        deal={deal}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchDeal}
      />
    </div>
  );
};

export default DealDetails;
