import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Clock, CheckCircle, AlertTriangle, Plus, Search, 
  Filter, Calendar, ChevronRight, X, ArrowUpRight, Check, AlertCircle,
  TrendingUp, Users, Building, Activity
} from 'lucide-react';
import supportService from '../../services/supportService';
import SearchableSelect from '../../components/ui/SearchableSelect';

const priorityColors = {
  urgent: 'bg-rose-100 text-rose-800 border-rose-200',
  high: 'bg-amber-100 text-amber-800 border-amber-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function SlaManagement() {
  const [policies, setPolicies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('policies'); // 'policies' | 'logs'
  const [notification, setNotification] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    priority: 'medium',
    first_response_time_minutes: 240, // 4 hours
    resolution_time_minutes: 1440,    // 24 hours
    business_hours_only: true,
    department: 'Support & Tech',
    customer_type: 'all',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSlaData = async () => {
    try {
      setLoading(true);
      const data = await supportService.getSlaPolicies();
      if (data) {
        setPolicies(data.policies || (Array.isArray(data) ? data : []));
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching SLA policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlaData();
  }, []);

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await supportService.createSlaPolicy(form);
      setShowCreateModal(false);
      setForm({
        name: '',
        description: '',
        priority: 'medium',
        first_response_time_minutes: 240,
        resolution_time_minutes: 1440,
        business_hours_only: true,
        department: 'Support & Tech',
        customer_type: 'all',
        status: 'active'
      });
      setNotification({ type: 'success', message: 'SLA Policy created successfully!' });
      setTimeout(() => setNotification(null), 3000);
      fetchSlaData();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to create SLA policy' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatMinutes = (mins) => {
    if (!mins) return 'N/A';
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const remain = mins % 60;
    return remain > 0 ? `${hours}h ${remain}m` : `${hours} hours`;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Service Level Agreement (SLA) Management</h1>
          </div>
          <p className="text-xs text-slate-500">
            Define response times, resolution deadlines, and business hour schedules enforced automatically by the Laravel SLA Engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Create SLA Policy
          </button>
        </div>
      </div>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* Target Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-rose-50/70 border border-rose-100 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Urgent Tickets</span>
          <div className="text-xl font-bold text-rose-900">30 min / 4 hrs</div>
          <p className="text-[11px] text-rose-600">Response Target / Resolution Target</p>
        </div>
        <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">High Priority</span>
          <div className="text-xl font-bold text-amber-900">1 hr / 8 hrs</div>
          <p className="text-[11px] text-amber-600">Response Target / Resolution Target</p>
        </div>
        <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Medium Priority</span>
          <div className="text-xl font-bold text-blue-900">4 hrs / 24 hrs</div>
          <p className="text-[11px] text-blue-600">Response Target / Resolution Target</p>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Low Priority</span>
          <div className="text-xl font-bold text-emerald-900">8 hrs / 72 hrs</div>
          <p className="text-[11px] text-emerald-600">Response Target / Resolution Target</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 text-xs font-semibold tracking-wide uppercase transition-colors relative ${
            activeTab === 'policies' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Policies ({policies.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-xs font-semibold tracking-wide uppercase transition-colors relative ${
            activeTab === 'logs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          SLA Compliance & Audit Logs ({logs.length})
        </button>
      </div>

      {/* Tab 1: Policies Grid */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(n => <div key={n} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : policies.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No SLA policies found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Create Default Policy
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {policies.map(policy => (
                <div 
                  key={policy.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${priorityColors[policy.priority] || priorityColors.medium}`}>
                        {policy.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase">
                        {policy.status || 'Active'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{policy.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {policy.description || 'Applies to tickets based on priority level.'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" /> First Response Target:
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatMinutes(policy.first_response_time_minutes)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Resolution Target:
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatMinutes(policy.resolution_time_minutes)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {policy.business_hours_only ? 'Business Hours Only' : '24x7 Calendar'}
                    </span>
                    <span className="text-indigo-600 font-medium">
                      {policy.department || 'All Departments'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Logs Table */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              SLA Enforcement History
            </h3>
            <span className="text-xs text-slate-500">{logs.length} logged events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Ticket #</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5">Target</th>
                  <th className="p-3.5">Actual Time</th>
                  <th className="p-3.5">Compliance Status</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No SLA events recorded yet. Logs are generated when tickets are responded to or resolved.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-bold text-indigo-600">{log.ticket?.ticket_number || `#${log.ticket_id}`}</td>
                      <td className="p-3.5 font-medium text-slate-800">{log.event_type}</td>
                      <td className="p-3.5">{log.target_deadline ? new Date(log.target_deadline).toLocaleString() : 'N/A'}</td>
                      <td className="p-3.5">{log.actual_completion ? new Date(log.actual_completion).toLocaleString() : 'Pending'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          log.breached ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {log.breached ? 'Breached' : 'Within SLA'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create SLA Policy Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-xl w-full flex flex-col my-8 !overflow-visible shadow-2xl border border-slate-200"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" /> New SLA Policy
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePolicy} className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Policy Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Enterprise Platinum SLA"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="z-10">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level *</label>
                    <SearchableSelect
                      options={[
                        { value: 'urgent', label: 'Urgent' },
                        { value: 'high', label: 'High' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'low', label: 'Low' }
                      ]}
                      value={form.priority}
                      onChange={(val) => setForm({ ...form, priority: val })}
                      searchable={false}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Technical Support"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Response Target (Minutes) *</label>
                    <input
                      type="number"
                      required
                      min={5}
                      placeholder="e.g. 60 for 1 hr"
                      value={form.first_response_time_minutes}
                      onChange={(e) => setForm({ ...form, first_response_time_minutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">
                      = {formatMinutes(form.first_response_time_minutes)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution Target (Minutes) *</label>
                    <input
                      type="number"
                      required
                      min={10}
                      placeholder="e.g. 480 for 8 hrs"
                      value={form.resolution_time_minutes}
                      onChange={(e) => setForm({ ...form, resolution_time_minutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">
                      = {formatMinutes(form.resolution_time_minutes)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Policy notes, exceptions, or guidelines..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="businessHoursOnly"
                    checked={form.business_hours_only}
                    onChange={(e) => setForm({ ...form, business_hours_only: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="businessHoursOnly" className="text-xs text-slate-700">
                    Apply Business Hours Only (Excludes weekends and non-operating hours)
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save SLA Policy'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
