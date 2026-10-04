import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Mail, MessageSquare, Smartphone, Save, Send, 
  CheckCircle, AlertCircle, RefreshCw, Server, ShieldAlert,
  Ticket, CreditCard, Box, FileText, Wrench
} from 'lucide-react';
import systemService from '../../services/systemService';
import { Link } from 'react-router-dom';

const NOTIFICATION_EVENTS = [
  { key: 'new_ticket', label: 'New Support Ticket Created', icon: Ticket, desc: 'Notify helpdesk staff when a customer opens a ticket' },
  { key: 'ticket_reply', label: 'Ticket Reply Posted', icon: MessageSquare, desc: 'Alert agents and customers of fresh correspondence' },
  { key: 'ticket_assigned', label: 'Ticket Reassignment', icon: Ticket, desc: 'Alert agent when a ticket is assigned to them' },
  { key: 'membership_renewal', label: 'Membership Renewal Reminder', icon: CreditCard, desc: 'Notify subscribers 30, 15, and 7 days prior to expiry' },
  { key: 'payment_received', label: 'Payment Success Confirmation', icon: CreditCard, desc: 'Send receipts upon successful transaction clearance' },
  { key: 'low_stock_warning', label: 'Low Inventory Stock Warning', icon: Box, desc: 'Notify warehouse manager when inventory breaches reorder level' },
  { key: 'document_approval', label: 'Document Approval Pending', icon: FileText, desc: 'Prompt compliance officers when a document version requires sign-off' },
  { key: 'asset_maintenance', label: 'Asset Preventive Maintenance', icon: Wrench, desc: 'Remind engineers when equipment maintenance service is due' },
  { key: 'security_alert', label: 'Account Security & Lockout Alert', icon: ShieldAlert, desc: 'Immediate notification on suspicious logins or lockout triggers' },
];

export default function NotificationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [notification, setNotification] = useState(null);

  // Channels state
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
    whatsapp: true,
    push: true,
    in_app: true
  });

  // Events configuration
  const [eventSettings, setEventSettings] = useState({
    new_ticket: { email: true, in_app: true, whatsapp: false },
    ticket_reply: { email: true, in_app: true, whatsapp: true },
    ticket_assigned: { email: true, in_app: true, whatsapp: false },
    membership_renewal: { email: true, in_app: true, whatsapp: true },
    payment_received: { email: true, in_app: true, whatsapp: true },
    low_stock_warning: { email: true, in_app: true, whatsapp: false },
    document_approval: { email: true, in_app: true, whatsapp: false },
    asset_maintenance: { email: true, in_app: true, whatsapp: false },
    security_alert: { email: true, in_app: true, whatsapp: true },
  });

  // SMTP form
  const [smtp, setSmtp] = useState({
    host: 'smtp.mailtrap.io',
    port: 587,
    username: 'enterprise-falcon-erp',
    password: '••••••••••••',
    encryption: 'tls',
    from_name: 'Falcon ERP Support & Billing',
    from_email: 'no-reply@falconerp.com',
    test_email_recipient: 'admin@falconerp.com'
  });

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setLoading(true);
        const data = await systemService.getSettings();
        if (data && data.notifications) {
          if (data.notifications.channels) setChannels(data.notifications.channels);
          if (data.notifications.events) setEventSettings(data.notifications.events);
          if (data.notifications.smtp) setSmtp(prev => ({ ...prev, ...data.notifications.smtp }));
        }
      } catch (err) {
        console.error('Error fetching notification settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotificationSettings();
  }, []);

  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      const res = await systemService.testSmtp(smtp);
      if (res && res.success) {
        setNotification({ type: 'success', message: res.message || 'SMTP Handshake verified successfully! Mail server is operational.' });
      } else {
        setNotification({ type: 'error', message: res?.message || 'SMTP Connection Test Failed' });
      }
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'SMTP Socket Timeout or Auth Error' });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await systemService.updateNotificationSettings({
        channels,
        events: eventSettings,
        smtp
      });
      setNotification({ type: 'success', message: 'Notification preferences and SMTP configurations saved to MySQL!' });
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to save notification settings' });
    } finally {
      setSaving(false);
    }
  };

  const toggleEventChannel = (eventKey, channelName) => {
    setEventSettings(prev => ({
      ...prev,
      [eventKey]: {
        ...prev[eventKey],
        [channelName]: !prev[eventKey]?.[channelName]
      }
    }));
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
          className="pb-3 text-xs font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-indigo-600 transition"
        >
          Notifications & SMTP
        </Link>
        <Link
          to="/app/system/settings/integrations"
          className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition"
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: SMTP Server Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">SMTP Mail Server Settings</h2>
                <p className="text-xs text-slate-500">Authoritative outgoing transactional mail gateway.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={testingSmtp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${testingSmtp ? 'animate-spin' : ''}`} />
              {testingSmtp ? 'Testing Socket Connection...' : 'Test SMTP Connection'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Host *</label>
              <input
                type="text"
                required
                value={smtp.host}
                onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Port</label>
              <input
                type="number"
                value={smtp.port}
                onChange={(e) => setSmtp({ ...smtp, port: parseInt(e.target.value) || 587 })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Encryption</label>
              <select
                value={smtp.encryption}
                onChange={(e) => setSmtp({ ...smtp, encryption: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="null">None</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Username</label>
              <input
                type="text"
                value={smtp.username}
                onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Password</label>
              <input
                type="password"
                value={smtp.password}
                onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">From Name</label>
              <input
                type="text"
                value={smtp.from_name}
                onChange={(e) => setSmtp({ ...smtp, from_name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">From Email Address</label>
              <input
                type="email"
                value={smtp.from_email}
                onChange={(e) => setSmtp({ ...smtp, from_email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Channel Toggles & Event Trigger Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Event-Driven Notification Matrix</h2>
              <p className="text-xs text-slate-500">Configure which channels fire for each system event trigger.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Trigger Event</th>
                  <th className="p-3 text-center">Email</th>
                  <th className="p-3 text-center">In-App Notification</th>
                  <th className="p-3 text-center">WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {NOTIFICATION_EVENTS.map(evt => {
                  const Icon = evt.icon;
                  const cfg = eventSettings[evt.key] || { email: true, in_app: true, whatsapp: false };

                  return (
                    <tr key={evt.key} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{evt.label}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 pl-5.5">{evt.desc}</div>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={cfg.email !== false}
                          onChange={() => toggleEventChannel(evt.key, 'email')}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={cfg.in_app !== false}
                          onChange={() => toggleEventChannel(evt.key, 'in_app')}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={cfg.whatsapp === true}
                          onChange={() => toggleEventChannel(evt.key, 'whatsapp')}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Notification Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
