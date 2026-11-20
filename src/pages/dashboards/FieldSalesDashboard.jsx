import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  TrendingUp,
  Plus,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Award,
} from 'lucide-react';
import { roleDashboardService } from '../../services/roleDashboardService';
import { useAuth } from '../../context/AuthContext';

export const FieldSalesDashboard = () => {
  const { currentCompany } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Modal states
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Visit Form
  const [visitForm, setVisitForm] = useState({
    title: '',
    lead_id: '',
    location: '',
    meeting_date: new Date().toISOString().slice(0, 10),
    start_time: '11:00',
    description: '',
  });

  // Quick Lead Form
  const [leadForm, setLeadForm] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    city: '',
    expected_value: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await roleDashboardService.fieldSales.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Field Sales intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCompany]);

  const handleCreateVisit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await roleDashboardService.fieldSales.recordVisit(visitForm);
      setIsVisitModalOpen(false);
      setVisitForm({
        title: '',
        lead_id: '',
        location: '',
        meeting_date: new Date().toISOString().slice(0, 10),
        start_time: '11:00',
        description: '',
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording field visit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await roleDashboardService.fieldSales.quickLead(leadForm);
      setIsLeadModalOpen(false);
      setLeadForm({
        name: '',
        company_name: '',
        phone: '',
        email: '',
        city: '',
        expected_value: '',
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error capturing lead');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading Field Sales Operations...</p>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Field Sales Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              CRM On-Ground
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Client visits, on-ground pipeline closures, and field territory intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLeadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Field Lead</span>
          </button>
          <button
            onClick={() => setIsVisitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Log Client Visit</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Assigned Leads</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.assigned_leads || 0}</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Active Territory Pipeline</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Active Deals</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.active_deals || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            ${((metrics.pipeline_value || 0) / 1000).toFixed(1)}k Pipeline Value
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Won Revenue</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600">
            ${((metrics.won_revenue || 0) / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Converted & Finalized</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-600">Today's Visits</span>
            <MapPin className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.today_visits || 0}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Scheduled Meetings</div>
        </div>
      </div>

      {/* Main Grid: Scheduled Visits & Hot Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Client Visits */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Today's Client Visits & Audits</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {data?.today_meetings?.length || 0} Scheduled
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {(!data?.today_meetings || data.today_meetings.length === 0) ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No client meetings or visits scheduled for today yet.
              </div>
            ) : (
              data.today_meetings.map((m) => (
                <div key={m.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">{m.title}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {m.start_time ? m.start_time.slice(0, 5) : '10:00'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {m.location || 'On-site'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    {m.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hot Opportunities / Deals */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">High-Value Field Opportunities</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Target Deals</span>
          </div>

          <div className="p-4 divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {(!data?.hot_deals || data.hot_deals.length === 0) ? (
              <div className="text-center py-8 text-slate-400 text-xs">No active deals found.</div>
            ) : (
              data.hot_deals.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{d.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Stage: <span className="font-medium text-slate-700 capitalize">{d.status}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-teal-600">${Number(d.value).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">Target Value</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Assigned Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Recent Assigned Leads</h3>
          </div>
          <span className="text-xs text-slate-400">Territory Contacts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Contact & Company</th>
                <th className="py-3 px-4">Phone / Email</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Expected Value</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!data?.recent_leads || data.recent_leads.length === 0) ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    No recent leads captured in this territory.
                  </td>
                </tr>
              ) : (
                data.recent_leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{l.name}</div>
                      <div className="text-[11px] text-slate-400">{l.company_name || '--'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{l.phone || '--'}</div>
                      <div className="text-[11px] text-slate-400">{l.email || '--'}</div>
                    </td>
                    <td className="py-3.5 px-4">{l.city || 'Regional'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      ${Number(l.expected_value || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Visit */}
      {isVisitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Schedule Client Visit / Meeting</h3>
            <form onSubmit={handleCreateVisit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. On-site Product Demonstration"
                  value={visitForm.title}
                  onChange={(e) => setVisitForm({ ...visitForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location / Client Site *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme HQ, Plant 2, Ahmedabad"
                  value={visitForm.location}
                  onChange={(e) => setVisitForm({ ...visitForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={visitForm.meeting_date}
                    onChange={(e) => setVisitForm({ ...visitForm, meeting_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Time</label>
                  <input
                    type="time"
                    value={visitForm.start_time}
                    onChange={(e) => setVisitForm({ ...visitForm, start_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Agenda</label>
                <textarea
                  rows="2"
                  placeholder="Discussion points and requirements..."
                  value={visitForm.description}
                  onChange={(e) => setVisitForm({ ...visitForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVisitModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700"
                >
                  {submitting ? 'Saving...' : 'Save Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Lead */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Capture New Field Lead</h3>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Shah"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company / Firm Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shah Industries Pvt Ltd"
                  value={leadForm.company_name}
                  onChange={(e) => setLeadForm({ ...leadForm, company_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Surat"
                    value={leadForm.city}
                    onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expected Deal Value ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={leadForm.expected_value}
                  onChange={(e) => setLeadForm({ ...leadForm, expected_value: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  {submitting ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSalesDashboard;
