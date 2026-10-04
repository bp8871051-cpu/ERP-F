import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Mail, Phone, Building, Shield, Clock, 
  CheckCircle, XCircle, Key, Activity, Laptop, Globe, Calendar,
  UserCheck, AlertCircle
} from 'lucide-react';
import systemService from '../../services/systemService';

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await systemService.getUserDetails(id);
        if (data) {
          setUser(data.user || data);
          setLoginHistory(data.login_histories || []);
          setAuditLogs(data.audit_logs || []);
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center text-slate-500">
        <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold">User profile not found</p>
        <Link to="/app/system/users" className="text-indigo-600 text-xs mt-2 inline-block hover:underline">
          ← Back to User Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <Link 
        to="/app/system/users" 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users Directory
      </Link>

      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                user.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {user.is_active !== false ? 'Active' : 'Suspended'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
              {user.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user.phone}</span>}
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {typeof user.department === 'object' && user.department !== null ? (user.department.name || user.department.department_name || 'Operations') : (user.department || 'Operations')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold text-xs">
            <Shield className="w-4 h-4" /> {user.roles?.[0]?.name || user.role_name || 'Enterprise User'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
            activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Profile & Security
        </button>
        <button
          onClick={() => setActiveTab('logins')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
            activeTab === 'logins' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Login History ({loginHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
            activeTab === 'activity' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Audit Activity ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Account Attributes
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">System User ID:</span>
                <span className="font-mono font-bold text-slate-800">#{user.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Organization Company:</span>
                <span className="font-bold text-slate-800">{user.company?.name || user.company_name || 'Falcon Corp'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Account Created:</span>
                <span className="font-bold text-slate-800">{new Date(user.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Last Authentication:</span>
                <span className="font-bold text-slate-800">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Two-Factor Authentication:</span>
                <span className="font-semibold text-emerald-600">{user.two_factor_confirmed_at ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Effective Permissions Preview
            </h3>
            <p className="text-xs text-slate-500">
              Role permissions inherit capabilities automatically via the Laravel RBAC Gate.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['dashboard.view', 'support.view', 'support.create', 'membership.view', 'reports.export'].map(p => (
                <span key={p} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono text-[11px]">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Login History */}
      {activeTab === 'logins' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Device & Browser</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loginHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">No login history recorded yet.</td>
                  </tr>
                ) : (
                  loginHistory.map((lh, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3.5 font-medium text-slate-800 flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-slate-400" />
                        {lh.user_agent || 'Chrome on Windows'}
                      </td>
                      <td className="p-3.5 font-mono">{lh.ip_address || '127.0.0.1'}</td>
                      <td className="p-3.5">{lh.location || 'Local / Internal'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                          Successful
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{new Date(lh.created_at || Date.now()).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Activity Timeline */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            System Operations Activity Timeline
          </h3>
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400">No audit activity logged for this user.</p>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800">
                      <span className="uppercase text-indigo-600 font-bold">{log.action}</span> on <span className="capitalize">{log.module}</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">{new Date(log.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
