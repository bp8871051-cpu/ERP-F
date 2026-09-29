import React, { useState, useEffect } from 'react';
import { X, Users, Building2, Mail, Phone, MapPin, Tag, Globe, Briefcase } from 'lucide-react';
import crmService from '../../../services/crmService';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';

export const ContactModal = ({ isOpen, onClose, onSuccess, contact = null }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    customer_id: '',
    company_name: '',
    job_title: '',
    email: '',
    secondary_email: '',
    phone: '',
    whatsapp: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    contact_type: 'business',
    lead_source_id: '',
    owner_id: '',
    status: 'active',
    notes: '',
  });

  const [customers, setCustomers] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      if (contact) {
        setFormData({
          first_name: contact.first_name || '',
          last_name: contact.last_name || '',
          customer_id: contact.customer_id || '',
          company_name: contact.company_name || '',
          job_title: contact.job_title || '',
          email: contact.email || '',
          secondary_email: contact.secondary_email || '',
          phone: contact.phone || '',
          whatsapp: contact.whatsapp || '',
          website: contact.website || '',
          address: contact.address || '',
          city: contact.city || '',
          state: contact.state || '',
          country: contact.country || 'India',
          postal_code: contact.postal_code || '',
          contact_type: contact.contact_type || 'business',
          lead_source_id: contact.lead_source_id || '',
          owner_id: contact.owner_id || '',
          status: contact.status || 'active',
          notes: contact.notes || '',
        });
      } else {
        setFormData({
          first_name: '',
          last_name: '',
          customer_id: '',
          company_name: '',
          job_title: '',
          email: '',
          secondary_email: '',
          phone: '',
          whatsapp: '',
          website: '',
          address: '',
          city: '',
          state: 'Maharashtra',
          country: 'India',
          postal_code: '',
          contact_type: 'business',
          lead_source_id: '',
          owner_id: '',
          status: 'active',
          notes: '',
        });
      }
    }
  }, [isOpen, contact]);

  const loadDependencies = async () => {
    try {
      const [srcRes, custRes] = await Promise.all([
        crmService.getLeadSources(),
        salesService.getCustomers({ per_page: 100 }),
      ]);
      setLeadSources(srcRes.data || []);
      const cPayload = custRes.data?.data || custRes.data;
      setCustomers(cPayload.data || cPayload || []);
    } catch (err) {
      console.error('Error loading contact dependencies:', err);
    }
  };

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    const selectedCust = customers.find((c) => String(c.id) === String(custId));
    if (selectedCust) {
      setFormData((prev) => ({
        ...prev,
        customer_id: custId,
        company_name: selectedCust.company_name || selectedCust.name || prev.company_name,
        email: prev.email || selectedCust.email || '',
        phone: prev.phone || selectedCust.phone || '',
        city: prev.city || selectedCust.city || '',
        state: prev.state || selectedCust.state || '',
        address: prev.address || selectedCust.address || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, customer_id: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (contact?.id) {
        await crmService.updateContact(contact.id, formData);
      } else {
        await crmService.createContact(formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save contact.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {contact ? 'Edit CRM Contact' : 'Create New CRM Contact'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Section: Name & Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">First Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Rajesh"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Last Name</label>
              <input
                type="text"
                placeholder="e.g. Sharma"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Type</label>
              <select
                value={formData.contact_type}
                onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="business">Business / Corporate</option>
                <option value="individual">Individual</option>
              </select>
            </div>
          </div>

          {/* Section: Existing Customer & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Link Existing ERP Customer
              </label>
              <select
                value={formData.customer_id}
                onChange={handleCustomerSelect}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="">-- No Linked Customer (New Account) --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company_name ? `(${c.company_name})` : ''} - {c.customer_code}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Reuse existing ERP Customer record to prevent duplicates.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Tata Consultancy Services"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section: Job Title & Lead Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                Job Title / Designation
              </label>
              <input
                type="text"
                placeholder="e.g. Procurement Director, VP Sales"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Lead Source
              </label>
              <select
                value={formData.lead_source_id}
                onChange={(e) => setFormData({ ...formData, lead_source_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="">-- Select Acquisition Source --</option>
                {leadSources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Primary Email *
              </label>
              <input
                required
                type="email"
                placeholder="rajesh@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Secondary Email</label>
              <input
                type="email"
                placeholder="alt.rajesh@gmail.com"
                value={formData.secondary_email}
                onChange={(e) => setFormData({ ...formData, secondary_email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number *
              </label>
              <input
                required
                type="tel"
                placeholder="+91 98200 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">WhatsApp Number</label>
              <input
                type="tel"
                placeholder="+91 98200 12345"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Website URL
              </label>
              <input
                type="url"
                placeholder="https://company.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section: Address */}
          <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Location Details</span>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
              <input
                type="text"
                placeholder="e.g. 402 Business Park, MIDC Andheri East"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">City</label>
                <input
                  type="text"
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">State</label>
                <input
                  type="text"
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Postal Code</label>
                <input
                  type="text"
                  placeholder="400093"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section: Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Internal Notes</label>
              <input
                type="text"
                placeholder="Key stakeholder preference, VIP account note"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Saving Contact...' : contact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
