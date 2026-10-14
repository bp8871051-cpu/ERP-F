import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, Globe, DollarSign, Calendar, Clock, Hash, 
  Save, CheckCircle, AlertCircle, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import systemService from '../../services/systemService';
import { Link, useLocation } from 'react-router-dom';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Button from '../../components/ui/Button';

export default function GeneralSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    // Company Profile
    company_name: 'Falcon Corp Inc.',
    legal_name: 'Falcon Corporation Technologies Ltd.',
    email: 'contact@falconcorp.com',
    phone: '+1 (800) 555-0199',
    website: 'https://falconcorp.com',
    address: '100 Enterprise Way, Suite 400',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    pincode: '94105',
    gstin: 'GSTIN-9842104-USA',
    tax_number: 'EIN-84-2938472',

    // Regional & Localization
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    date_format: 'YYYY-MM-DD',
    time_format: '12-hour',
    financial_year_start: '04-01',

    // ERP Default Prefixes
    default_warehouse: 'Central Fulfillment Hub',
    default_tax_rate: 8.5,
    default_payment_method: 'Card',
    invoice_prefix: 'INV-',
    order_prefix: 'ORD-',
    ticket_prefix: 'TKT-',
    asset_prefix: 'AST-',
    document_prefix: 'DOC-',
    membership_prefix: 'MBR-'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await systemService.getSettings();
        if (data && data.general) {
          setForm(prev => ({ ...prev, ...data.general }));
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await systemService.updateGeneralSettings(form);
      setNotification({ type: 'success', message: 'General ERP settings saved successfully to MySQL!' });
      setTimeout(() => setNotification(null), 3500);
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Settings Navigation Tabs Header */}
      <div className="flex border-b border-slate-200 gap-6">
        <Link
          to="/app/system/settings/general"
          className="pb-3 text-xs font-bold uppercase tracking-wider text-indigo-600 border-b-2 border-indigo-600 transition"
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Company Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Organization & Legal Entity Profile</h2>
              <p className="text-xs text-slate-500">Legal business information printed on invoices and client receipts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Trading Name *</label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Registered Name</label>
              <input
                type="text"
                value={form.legal_name}
                onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode / Postal Code</label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN / VAT ID</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Registration Number (EIN / PAN)</label>
              <input
                type="text"
                value={form.tax_number}
                onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Regional & Fiscal Standards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Regional Localization & Fiscal Calendars</h2>
              <p className="text-xs text-slate-500">System-wide currency symbols, timestamps, and reporting periods.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="z-40">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Currency</label>
              <SearchableSelect
                options={[
                  { value: 'USD', label: 'USD ($) - US Dollar' },
                  { value: 'EUR', label: 'EUR (€) - Euro' },
                  { value: 'GBP', label: 'GBP (£) - British Pound' },
                  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                  { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
                ]}
                value={form.currency}
                onChange={(val) => setForm({ ...form, currency: val })}
                searchable={false}
              />
            </div>
            <div className="z-30">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Timezone</label>
              <SearchableSelect
                options={[
                  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
                  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
                  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
                  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
                ]}
                value={form.timezone}
                onChange={(val) => setForm({ ...form, timezone: val })}
                searchable={false}
              />
            </div>
            <div className="z-20">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date Format</label>
              <SearchableSelect
                options={[
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-10-01)' },
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (01/10/2026)' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (10/01/2026)' },
                ]}
                value={form.date_format}
                onChange={(val) => setForm({ ...form, date_format: val })}
                searchable={false}
              />
            </div>
            <div className="z-10">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Financial Year Start</label>
              <SearchableSelect
                options={[
                  { value: '01-01', label: 'January 1st (Calendar Year)' },
                  { value: '04-01', label: 'April 1st (Fiscal Standard)' },
                  { value: '07-01', label: 'July 1st' },
                  { value: '10-01', label: 'October 1st' },
                ]}
                value={form.financial_year_start}
                onChange={(val) => setForm({ ...form, financial_year_start: val })}
                searchable={false}
              />
            </div>
          </div>
        </div>

        {/* Section 3: ERP Defaults & Entity Prefixes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">ERP Default Parameters & Numbering Prefixes</h2>
              <p className="text-xs text-slate-500">Configure auto-generation serial prefixes across all 12 ERP modules.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={form.invoice_prefix}
                onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Order Prefix</label>
              <input
                type="text"
                value={form.order_prefix}
                onChange={(e) => setForm({ ...form, order_prefix: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Prefix</label>
              <input
                type="text"
                value={form.ticket_prefix}
                onChange={(e) => setForm({ ...form, ticket_prefix: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Prefix</label>
              <input
                type="text"
                value={form.asset_prefix}
                onChange={(e) => setForm({ ...form, asset_prefix: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Doc Prefix</label>
              <input
                type="text"
                value={form.document_prefix}
                onChange={(e) => setForm({ ...form, document_prefix: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Member Prefix</label>
              <input
                type="text"
                value={form.membership_prefix}
                onChange={(e) => setForm({ ...form, membership_prefix: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="teal"
            loading={saving}
            icon={Save}
          >
            Save General Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
