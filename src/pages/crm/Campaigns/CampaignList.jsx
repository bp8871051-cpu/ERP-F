import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Play,
  Pause,
  DollarSign,
  TrendingUp,
  Users,
  Send,
  ChevronLeft,
  ChevronRight,
  Mail,
  Award,
} from 'lucide-react';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import CampaignModal from './CampaignModal';

export const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, [search, status, type, page]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await crmService.getCampaigns({
        search: search || undefined,
        status: status || undefined,
        type: type || undefined,
        page,
        per_page: 15,
      });
      const payload = res;
      setCampaigns(payload.data || payload || []);
      setMeta({
        current_page: payload.meta?.current_page || payload.current_page || 1,
        last_page: payload.meta?.last_page || payload.last_page || 1,
        total: payload.meta?.total || payload.total || 0,
      });
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (id) => {
    try {
      await crmService.launchCampaign(id);
      alert('Campaign launched! Queued email jobs dispatched in background.');
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.message || 'Error launching campaign.');
    }
  };

  const handlePause = async (id) => {
    try {
      await crmService.pauseCampaign(id);
      alert('Campaign paused.');
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.message || 'Error pausing campaign.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await crmService.deleteCampaign(id);
        fetchCampaigns();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting campaign.');
      }
    }
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-teal-600" />
            CRM Marketing Campaigns
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Omni-channel campaigns with queue-backed email delivery, conversion attribution, and real-time ROI tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingCampaign(null);
              setModalOpen(true);
            }}
          >
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4 !overflow-visible">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns by name or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="w-40 z-10">
              <SearchableSelect
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'running', label: 'Running' },
                  { value: 'paused', label: 'Paused' },
                  { value: 'completed', label: 'Completed' }
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

            <div className="w-40 z-10">
              <SearchableSelect
                options={[
                  { value: '', label: 'All Channels' },
                  { value: 'Email', label: 'Email' },
                  { value: 'WhatsApp', label: 'WhatsApp' },
                  { value: 'SMS', label: 'SMS' },
                  { value: 'Social Media', label: 'Social Media' },
                  { value: 'Event', label: 'Event' }
                ]}
                value={type}
                onChange={(val) => {
                  setType(val);
                  setPage(1);
                }}
                placeholder="All Channels"
                searchable={false}
              />
            </div>

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchCampaigns}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Campaigns Table */}
      <Card className="!overflow-visible" noPadding>
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Campaign Name</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4">Sent / Opened</th>
                    <th className="py-3 px-4">Converted</th>
                    <th className="py-3 px-4">Revenue</th>
                    <th className="py-3 px-4">ROI</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-slate-400">
                        No campaigns found.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <button
                            onClick={() => navigate(`/app/crm/campaigns/${c.id}`)}
                            className="hover:text-teal-600 text-left font-bold cursor-pointer block"
                          >
                            {c.name}
                          </button>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(c.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} to {new Date(c.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {c.type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              c.status === 'running'
                                ? 'success'
                                : c.status === 'paused'
                                ? 'warning'
                                : c.status === 'completed'
                                ? 'info'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {formatCurrency(c.budget)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {c.total_audience?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col text-[11px]">
                            <span className="font-semibold text-slate-800">
                              {c.sent_count || 0} sent
                            </span>
                            <span className="text-slate-400 text-[10px]">
                              {c.opened_count || 0} opened ({c.sent_count > 0 ? Math.round((c.opened_count / c.sent_count) * 100) : 0}%)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-teal-700">
                          {c.converted_count || 0}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(c.revenue)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold font-mono ${
                              Number(c.roi) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {Number(c.roi || 0).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === 'running' ? (
                              <button
                                onClick={() => handlePause(c.id)}
                                title="Pause Campaign"
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md cursor-pointer"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleLaunch(c.id)}
                                title="Launch / Run Campaign"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => navigate(`/app/crm/campaigns/${c.id}`)}
                              title="View Campaign Details"
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCampaign(c);
                                setModalOpen(true);
                              }}
                              title="Edit Campaign"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              title="Delete Campaign"
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
                Showing <strong>{campaigns.length}</strong> of <strong>{meta.total}</strong> campaigns
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

      {/* Modal */}
      <CampaignModal
        isOpen={modalOpen}
        campaign={editingCampaign}
        onClose={() => {
          setModalOpen(false);
          setEditingCampaign(null);
        }}
        onSuccess={fetchCampaigns}
      />
    </div>
  );
};

export default CampaignList;
