import React, { useState, useEffect } from 'react';
import { X, Target, Building2, Mail, Phone, Tag, Calendar, DollarSign, Globe, Briefcase, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import crmService from '../../../services/crmService';
import Button from '../../../components/ui/Button';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const LeadModal = ({ isOpen, onClose, onSuccess, lead = null }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin' || user?.is_super_admin === true;
  const hasContactAccess = !lead || lead.has_contact_access !== false;
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    job_title: '',
    website: '',
    lead_source_id: '',
    campaign_id: '',
    industry: 'Technology',
    company_size: '50-200',
    budget: '',
    expected_value: '',
    expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    status: 'new',
    assigned_to: '',
    notes: '',
  });

  const [leadSources, setLeadSources] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      if (lead) {
        setFormData({
          name: lead.name || '',
          company_name: lead.company_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          job_title: lead.job_title || '',
          website: lead.website || '',
          lead_source_id: lead.lead_source_id || '',
          campaign_id: lead.campaign_id || '',
          industry: lead.industry || 'Technology',
          company_size: lead.company_size || '50-200',
          budget: lead.budget || '',
          expected_value: lead.expected_value || '',
          expected_close_date: lead.expected_close_date || '',
          status: lead.status || 'new',
          assigned_to: lead.assigned_to || '',
          notes: lead.notes || '',
        });
      } else {
        setFormData({
          name: '',
          company_name: '',
          email: '',
          phone: '',
          job_title: '',
          website: '',
          lead_source_id: '',
          campaign_id: '',
          industry: 'Technology',
          company_size: '50-200',
          budget: '',
          expected_value: '',
          expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
          status: 'new',
          assigned_to: '',
          notes: '',
        });
      }
    }
  }, [isOpen, lead]);

  const loadDependencies = async () => {
    try {
      const calls = [
        crmService.getLeadSources(),
        crmService.getCampaigns({ per_page: 50 }),
      ];
      if (isSuperAdmin) {
        calls.push(crmService.getAssignees());
      }
      const [srcRes, campRes, assigneesRes] = await Promise.all(calls);
      setLeadSources(srcRes.data || []);
      const campPayload = campRes.data?.data || campRes.data;
      setCampaigns(campPayload.data || campPayload || []);
      if (assigneesRes) {
        setAssignees(assigneesRes.data || []);
      }
    } catch (err) {
      console.error('Error loading lead dependencies:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (lead?.id) {
        await crmService.updateLead(lead.id, formData);
      } else {
        await crmService.createLead(formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving lead.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 my-8 !overflow-visible">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {lead ? 'Edit CRM Lead' : 'Register New CRM Lead'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs !overflow-visible">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead / Contact Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Vikram Mehta"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Infosys Digital Labs"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address
                </span>
                {!hasContactAccess && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                    <Lock className="w-2.5 h-2.5" /> Protected
                  </span>
                )}
              </label>
              <input
                type="email"
                disabled={!hasContactAccess}
                placeholder={hasContactAccess ? "vikram@infosys.com" : "Email masked by privacy policy"}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  !hasContactAccess ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-teal-500'
                } focus:outline-hidden`}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {hasContactAccess
                  ? 'Corporate domain email earns +20 lead score.'
                  : 'Only assigned employee or Super Admin can view/edit unmasked email.'}
              </span>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Phone Number
                </span>
                {!hasContactAccess && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                    <Lock className="w-2.5 h-2.5" /> Protected
                  </span>
                )}
              </label>
              <input
                type="tel"
                disabled={!hasContactAccess}
                placeholder={hasContactAccess ? "+91 98210 54321" : "Phone masked by privacy policy"}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  !hasContactAccess ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'border-slate-300 focus:ring-2 focus:ring-teal-500'
                } focus:outline-hidden`}
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {!hasContactAccess && 'Contact privacy rule active.'}
              </span>
            </div>
          </div>

          {/* Super Admin Lead Assignment Control */}
          {isSuperAdmin ? (
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70">
              <label className="font-semibold text-slate-800 block mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  Assign Lead To (Super Admin Only)
                </span>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                  Super Admin Only
                </span>
              </label>
              <SearchableSelect
                options={[
                  { value: '', label: '-- Assign Lead To (Unassigned) --' },
                  ...assignees.map((a) => ({
                    value: String(a.id),
                    label: `${a.name} (${typeof a.department === 'string' ? a.department : (a.department?.name || a.role)})`
                  }))
                ]}
                value={String(formData.assigned_to || '')}
                onChange={(val) => setFormData({ ...formData, assigned_to: val ? Number(val) : '' })}
                placeholder="-- Assign Lead To --"
              />
              <span className="text-[10px] text-amber-700/80 mt-1 block">
                Assigning this lead immediately grants the employee access to full contact details and revokes previous assignee access.
              </span>
            </div>
          ) : lead ? (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 block">Lead Assignment:</span>
              <span className="text-xs font-bold text-slate-800">
                {lead.assigned_to ? (lead.assigned_user?.name || lead.owner?.name || 'Assigned') : 'Unassigned'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Lead assignment can only be modified by Super Admin.
              </span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Job Title
              </label>
              <input
                type="text"
                placeholder="Chief Technology Officer"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Company Website
              </label>
              <input
                type="url"
                placeholder="https://infosys.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead Acquisition Source</label>
              <SearchableSelect
                options={[
                  { value: '', label: '-- Direct / Inbound Website --' },
                  ...leadSources.map((s) => ({ value: String(s.id), label: s.name }))
                ]}
                value={String(formData.lead_source_id)}
                onChange={(val) => setFormData({ ...formData, lead_source_id: val })}
                placeholder="-- Direct / Inbound Website --"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Marketing Campaign</label>
              <SearchableSelect
                options={[
                  { value: '', label: '-- No Direct Campaign --' },
                  ...campaigns.map((c) => ({ value: String(c.id), label: c.name }))
                ]}
                value={String(formData.campaign_id)}
                onChange={(val) => setFormData({ ...formData, campaign_id: val })}
                placeholder="-- No Direct Campaign --"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Budget (₹)</label>
              <input
                type="number"
                placeholder="250000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Expected Deal Value (₹)</label>
              <input
                type="number"
                placeholder="500000"
                value={formData.expected_value}
                onChange={(e) => setFormData({ ...formData, expected_value: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Expected Close</label>
              <input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Initial Status</label>
              <SearchableSelect
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'unqualified', label: 'Unqualified' },
                  { value: 'lost', label: 'Lost' }
                ]}
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                placeholder="Initial Status"
                searchable={false}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Industry</label>
              <input
                type="text"
                placeholder="Technology, Manufacturing, Retail"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Notes & Requirements</label>
            <textarea
              rows="3"
              placeholder="Client pain point, current software stack, requested modules..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Saving Lead...' : lead ? 'Update Lead' : 'Register Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
