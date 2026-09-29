import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, DollarSign, FileText } from 'lucide-react';
import Button from '../../../components/ui/Button';

export const CustomerModal = ({ isOpen, onClose, onSave, customer = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    customer_code: '',
    company_name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    website: '',
    billing_address: '',
    shipping_address: '',
    city: '',
    state: '',
    country: 'United States',
    postal_code: '',
    gst_number: '',
    tax_number: '',
    credit_limit: '',
    payment_terms: 'net_30',
    opening_balance: 0,
    status: 'active',
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        customer_code: customer.customer_code || '',
        company_name: customer.company_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        alternate_phone: customer.alternate_phone || '',
        website: customer.website || '',
        billing_address: customer.billing_address || '',
        shipping_address: customer.shipping_address || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || 'United States',
        postal_code: customer.postal_code || '',
        gst_number: customer.gst_number || '',
        tax_number: customer.tax_number || '',
        credit_limit: customer.credit_limit || '',
        payment_terms: customer.payment_terms || 'net_30',
        opening_balance: customer.opening_balance || 0,
        status: customer.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        customer_code: '',
        company_name: '',
        email: '',
        phone: '',
        alternate_phone: '',
        website: '',
        billing_address: '',
        shipping_address: '',
        city: '',
        state: '',
        country: 'United States',
        postal_code: '',
        gst_number: '',
        tax_number: '',
        credit_limit: 25000,
        payment_terms: 'net_30',
        opening_balance: 0,
        status: 'active',
      });
    }
    setError(null);
    setActiveTab('basic');
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Customer name is required.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save customer record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {customer ? 'Edit Customer Account' : 'New Customer Registration'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'basic' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            General Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'address' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Billing & Shipping
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'financial' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Tax & Financial
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4">
            {/* TAB 1: BASIC INFO */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Nexus Global Supply"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Customer Code (Unique)
                  </label>
                  <input
                    type="text"
                    name="customer_code"
                    value={formData.customer_code}
                    onChange={handleChange}
                    placeholder="e.g. CUST-0042 (Auto if blank)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="e.g. Nexus Enterprises LLC"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="billing@nexus.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Primary Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555 019 2831"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    type="text"
                    name="alternate_phone"
                    value={formData.alternate_phone}
                    onChange={handleChange}
                    placeholder="+1 555 019 9988"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.nexus.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 2: ADDRESSES */}
            {activeTab === 'address' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Billing Address
                  </label>
                  <textarea
                    rows={2}
                    name="billing_address"
                    value={formData.billing_address}
                    onChange={handleChange}
                    placeholder="Suite, Street Address, Building"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Shipping Address (Deliveries)
                  </label>
                  <textarea
                    rows={2}
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    placeholder="Warehouse Dock, Industrial Zone"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Chicago"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="IL"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="USA"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      placeholder="60601"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FINANCIAL & TAX */}
            {activeTab === 'financial' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    GST / VAT Number
                  </label>
                  <input
                    type="text"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleChange}
                    placeholder="GSTIN9928172"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tax ID / EIN
                  </label>
                  <input
                    type="text"
                    name="tax_number"
                    value={formData.tax_number}
                    onChange={handleChange}
                    placeholder="TAX-8849102"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Credit Limit ($)
                  </label>
                  <input
                    type="number"
                    name="credit_limit"
                    value={formData.credit_limit}
                    onChange={handleChange}
                    placeholder="50000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Terms
                  </label>
                  <select
                    name="payment_terms"
                    value={formData.payment_terms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="immediate">Due Upon Receipt</option>
                    <option value="net_15">Net 15 Days</option>
                    <option value="net_30">Net 30 Days</option>
                    <option value="net_60">Net 60 Days</option>
                    <option value="net_90">Net 90 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Opening Balance ($)
                  </label>
                  <input
                    type="number"
                    name="opening_balance"
                    value={formData.opening_balance}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm" icon={Save} disabled={saving}>
              {saving ? 'Saving...' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;
