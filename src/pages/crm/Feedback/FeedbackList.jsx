import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  Building2,
  Trash2,
  Edit,
  Eye,
  CheckSquare,
  ThumbsUp,
  ThumbsDown,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import crmService from '../../../services/crmService';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import FeedbackModal from './FeedbackModal';

export const FeedbackList = () => {
  const [dashboard, setDashboard] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [search, category, status, rating, page]);

  const fetchDashboard = async () => {
    try {
      const res = await crmService.getFeedbackDashboard();
      setDashboard(res.data);
    } catch (err) {
      console.error('Failed to load feedback dashboard:', err);
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await crmService.getFeedback({
        search: search || undefined,
        category: category || undefined,
        status: status || undefined,
        rating: rating || undefined,
        page,
        per_page: 15,
      });
      const payload = res.data;
      setFeedbackList(payload.data || payload || []);
      setMeta({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || 0,
      });
    } catch (err) {
      console.error('Failed to load feedback list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolvingId) return;
    try {
      await crmService.resolveFeedback(resolvingId, { resolution: resolutionText });
      setResolveOpen(false);
      setResolvingId(null);
      setResolutionText('');
      fetchDashboard();
      fetchFeedback();
    } catch (err) {
      alert(err.response?.data?.message || 'Error resolving feedback');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback record?')) {
      try {
        await crmService.deleteFeedback(id);
        fetchDashboard();
        fetchFeedback();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting feedback');
      }
    }
  };

  const renderStars = (count) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= count ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const ratingChartData = [
    { star: '5 Stars', count: dashboard?.rating_distribution?.five || 0, fill: '#10B981' },
    { star: '4 Stars', count: dashboard?.rating_distribution?.four || 0, fill: '#0F8B7A' },
    { star: '3 Stars', count: dashboard?.rating_distribution?.three || 0, fill: '#F59E0B' },
    { star: '2 Stars', count: dashboard?.rating_distribution?.two || 0, fill: '#F97316' },
    { star: '1 Star', count: dashboard?.rating_distribution?.one || 0, fill: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-teal-600" />
            Customer Feedback & CSAT
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Omni-channel customer satisfaction scores, Net Promoter ratings, issue resolution SLA, and review management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingFeedback(null);
              setModalOpen(true);
            }}
          >
            Record Feedback
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatCard
            title="Avg Rating"
            value={`${Number(dashboard.average_rating || 0).toFixed(1)} ★`}
            subtitle="CSAT Benchmark"
            icon={Star}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Total Feedback"
            value={dashboard.total_feedback}
            subtitle="Customer reviews"
            icon={MessageSquare}
            iconColor="text-teal-600"
            iconBg="bg-teal-50"
          />
          <StatCard
            title="Positive (4-5★)"
            value={dashboard.positive_count}
            subtitle="Promoters"
            icon={ThumbsUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Neutral (3★)"
            value={dashboard.neutral_count}
            subtitle="Passives"
            icon={Clock}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Negative (1-2★)"
            value={dashboard.negative_count}
            subtitle="Detractors"
            icon={ThumbsDown}
            iconColor="text-rose-600"
            iconBg="bg-rose-50"
          />
          <StatCard
            title="Open Issues"
            value={dashboard.open_issues}
            subtitle="Requires action"
            icon={Clock}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Resolved"
            value={dashboard.resolved_count}
            subtitle="Closed tickets"
            icon={CheckCircle}
            iconColor="text-teal-600"
            iconBg="bg-teal-50"
          />
          <StatCard
            title="Resolution Rate"
            value={`${dashboard.resolution_rate}%`}
            subtitle="SLA completion"
            icon={CheckSquare}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
        </div>
      )}

      {/* Charts Row */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Rating Distribution (1 to 5 Stars)" subtitle="Breakdown of customer ratings">
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="star" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {ratingChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Feedback by Category" subtitle="Distribution across Product, Service, Support, Delivery">
            <div className="h-56 mt-2 flex flex-col justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboard.category_breakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="category"
                  >
                    {(dashboard.category_breakdown || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#0F8B7A', '#2563EB', '#8B5CF6', '#F59E0B', '#EC4899', '#64748B'][index % 6]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Filters Card */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search feedback by text or customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="">All Categories</option>
              <option value="Product">Product</option>
              <option value="Service">Service</option>
              <option value="Support">Support</option>
              <option value="Sales">Sales</option>
              <option value="Delivery">Delivery</option>
              <option value="Billing">Billing</option>
            </select>

            <select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchFeedback}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Feedback Table */}
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
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Customer Review</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {feedbackList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No customer feedback records found.
                      </td>
                    </tr>
                  ) : (
                    feedbackList.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {f.customer?.name || f.customer?.company_name || 'Individual'}
                          {f.contact && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {f.contact.first_name} {f.contact.last_name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">{renderStars(f.rating)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {f.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="line-clamp-2 text-slate-700 leading-relaxed">
                            {f.feedback_text}
                          </p>
                          {f.resolution && (
                            <span className="block text-[10px] text-emerald-700 font-medium mt-0.5">
                              Resolution: {f.resolution}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              f.status === 'resolved' || f.status === 'closed'
                                ? 'success'
                                : f.status === 'reviewed'
                                ? 'teal'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {f.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(f.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {f.status !== 'resolved' && f.status !== 'closed' && (
                              <button
                                onClick={() => {
                                  setResolvingId(f.id);
                                  setResolutionText(f.resolution || '');
                                  setResolveOpen(true);
                                }}
                                title="Resolve Feedback"
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-3 h-3" /> Resolve
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setEditingFeedback(f);
                                setModalOpen(true);
                              }}
                              title="Edit Feedback"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(f.id)}
                              title="Delete Feedback"
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
                Showing <strong>{feedbackList.length}</strong> of <strong>{meta.total}</strong> reviews
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
      <FeedbackModal
        isOpen={modalOpen}
        feedback={editingFeedback}
        onClose={() => {
          setModalOpen(false);
          setEditingFeedback(null);
        }}
        onSuccess={() => {
          fetchDashboard();
          fetchFeedback();
        }}
      />

      {/* Resolve Feedback Modal */}
      {resolveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Resolve Customer Feedback
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the corrective action or resolution communicated to the customer.
            </p>
            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <textarea
                required
                rows="4"
                placeholder="e.g. Refund issued, server patch deployed, SLA meeting conducted..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setResolveOpen(false)}>
                  Cancel
                </Button>
                <Button variant="teal" size="sm" type="submit">
                  Mark as Resolved
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
