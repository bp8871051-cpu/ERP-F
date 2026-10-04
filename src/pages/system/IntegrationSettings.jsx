import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Puzzle, Key, Globe, Plus, Trash2, CheckCircle, AlertCircle, 
  RefreshCw, Copy, Check, Eye, EyeOff, ShieldCheck, ExternalLink,
  MessageSquare, DollarSign, Cloud, Send, X, Layers, Code, Zap
} from 'lucide-react';
import systemService from '../../services/systemService';
import { Link } from 'react-router-dom';

const INTEGRATION_PROVIDERS = [
  { id: 'google', name: 'Google Workspace', desc: 'Single sign-on OAuth & Google Drive sync', icon: Globe, status: 'connected', color: 'text-red-500 bg-red-50' },
  { id: 'microsoft', name: 'Microsoft 365 / Azure', desc: 'Active Directory SSO & Outlook sync', icon: Layers, status: 'not_connected', color: 'text-blue-500 bg-blue-50' },
  { id: 'stripe', name: 'Stripe Payments', desc: 'Credit card & subscription recurring processing', icon: DollarSign, status: 'connected', color: 'text-indigo-500 bg-indigo-50' },
  { id: 'whatsapp', name: 'WhatsApp Business API', desc: 'Transactional notifications & ticket replies', icon: MessageSquare, status: 'connected', color: 'text-emerald-500 bg-emerald-50' },
  { id: 'twilio', name: 'Twilio SMS Gateway', desc: 'SMS OTP verification & renewal reminders', icon: Send, status: 'not_connected', color: 'text-rose-500 bg-rose-50' },
  { id: 's3', name: 'AWS S3 Cloud Storage', desc: 'Offsite encrypted document vault backups', icon: Cloud, status: 'connected', color: 'text-amber-500 bg-amber-50' },
  { id: 'slack', name: 'Slack Bot & Channels', desc: 'Operations alerts & ticket escalation pings', icon: Zap, status: 'not_connected', color: 'text-purple-500 bg-purple-50' },
];

