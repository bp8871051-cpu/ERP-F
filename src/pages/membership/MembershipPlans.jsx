import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Check, Plus, Edit2, Shield, Users, HardDrive, 
  Sparkles, DollarSign, X, CheckCircle, AlertCircle, RefreshCw,
  Archive, FileText, CheckSquare, Square
} from 'lucide-react';
import membershipService from '../../services/membershipService';
import SearchableSelect from '../../components/ui/SearchableSelect';

const AVAILABLE_FEATURES = [
  { key: 'crm', label: 'CRM & Pipeline' },
  { key: 'inventory', label: 'Inventory & Warehousing' },
  { key: 'pos', label: 'Point of Sale (POS)' },
  { key: 'hrm', label: 'HRM & Payroll' },
  { key: 'reports', label: 'Advanced Analytics & Reports' },
  { key: 'support', label: 'Priority Support Desk' },
  { key: 'documents', label: 'Document & Compliance Vault' },
  { key: 'api_access', label: 'Developer API Access' },
];

export default function MembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycleFilter, setBillingCycleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    price: 99,
    billing_cycle: 'monthly',
    trial_period_days: 14,
    setup_fee: 0,
    discount_percentage: 0,
    tax_percentage: 0,
    max_users: 5,
    storage_limit_gb: 50,
    features: ['crm', 'support', 'documents'],
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await membershipService.getPlans();
      setPlans(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error fetching membership plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({
      name: '',
      code: '',
      description: '',
      price: 99,
      billing_cycle: 'monthly',
      trial_period_days: 14,
      setup_fee: 0,
      discount_percentage: 0,
      tax_percentage: 0,
      max_users: 5,
      storage_limit_gb: 50,
      features: ['crm', 'support', 'documents'],
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    let parsedFeatures = [];
    try {
      parsedFeatures = Array.isArray(plan.features) 
        ? plan.features 
        : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []);
    } catch (e) {
      parsedFeatures = [];
    }
    setForm({
      name: plan.name || '',
      code: plan.code || '',
      description: plan.description || '',
      price: plan.price || 0,
      billing_cycle: plan.billing_cycle || 'monthly',
      trial_period_days: plan.trial_period_days || 0,
      setup_fee: plan.setup_fee || 0,
      discount_percentage: plan.discount_percentage || 0,
      tax_percentage: plan.tax_percentage || 0,
      max_users: plan.max_users || 1,
      storage_limit_gb: plan.storage_limit_gb || 10,
      features: parsedFeatures,
      status: plan.status || 'active'
    });
    setShowModal(true);
  };

  const toggleFeature = (key) => {
    setForm(prev => {
      const exists = prev.features.includes(key);
      return {
        ...prev,
        features: exists ? prev.features.filter(f => f !== key) : [...prev.features, key]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingPlan) {
        await membershipService.updatePlan(editingPlan.id, form);
        setNotification({ type: 'success', message: 'Plan updated successfully!' });
      } else {
        await membershipService.createPlan(form);
        setNotification({ type: 'success', message: 'Plan created successfully!' });
      }
      setShowModal(false);
      setTimeout(() => setNotification(null), 3000);
      fetchPlans();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to save plan' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlans = plans.filter(p => {
    if (billingCycleFilter === 'all') return true;
    return p.billing_cycle === billingCycleFilter;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Membership Tiers & Plans</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure subscription offerings, feature gating, billing cadence, seat caps, and storage limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create New Plan
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

      {/* Billing Cycle Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        {['all', 'monthly', 'quarterly', 'half_yearly', 'yearly', 'lifetime'].map(cycle => (
          <button
            key={cycle}
            onClick={() => setBillingCycleFilter(cycle)}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              billingCycleFilter === cycle ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {cycle.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Plans Pricing Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <div key={n} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No plans found</h3>
          <p className="text-xs text-slate-500 mt-1">Get started by creating your first subscription tier.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => {
            let features = [];
            try {
              features = Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []);
            } catch (e) {
              features = [];
            }

            const isEnterprise = plan.code?.toLowerCase().includes('enterprise');

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`bg-white rounded-2xl border ${isEnterprise ? 'border-indigo-400 shadow-md ring-1 ring-indigo-400' : 'border-slate-200 shadow-xs'} p-6 flex flex-col justify-between relative overflow-hidden`}
              >
                {isEnterprise && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider">
                    Popular Choice
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{plan.code}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      plan.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {plan.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {plan.description || 'Full enterprise tier with unlimited capabilities.'}
                  </p>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">${plan.price}</span>
                      <span className="text-xs text-slate-500 font-medium">/{plan.billing_cycle}</span>
                    </div>
                    {plan.setup_fee > 0 && (
                      <div className="text-[11px] text-slate-500">+${plan.setup_fee} one-time setup</div>
                    )}
                  </div>

                  <div className="space-y-2 py-2 border-y border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-500" /> Max Seats:</span>
                      <span className="font-bold text-slate-900">{plan.max_users === 0 ? 'Unlimited' : `${plan.max_users} Users`}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-indigo-500" /> Cloud Storage:</span>
                      <span className="font-bold text-slate-900">{plan.storage_limit_gb} GB</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-500" /> Free Trial:</span>
                      <span className="font-bold text-slate-900">{plan.trial_period_days || 0} Days</span>
                    </div>
                  </div>

                  {/* Included Features */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Features Included</span>
                    <ul className="space-y-1.5">
                      {AVAILABLE_FEATURES.map(feat => {
                        const included = features.includes(feat.key);
                        return (
                          <li key={feat.key} className={`flex items-center gap-2 text-xs ${included ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
                            {included ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            )}
                            <span className={!included ? 'line-through' : ''}>{feat.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Tier
                  </button>
                  <span className="text-[11px] text-slate-400">
                    ID #{plan.id}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Plan Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full flex flex-col my-8 !overflow-visible shadow-2xl border border-slate-200"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  {editingPlan ? 'Edit Membership Plan' : 'Create New Membership Plan'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Professional Enterprise"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PLAN_PRO_ENT"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                  <div className="z-20">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Cycle *</label>
                    <SearchableSelect
                      options={[
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'quarterly', label: 'Quarterly' },
                        { value: 'half_yearly', label: 'Half-Yearly' },
                        { value: 'yearly', label: 'Yearly' },
                        { value: 'lifetime', label: 'Lifetime' }
                      ]}
                      value={form.billing_cycle}
                      onChange={(val) => setForm({ ...form, billing_cycle: val })}
                      searchable={false}
                    />
                  </div>
                  <div className="z-10">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <SearchableSelect
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                        { value: 'draft', label: 'Draft' }
                      ]}
                      value={form.status}
                      onChange={(val) => setForm({ ...form, status: val })}
                      searchable={false}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Users</label>
                    <input
                      type="number"
                      value={form.max_users}
                      onChange={(e) => setForm({ ...form, max_users: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Storage (GB)</label>
                    <input
                      type="number"
                      value={form.storage_limit_gb}
                      onChange={(e) => setForm({ ...form, storage_limit_gb: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Trial Days</label>
                    <input
                      type="number"
                      value={form.trial_period_days}
                      onChange={(e) => setForm({ ...form, trial_period_days: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Features selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Available Features</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {AVAILABLE_FEATURES.map(feat => {
                      const selected = form.features.includes(feat.key);
                      return (
                        <button
                          type="button"
                          key={feat.key}
                          onClick={() => toggleFeature(feat.key)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left transition ${
                            selected ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'text-slate-600 hover:bg-slate-200/50'
                          }`}
                        >
                          {selected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span>{feat.label}</span>
                        </button>
                      );
                    })}
                  </div>
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
                    {submitting ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
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
