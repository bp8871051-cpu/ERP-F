import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Landmark,
  Save,
  AlertCircle,
  FileText,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const VendorModal = ({ isOpen, onClose, onSave, vendor }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    vendor_code: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    alternate_phone: '',
    website: '',
    gst_number: '',
    tax_number: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    bank_name: '',
    account_holder: '',
    account_number: '',
    ifsc: '',
    credit_limit: '',
    payment_terms: 'Net 30',
    opening_balance: '0',
    status: 'active',
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        vendor_code: vendor.vendor_code || '',
        company_name: vendor.company_name || '',
        contact_person: vendor.contact_person || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        alternate_phone: vendor.alternate_phone || '',
        website: vendor.website || '',
        gst_number: vendor.gst_number || '',
        tax_number: vendor.tax_number || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        country: vendor.country || 'India',
        postal_code: vendor.postal_code || '',
        bank_name: vendor.bank_name || '',
        account_holder: vendor.account_holder || '',
        account_number: vendor.account_number || '',
        ifsc: vendor.ifsc || '',
        credit_limit: vendor.credit_limit || '',
        payment_terms: vendor.payment_terms || 'Net 30',
        opening_balance: vendor.opening_balance || '0',
        status: vendor.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        vendor_code: `VND-${Math.floor(1000 + Math.random() * 9000)}`,
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        alternate_phone: '',
        website: '',
        gst_number: '',
        tax_number: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        postal_code: '',
        bank_name: '',
        account_holder: '',
        account_number: '',
        ifsc: '',
        credit_limit: '100000',
        payment_terms: 'Net 30',
        opening_balance: '0',
        status: 'active',
      });
    }
    setActiveTab('general');
    setError('');
  }, [vendor, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Vendor Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vendor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col my-8 !overflow-visible">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {vendor ? 'Edit Vendor Dossier' : 'Register New Vendor'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter procurement details, GST tax compliance, and bank account for settlements.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-6 text-xs font-semibold">
          {[
            { id: 'general', label: 'General & Contact', icon: Building2 },
            { id: 'address', label: 'Address & Tax', icon: MapPin },
            { id: 'bank', label: 'Bank & Financials', icon: Landmark },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4 text-xs !overflow-visible">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Vendor / Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                    placeholder="e.g. Acme Industrial Supplies"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Vendor Code
                  </label>
                  <input
                    type="text"
                    name="vendor_code"
                    value={formData.vendor_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    GSTIN / VAT Number
                  </label>
                  <input
                    type="text"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleChange}
                    placeholder="e.g. 24AAAAA0000A1Z5"
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    PAN / Tax Number
                  </label>
                  <input
                    type="text"
                    name="tax_number"
                    value={formData.tax_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Business Address
                </label>
                <textarea
                  rows="2"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Postal Code</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-800 dark:text-white block">Banking Information</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Bank Name</label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      placeholder="e.g. State Bank of India"
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Account Holder</label>
                    <input
                      type="text"
                      name="account_holder"
                      value={formData.account_holder}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Account Number</label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">IFSC / SWIFT</label>
                    <input
                      type="text"
                      name="ifsc"
                      value={formData.ifsc}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="z-20">
                  <label className="block font-semibold mb-1">Payment Terms</label>
                  <SearchableSelect
                    options={[
                      { value: 'Immediate', label: 'Immediate' },
                      { value: 'Net 15', label: 'Net 15' },
                      { value: 'Net 30', label: 'Net 30' },
                      { value: 'Net 60', label: 'Net 60' }
                    ]}
                    value={formData.payment_terms}
                    onChange={(val) => handleChange({ target: { name: 'payment_terms', value: val }})}
                    searchable={false}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    name="credit_limit"
                    value={formData.credit_limit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="z-10">
                  <label className="block font-semibold mb-1">Status</label>
                  <SearchableSelect
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                    value={formData.status}
                    onChange={(val) => handleChange({ target: { name: 'status', value: val }})}
                    searchable={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="teal"
              disabled={submitting}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving...' : 'Save Vendor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorModal;