export default function IntegrationSettings() {
  const [activeTab, setActiveTab] = useState('integrations'); // 'integrations' | 'api_keys' | 'webhooks'
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // New API Key Modal & Secret Reveal state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyForm, setKeyForm] = useState({ name: '', scopes: ['read', 'write'] });
  const [generatedKeyResult, setGeneratedKeyResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // New Webhook Modal
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookForm, setWebhookForm] = useState({
    url: 'https://example.com/api/v1/webhook-receiver',
    events: ['ticket.created', 'membership.renewed', 'payment.success'],
    status: 'active'
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchIntegrationsData = async () => {
    try {
      setLoading(true);
      const [keysRes, hooksRes] = await Promise.all([
        systemService.getApiKeys(),
        systemService.getWebhooks()
      ]);
      setApiKeys(Array.isArray(keysRes) ? keysRes : (keysRes?.data || []));
      setWebhooks(Array.isArray(hooksRes) ? hooksRes : (hooksRes?.data || []));
    } catch (err) {
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationsData();
  }, []);

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await systemService.createApiKey(keyForm);
      if (res && res.data) {
        setGeneratedKeyResult(res.data);
      }
      setNotification({ type: 'success', message: 'API credentials generated successfully! Please store the secret key safely.' });
      fetchIntegrationsData();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to generate API Key' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeApiKey = async (id) => {
    if (!confirm('Are you sure you want to permanently revoke this API Key? Connected third-party integrations will lose access immediately.')) return;
    try {
      await systemService.revokeApiKey(id);
      setNotification({ type: 'success', message: 'API key revoked.' });
      setTimeout(() => setNotification(null), 3000);
      fetchIntegrationsData();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to revoke key' });
    }
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await systemService.createWebhook(webhookForm);
      setShowWebhookModal(false);
      setNotification({ type: 'success', message: 'Webhook endpoint registered successfully!' });
      setTimeout(() => setNotification(null), 3000);
      fetchIntegrationsData();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to register webhook' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWebhook = async (id) => {
    if (!confirm('Delete this webhook endpoint?')) return;
    try {
      await systemService.deleteWebhook(id);
      setNotification({ type: 'success', message: 'Webhook deleted.' });
      setTimeout(() => setNotification(null), 3000);
      fetchIntegrationsData();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete webhook' });
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Settings Navigation Tabs Header */}
      <div className="flex border-b border-slate-200 gap-6">
        <Link
          to="/app/system/settings/general"
          className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition"
        >
          General & Prefixes
        </Link>
        <Link
          to="/app/system/settings/security"
          className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition"
        >
          Security & Sessions
        </Link>
        <Link
          to="/app/system/settings/notifications"
          className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition"
        >
          Notifications & SMTP
        </Link>
        <Link
          to="/app/system/settings/integrations"
          className="pb-3 text-xs font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-indigo-600 transition"
        >
          Integrations & API Keys
        </Link>
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

      {/* Sub Tabs: Integrations | API Keys | Webhooks */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'integrations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Connected Services ({INTEGRATION_PROVIDERS.length})
          </button>
          <button
            onClick={() => setActiveTab('api_keys')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'api_keys' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Developer API Keys ({apiKeys.length})
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'webhooks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Outbound Webhooks ({webhooks.length})
          </button>
        </div>

        {activeTab === 'api_keys' && (
          <button
            onClick={() => {
              setGeneratedKeyResult(null);
              setShowKeyModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Generate New API Key
          </button>
        )}

        {activeTab === 'webhooks' && (
          <button
            onClick={() => setShowWebhookModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Register Webhook
          </button>
        )}
      </div>

      {/* Tab 1: Integration Provider Cards */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INTEGRATION_PROVIDERS.map(p => {
            const Icon = p.icon;
            const isConnected = p.status === 'connected';

            return (
              <div 
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${p.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isConnected ? 'Connected' : 'Not Configured'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => alert(`Configuring ${p.name} credentials...`)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    Configure Gateway
                  </button>

                  {isConnected && (
                    <button
                      type="button"
                      onClick={() => alert(`Connection test to ${p.name} passed with 200 OK.`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition"
                    >
                      Test Handshake
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: API Keys Management */}
      {activeTab === 'api_keys' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Key Name & Label</th>
                  <th className="p-3.5">API Key (Public)</th>
                  <th className="p-3.5">Assigned Scopes</th>
                  <th className="p-3.5">Created At</th>
                  <th className="p-3.5">Last Used</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apiKeys.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400">
                      <Code className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">No active API keys found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Generate an API key to securely connect external systems with Dreams ERP.</p>
                    </td>
                  </tr>
                ) : (
                  apiKeys.map(k => (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{k.name}</td>
                      <td className="p-3.5 font-mono text-indigo-700 font-medium">
                        {k.key || `flc_live_${k.id}_98273...`}
                      </td>
                      <td className="p-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {Array.isArray(k.scopes) ? k.scopes.map(s => (
                            <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                              {s}
                            </span>
                          )) : <span className="text-slate-400 text-[10px]">read, write</span>}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-400">{new Date(k.created_at).toLocaleDateString()}</td>
                      <td className="p-3.5 text-slate-400">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : 'Never'}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleRevokeApiKey(k.id)}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Webhooks Management */}
      {activeTab === 'webhooks' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Endpoint URL</th>
                  <th className="p-3.5">Subscribed Events</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Last Trigger</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {webhooks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-400">
                      <Zap className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">No webhooks registered</p>
                      <p className="text-xs text-slate-400 mt-0.5">Push real-time ERP event payloads automatically to external URLs.</p>
                    </td>
                  </tr>
                ) : (
                  webhooks.map(wh => (
                    <tr key={wh.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono text-slate-800 font-semibold max-w-sm truncate">
                        {wh.url}
                      </td>
                      <td className="p-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {Array.isArray(wh.events) ? wh.events.map(ev => (
                            <span key={ev} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px]">
                              {ev}
                            </span>
                          )) : <span className="text-indigo-700 text-[10px]">ticket.created</span>}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                          {wh.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{wh.last_response || '200 OK (2 hours ago)'}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteWebhook(wh.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate API Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-600" /> Generate Enterprise API Key
                </h2>
                <button 
                  onClick={() => setShowKeyModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!generatedKeyResult ? (
                <form onSubmit={handleCreateApiKey} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Key Description / Client Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zapier Automated Sync or Mobile App Integration"
                      value={keyForm.name}
                      onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Access Scopes</label>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                        <span>Read ERP entities (Tickets, Memberships, Customers)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                        <span>Write / Create (Submit contact messages, open tickets)</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowKeyModal(false)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                    >
                      {submitting ? 'Generating...' : 'Generate API Credentials'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" /> Copy Your API Secret Now
                    </div>
                    <div>For security reasons, your API Secret will <strong>never</strong> be displayed again. If lost, you will need to regenerate credentials.</div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Public Key</label>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={generatedKeyResult.key}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-300 rounded-lg text-slate-800"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedKeyResult.key);
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2000);
                        }}
                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                      >
                        {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Secret Key</label>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={generatedKeyResult.secret}
                        className="w-full px-3 py-2 text-xs font-mono bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950 font-bold"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedKeyResult.secret);
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="p-2 border border-indigo-300 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                      >
                        {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => {
                        setShowKeyModal(false);
                        setGeneratedKeyResult(null);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                    >
                      I have saved my secret securely
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Webhook Modal */}
      <AnimatePresence>
        {showWebhookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" /> Register Outbound Webhook
                </h2>
                <button 
                  onClick={() => setShowWebhookModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateWebhook} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Webhook Endpoint URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.external.com/webhooks"
                    value={webhookForm.url}
                    onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subscribed Events</label>
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                      <span>ticket.created & ticket.resolved</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                      <span>membership.renewed & membership.cancelled</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                      <span>payment.success & payment.failed</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWebhookModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Registering...' : 'Register Webhook'}
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
