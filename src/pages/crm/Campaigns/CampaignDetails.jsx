import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tag,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Send,
  Eye,
  MousePointer,
  Award,
  Play,
  Pause,
  ArrowLeft,
  Mail,
  PieChart as PieIcon,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await crmService.getCampaign(id);
      setCampaign(res.data);
    } catch (err) {
      console.error('Failed to load campaign:', err);
      setError('Campaign not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async () => {
    try {
      await crmService.launchCampaign(campaign.id);
      alert('Campaign launched! Queued email sending initiated.');
      fetchCampaign();
    } catch (err) {
      alert(err.response?.data?.message || 'Error launching campaign.');
    }
  };

  const handlePause = async () => {
    try {
      await crmService.pauseCampaign(campaign.id);
      alert('Campaign paused.');
      fetchCampaign();
    } catch (err) {
      alert(err.response?.data?.message || 'Error pausing campaign.');
    }
  };

  if (loading) return <LoadingSkeleton type="details" />;
  if (error || !campaign) return <ErrorState message={error} onRetry={fetchCampaign} />;

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'audience', label: `Audience (${campaign.audiences?.length || campaign.total_audience || 0})` },
    { key: 'events', label: `Tracking Events (${campaign.events?.length || 0})` },
    { key: 'analytics', label: 'ROI & Analytics' },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/app/crm/campaigns')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Campaigns
        </button>
      </div>

      {/* Header Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
              <Tag className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{campaign.name}</h1>
                <Badge
                  variant={
                    campaign.status === 'running'
                      ? 'success'
                      : campaign.status === 'paused'
                      ? 'warning'
                      : 'neutral'
                  }
                  size="sm"
                >
                  {campaign.status?.toUpperCase()}
                </Badge>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  {campaign.type} Outreach
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Schedule: {campaign.start_date} to {campaign.end_date}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Target Audience: {campaign.total_audience?.toLocaleString()} recipients
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {campaign.status === 'running' ? (
              <Button variant="danger" size="sm" icon={Pause} onClick={handlePause}>
                Pause Campaign
              </Button>
            ) : (
              <Button variant="teal" size="sm" icon={Play} onClick={handleLaunch}>
                Launch Campaign
              </Button>
            )}
          </div>
        </div>

        {/* 6 Key Campaign Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Sent</span>
            <span className="text-lg font-bold text-slate-800">{campaign.sent_count || 0}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Delivered</span>
            <span className="text-lg font-bold text-teal-700">{campaign.delivered_count || 0}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Opened</span>
            <span className="text-lg font-bold text-blue-700">{campaign.opened_count || 0}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Converted</span>
            <span className="text-lg font-bold text-emerald-700">{campaign.converted_count || 0}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">Revenue</span>
            <span className="text-lg font-bold text-slate-900">{formatCurrency(campaign.revenue)}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">ROI %</span>
            <span className="text-lg font-bold font-mono text-emerald-700">
              {Number(campaign.roi || 0).toFixed(1)}%
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
          <Card title="Campaign Details" className="lg:col-span-2">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Campaign Type</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{campaign.type}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Budget</dt>
                <dd className="font-bold text-slate-900 mt-0.5">{formatCurrency(campaign.budget)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Cost Incurred</dt>
                <dd className="font-semibold text-slate-700 mt-0.5">{formatCurrency(campaign.cost)}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Generated Revenue</dt>
                <dd className="font-bold text-emerald-700 mt-0.5">{formatCurrency(campaign.revenue)}</dd>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <dt className="text-slate-400 font-medium">Description & Messaging Copy</dt>
                <dd className="text-slate-700 mt-0.5 leading-relaxed">
                  {campaign.description || 'No description entered.'}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Audience Snapshot" subtitle="Filters Applied">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Total Audience</span>
                <span className="font-bold text-slate-800">{campaign.total_audience}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Industry</span>
                <span className="font-medium text-slate-700">
                  {campaign.target_audience?.industry || 'All Industries'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Min Score Filter</span>
                <span className="font-medium text-slate-700">
                  {campaign.target_audience?.min_lead_score || 30}+
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Audience */}
      {activeTab === 'audience' && (
        <Card title="Audience Snapshot" noPadding>
          <div className="p-8 text-center text-slate-400 text-xs">
            {campaign.total_audience || 0} targeted recipients snapshot registered in database.
          </div>
        </Card>
      )}

      {/* Tab: Events */}
      {activeTab === 'events' && (
        <Card title="Campaign Tracking Events" noPadding>
          <div className="divide-y divide-slate-100">
            {campaign.events?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No tracking events recorded yet.</div>
            ) : (
              campaign.events?.map((ev) => (
                <div key={ev.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 capitalize block">{ev.event_type}</span>
                    <span className="text-slate-400 text-[11px]">{ev.recipient_email}</span>
                  </div>
                  <span className="text-slate-400 text-[10px] font-mono">{ev.created_at}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <Card title="Campaign ROI & Conversion Velocity">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Delivery Rate</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 block">
                {campaign.sent_count > 0 ? ((campaign.delivered_count / campaign.sent_count) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Open Rate</span>
              <span className="text-2xl font-bold text-blue-700 mt-1 block">
                {campaign.delivered_count > 0 ? ((campaign.opened_count / campaign.delivered_count) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Conversion Rate</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                {campaign.opened_count > 0 ? ((campaign.converted_count / campaign.opened_count) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CampaignDetails;
