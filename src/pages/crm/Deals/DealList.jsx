import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Building2,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Award,
} from 'lucide-react';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../../components/ui/SearchableSelect';
import DealModal from './DealModal';

export const DealList = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [pipelines, setPipelines] = useState([]);
  const [page, setPage] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  useEffect(() => {
    loadPipelines();
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [search, status, pipelineId, page]);

  const loadPipelines = async () => {
    try {
      const res = await crmService.getPipelines();
      const payload = res.data?.data || res.data;
      setPipelines(payload?.all_pipelines || (Array.isArray(payload) ? payload : []));
    } catch (err) {
      console.error('Failed to load pipelines:', err);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await crmService.getDeals({
        search: search || undefined,
        status: status || undefined,
        pipeline_id: pipelineId || undefined,
        page,
        per_page: 15,
      });
      const payload = res;
      setDeals(payload.data || payload || []);
      setMeta({
        current_page: payload.meta?.current_page || payload.current_page || 1,
        last_page: payload.meta?.last_page || payload.last_page || 1,
        total: payload.meta?.total || payload.total || 0,
      });
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await crmService.deleteDeal(id);
        fetchDeals();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting deal.');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await crmService.exportDeals({ search, status });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crm_deals_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error downloading CSV export.');
    }
  };

  const formatCurrency = (val, currency = 'INR') => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${Number(val || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-teal-600" />
            CRM Deals Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise deal pipeline, expected revenues, probability weighting, and automated sales orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/crm/pipeline')}
          >
            Switch to Kanban Board
          </Button>

          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>

          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingDeal(null);
              setModalOpen(true);
            }}
          >
            Create Deal
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
              placeholder="Search deals by name or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="w-40 relative z-10">
              <SearchableSelect
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'open', label: 'Open' },
                  { value: 'won', label: 'Won' },
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

            <div className="w-40 relative z-10">
              <SearchableSelect
                options={[
                  { value: '', label: 'All Pipelines' },
                  ...pipelines.map((p) => ({ value: String(p.id), label: p.name }))
                ]}
                value={String(pipelineId)}
                onChange={(val) => {
                  setPipelineId(val);
                  setPage(1);
                }}
                placeholder="All Pipelines"
                searchable={false}
              />
            </div>

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchDeals}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Deals Table */}
      <Card className="overflow-hidden" noPadding>
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
                    <th className="py-3 px-4">Deal Name</th>
                    <th className="py-3 px-4">Customer Account</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Probability</th>
                    <th className="py-3 px-4">Expected Revenue</th>
                    <th className="py-3 px-4">Expected Close</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="py-12 text-center text-slate-400">
                        No deals found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    deals.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <button
                            onClick={() => navigate(`/app/crm/deals/${d.id}`)}
                            className="hover:text-teal-600 text-left font-bold cursor-pointer block"
                          >
                            {d.name}
                          </button>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Pipeline: {d.pipeline?.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {d.customer?.name || d.customer?.company_name || 'Individual'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {d.contact ? `${d.contact.first_name} ${d.contact.last_name}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                            style={{
                              backgroundColor: `${d.stage?.color || '#0F8B7A'}15`,
                              borderColor: `${d.stage?.color || '#0F8B7A'}40`,
                              color: d.stage?.color || '#0F8B7A',
                            }}
                          >
                            {d.stage?.name || 'Open'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(d.value, d.currency)}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-mono">
                          {d.probability}%
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">
                          {formatCurrency(d.expected_revenue, d.currency)}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {d.expected_close_date ? new Date(d.expected_close_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              d.status === 'won'
                                ? 'success'
                                : d.status === 'lost'
                                ? 'danger'
                                : 'teal'
                            }
                            size="sm"
                          >
                            {d.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/app/crm/deals/${d.id}`)}
                              title="View Deal Details"
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingDeal(d);
                                setModalOpen(true);
                              }}
                              title="Edit Deal"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(d.id)}
                              title="Delete Deal"
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
                Showing <strong>{deals.length}</strong> of <strong>{meta.total}</strong> deals
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

      {/* Deal Create / Edit Modal */}
      <DealModal
        isOpen={modalOpen}
        deal={editingDeal}
        onClose={() => {
          setModalOpen(false);
          setEditingDeal(null);
        }}
        onSuccess={fetchDeals}
      />
    </div>
  );
};

export default DealList;
