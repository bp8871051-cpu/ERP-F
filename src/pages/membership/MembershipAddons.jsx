import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Puzzle, Plus, Edit2, DollarSign, Clock, Users, HardDrive, 
  MessageSquare, Cpu, CheckCircle, AlertCircle, X, Shield, Sparkles
} from 'lucide-react';
import membershipService from '../../services/membershipService';

export default function MembershipAddons() {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    price: 15,
    billing_cycle: 'monthly',
    quantity_limit: 10,
    feature: 'extra_user',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAddons = async () => {
    try {
      setLoading(true);
      const data = await membershipService.getAddons();
      setAddons(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error fetching addons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await membershipService.createAddon(form);
      setShowModal(false);
      setForm({
        name: '',
        code: '',
        description: '',
        price: 15,
        billing_cycle: 'monthly',
        quantity_limit: 10,
        feature: 'extra_user',
        status: 'active'
      });
      setNotification({ type: 'success', message: 'Addon created successfully!' });
      setTimeout(() => setNotification(null), 3000);
      fetchAddons();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to create addon' });
    } finally {
      setSubmitting(false);
    }
  };

  const getAddonIcon = (feature) => {
    switch (feature) {
      case 'extra_user': return <Users className="w-5 h-5 text-indigo-500" />;
      case 'extra_storage': return <HardDrive className="w-5 h-5 text-blue-500" />;
      case 'whatsapp_integration': return <MessageSquare className="w-5 h-5 text-emerald-500" />;
      case 'ai_features': return <Cpu className="w-5 h-5 text-purple-500" />;
      default: return <Puzzle className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Puzzle className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Membership Addons & Upgrades</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Modular bolt-ons, extra user seats, AI modules, and API integrations that customers can subscribe to on top of base plans.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> New Addon
        </button>
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

      {/* Addons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <div key={n} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : addons.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Puzzle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No addons found</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Create First Addon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addons.map(addon => (
            <motion.div
              key={addon.id}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    {getAddonIcon(addon.feature)}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    addon.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {addon.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{addon.name}</h3>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{addon.code}</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {addon.description || 'Flexible add-on module configured for customer accounts.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">${addon.price}</span>
                    <span className="text-xs text-slate-500"> / {addon.billing_cycle || 'monthly'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Max: {addon.quantity_limit ? `${addon.quantity_limit} units` : 'Unlimited'}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="capitalize font-medium text-indigo-600">
                  Feature: {addon.feature?.replace('_', ' ') || 'General'}
                </span>
                <span>ID #{addon.id}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Addon Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-indigo-600" /> New Membership Addon
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Addon Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 5 Extra User Seats"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Addon Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ADDON_EXTRA_USER"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Feature Type</label>
                    <select
                      value={form.feature}
                      onChange={(e) => setForm({ ...form, feature: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="extra_user">Extra User Seats</option>
                      <option value="extra_storage">Extra Storage</option>
                      <option value="advanced_reports">Advanced Reports</option>
                      <option value="premium_support">Premium 24/7 Support</option>
                      <option value="api_access">API Access</option>
                      <option value="whatsapp_integration">WhatsApp Integration</option>
                      <option value="ai_features">AI Assistant Features</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Cycle</label>
                    <select
                      value={form.billing_cycle}
                      onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half_yearly">Half-Yearly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of the addon..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Addon'}
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
