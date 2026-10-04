import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Plus, Calendar, AlertTriangle, 
  CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, RefreshCw,
  Clock, X, DollarSign, Layers, ChevronRight, FileText, AlertCircle,
  TrendingUp, CreditCard, ShieldCheck, UserCheck
} from 'lucide-react';
import membershipService from '../../services/membershipService';

const statusBadge = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  expiring: 'bg-amber-100 text-amber-800 border-amber-200',
  expired: 'bg-rose-100 text-rose-800 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
  pending: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function MembershipMembers() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Switch Plan / Prorata state
  const [targetPlanId, setTargetPlanId] = useState('');
  const [prorataData, setProrataData] = useState(null);
  const [calculatingProrata, setCalculatingProrata] = useState(false);

  // New Membership Form
  const [form, setForm] = useState({
    customer_id: '',
    customer_name: '',
    customer_email: '',
    plan_id: '',
    billing_cycle: 'yearly',
    payment_method: 'card',
    auto_renew: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Renew Form
  const [renewForm, setRenewForm] = useState({
    billing_cycle: 'yearly',
    payment_method: 'card'
  });

  // Cancel Form
  const [cancelReason, setCancelReason] = useState('Cost optimization');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const [membersRes, plansRes] = await Promise.all([
        membershipService.getMembers({
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          plan_id: planFilter !== 'all' ? planFilter : undefined,
        }),
        membershipService.getPlans()
      ]);
      setMembers(Array.isArray(membersRes) ? membersRes : (membersRes?.data || []));
      setPlans(Array.isArray(plansRes) ? plansRes : (plansRes?.data || []));
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [statusFilter, planFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await membershipService.createMember(form);
      setShowCreateModal(false);
      setForm({
        customer_id: '',
        customer_name: '',
        customer_email: '',
        plan_id: '',
        billing_cycle: 'yearly',
        payment_method: 'card',
        auto_renew: true
      });
      setNotification({ type: 'success', message: 'Customer membership created successfully!' });
      setTimeout(() => setNotification(null), 3000);
      fetchMembers();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to create membership' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenew = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await membershipService.renewMember(selectedMember.id, renewForm);
      setShowRenewModal(false);
      setNotification({ type: 'success', message: `Membership #${selectedMember.id} renewed successfully!` });
      setTimeout(() => setNotification(null), 3000);
      fetchMembers();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Renewal failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlanSelectForSwitch = async (planId) => {
    setTargetPlanId(planId);
    if (!planId) {
      setProrataData(null);
      return;
    }
    try {
      setCalculatingProrata(true);
      const res = await membershipService.calculateProrata(selectedMember.id, planId);
      setProrataData(res);
    } catch (err) {
      console.error('Error calculating prorata:', err);
    } finally {
      setCalculatingProrata(false);
    }
  };

  const handleConfirmSwitch = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await membershipService.switchPlan(selectedMember.id, targetPlanId);
      setShowSwitchModal(false);
      setProrataData(null);
      setNotification({ type: 'success', message: 'Plan tier updated and prorated successfully!' });
      setTimeout(() => setNotification(null), 3000);
      fetchMembers();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to switch plan' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelMembership = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await membershipService.cancelMember(selectedMember.id, cancelReason);
      setShowCancelModal(false);
      setNotification({ type: 'success', message: 'Membership cancelled successfully.' });
      setTimeout(() => setNotification(null), 3000);
      fetchMembers();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to cancel membership' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Customer Memberships & Subscriptions</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active customer subscriptions, renewal tracking, upgrades/downgrades with automated Laravel pro-rata calculations.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Subscribe Customer
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

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, plan or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Plans</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={fetchMembers}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Subscribed Plan</th>
                <th className="p-3.5">Billing Cadence</th>
                <th className="p-3.5">Start Date</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(n => (
                  <tr key={n}>
                    <td colSpan="7" className="p-4">
                      <div className="h-6 bg-slate-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No member subscriptions found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Subscribe your first customer to get started.</p>
                  </td>
                </tr>
              ) : (
                members.map(member => {
                  const isExpiring = member.status === 'expiring' || (member.days_remaining && member.days_remaining <= 30 && member.days_remaining > 0);
                  const isExpired = member.status === 'expired' || (member.days_remaining && member.days_remaining <= 0);

                  return (
                    <tr key={member.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">
                          {member.customer?.name || member.customer_name || `Customer #${member.customer_id}`}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {member.customer?.email || member.customer_email || 'Verified Customer'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {member.plan?.name || member.plan_name || 'Standard'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ${member.plan?.price || 0} / {member.billing_cycle}
                        </div>
                      </td>

                      <td className="p-3.5 capitalize font-medium">
                        {member.billing_cycle || 'Yearly'}
                      </td>

                      <td className="p-3.5 text-slate-500">
                        {member.starts_at ? new Date(member.starts_at).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="p-3.5">
                        <div className={`font-semibold ${isExpired ? 'text-rose-600' : isExpiring ? 'text-amber-600' : 'text-slate-700'}`}>
                          {member.expires_at ? new Date(member.expires_at).toLocaleDateString() : 'Lifetime'}
                        </div>
                        {member.days_remaining !== undefined && (
                          <div className="text-[10px] text-slate-400">
                            {member.days_remaining > 0 ? `${member.days_remaining} days left` : 'Expired'}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          statusBadge[member.status] || statusBadge.active
                        }`}>
                          {member.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowRenewModal(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-semibold transition"
                            title="Renew Subscription"
                          >
                            Renew
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setTargetPlanId('');
                              setProrataData(null);
                              setShowSwitchModal(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition"
                            title="Upgrade or Downgrade Plan"
                          >
                            Switch Plan
                          </button>

                          {member.status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowCancelModal(true);
                              }}
                              className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-[11px] transition"
                              title="Cancel"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscribe Customer Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" /> New Customer Subscription
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateMember} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Michael Anderson"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="michael@example.com"
                    value={form.customer_email}
                    onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">Reuses existing customer profile if matched by email.</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Plan *</label>
                    <select
                      required
                      value={form.plan_id}
                      onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Plan...</option>
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                      ))}
                    </select>
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
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={form.payment_method}
                      onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      <option value="card">Credit / Debit Card</option>
                      <option value="bank_transfer">Bank Transfer / ACH</option>
                      <option value="upi">UPI / Instant Pay</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="autoRenew"
                      checked={form.auto_renew}
                      onChange={(e) => setForm({ ...form, auto_renew: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="autoRenew" className="text-xs text-slate-700 font-medium">
                      Enable Auto-Renewal
                    </label>
                  </div>
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
                    {submitting ? 'Subscribing...' : 'Activate Subscription'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Renew Subscription Modal */}
      <AnimatePresence>
        {showRenewModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-600" /> Renew Subscription
                </h2>
                <button 
                  onClick={() => setShowRenewModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRenew} className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-bold text-slate-800">{selectedMember.customer?.name || selectedMember.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Plan:</span>
                    <span className="font-bold text-indigo-600">{selectedMember.plan?.name || selectedMember.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Expiry:</span>
                    <span className="font-bold text-slate-800">{selectedMember.expires_at ? new Date(selectedMember.expires_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Renewal Term</label>
                  <select
                    value={renewForm.billing_cycle}
                    onChange={(e) => setRenewForm({ ...renewForm, billing_cycle: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="yearly">1 Year (+12 Months)</option>
                    <option value="half_yearly">6 Months (+6 Months)</option>
                    <option value="quarterly">3 Months (+3 Months)</option>
                    <option value="monthly">1 Month (+1 Month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={renewForm.payment_method}
                    onChange={(e) => setRenewForm({ ...renewForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="card">Credit / Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRenewModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Renewing...' : 'Confirm Renewal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Switch Plan (Upgrade / Downgrade with Laravel Prorata Engine) Modal */}
      <AnimatePresence>
        {showSwitchModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> Switch / Upgrade Membership Plan
                </h2>
                <button 
                  onClick={() => setShowSwitchModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmSwitch} className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Plan:</span>
                    <span className="font-bold text-slate-800">{selectedMember.plan?.name || selectedMember.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Rate:</span>
                    <span className="font-bold text-slate-800">${selectedMember.plan?.price || 0} / {selectedMember.billing_cycle}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Choose New Target Plan *</label>
                  <select
                    required
                    value={targetPlanId}
                    onChange={(e) => handlePlanSelectForSwitch(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Plan to Switch...</option>
                    {plans.filter(p => p.id !== selectedMember.plan_id).map(p => (
                      <option key={p.id} value={p.id}>{p.name} (${p.price} / {p.billing_cycle})</option>
                    ))}
                  </select>
                </div>

                {calculatingProrata && (
                  <div className="p-4 bg-indigo-50 rounded-xl flex items-center gap-2 text-xs text-indigo-700 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Calculating pro-rata difference in Laravel...
                  </div>
                )}

                {prorataData && (
                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-indigo-900 border-b border-indigo-200/60 pb-1">
                      Laravel Pro-Rata Computation
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Unused Credit on Current Plan:</span>
                      <span className="font-semibold text-emerald-600">-${prorataData.credit_amount || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Prorated Cost for New Plan:</span>
                      <span className="font-semibold text-slate-900">${prorataData.new_plan_charge || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Days Remaining in Period:</span>
                      <span className="font-semibold text-slate-900">{prorataData.remaining_days || 0} Days</span>
                    </div>
                    <div className="flex justify-between text-indigo-950 font-bold border-t border-indigo-200/60 pt-1 text-sm">
                      <span>Net Difference to Pay:</span>
                      <span>${prorataData.net_difference || 0}</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSwitchModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !targetPlanId}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Applying Change...' : 'Confirm Plan Switch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-rose-50">
                <h2 className="text-base font-bold text-rose-900 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" /> Cancel Membership
                </h2>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCancelMembership} className="p-6 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to cancel the subscription for <strong>{selectedMember.customer?.name || selectedMember.customer_name}</strong>?
                  Access will remain active until the end of the billing term ({selectedMember.expires_at ? new Date(selectedMember.expires_at).toLocaleDateString() : 'N/A'}).
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cancellation Reason</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  >
                    <option value="Cost optimization">Cost optimization</option>
                    <option value="Feature deficit">Feature deficit</option>
                    <option value="Project completed">Project completed</option>
                    <option value="Customer requested cancellation">Customer requested cancellation</option>
                    <option value="Switching to custom plan">Switching to custom plan</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Keep Active
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
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
