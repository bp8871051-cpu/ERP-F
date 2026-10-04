import React, { useState, useEffect } from 'react';
import {
  Printer,
  Save,
  CheckCircle,
  AlertCircle,
  Eye,
  Sliders,
  Receipt,
  Building2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import posService from '../../services/posService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export const PrintSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    receipt_width: '80mm',
    show_logo: true,
    show_company_details: true,
    show_gst: true,
    show_sku: true,
    show_barcode: true,
    show_qr: true,
    company_name: 'DREAMS ENTERPRISE ERP',
    address: 'Central Retail Plaza, Suite 400, Commercial Avenue, Mumbai, MH',
    gstin: '27AABCT2345Q1Z8',
    phone: '+91 98765 43210',
    header_text: 'Tax Invoice / Retail Receipt',
    footer_text: 'Goods once sold can be exchanged within 7 days with original receipt.',
    thank_you_message: 'Thank you for shopping with us! Have a wonderful day.',
    auto_print: true,
    print_copies: 1,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await posService.getSettings();
      if (res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Failed to load POS print settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await posService.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save POS print settings:', err);
      setError('Failed to save print settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (field) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-600" />
            POS Thermal Print Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure thermal receipt printers (58mm / 80mm), header details, barcode & QR inclusion, and auto-print triggers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Settings Saved!
            </span>
          )}
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Printer Format */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receipt Roll Width</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, receipt_width: '58mm' })}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  settings.receipt_width === '58mm'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-base font-bold">58 mm</div>
                <div className="text-xs text-slate-500 mt-0.5">Standard 2-inch Mobile / Compact Terminal</div>
              </button>

              <button
                type="button"
                onClick={() => setSettings({ ...settings, receipt_width: '80mm' })}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  settings.receipt_width === '80mm'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-base font-bold">80 mm</div>
                <div className="text-xs text-slate-500 mt-0.5">Standard 3-inch Enterprise Desktop Thermal</div>
              </button>
            </div>
          </Card>

          {/* Visibility Toggles */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Print Elements Visibility</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { id: 'show_logo', label: 'Company Header Logo' },
                { id: 'show_company_details', label: 'Company Address & Contact' },
                { id: 'show_gst', label: 'GSTIN / Tax ID Number' },
                { id: 'show_sku', label: 'Product SKU on Items' },
                { id: 'show_barcode', label: 'Order Barcode on Receipt' },
                { id: 'show_qr', label: 'Order Verification QR Code' },
                { id: 'auto_print', label: 'Auto-Print on Order Complete' },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                >
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={!!settings[item.id]}
                    onChange={() => toggle(item.id)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Print Copies per Checkout
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSettings({ ...settings, print_copies: num })}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border ${
                      settings.print_copies === num
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {num} {num === 1 ? 'Copy' : 'Copies'}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Company Information on Receipt */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Information</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store / Business Name</label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    value={settings.gstin}
                    onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Support Phone</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Messages & Policies */}
          <Card className="p-4 bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receipt Custom Notes</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thank You Message</label>
                <input
                  type="text"
                  value={settings.thank_you_message}
                  onChange={(e) => setSettings({ ...settings, thank_you_message: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Return / Warranty Policy (Footer)</label>
                <textarea
                  rows="2"
                  value={settings.footer_text}
                  onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Thermal Receipt Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <Card className="p-4 bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-600" />
                  Live Thermal Preview ({settings.receipt_width})
                </h3>
                <span className="text-[11px] font-semibold text-teal-600 px-2 py-0.5 bg-teal-50 rounded">
                  Instant Synced
                </span>
              </div>

              {/* Thermal Paper Visual Container */}
              <div className="bg-slate-100 p-4 rounded-xl flex justify-center">
                <div
                  className={`bg-white text-slate-900 font-mono text-[11px] leading-tight p-4 shadow-md rounded border border-slate-300 ${
                    settings.receipt_width === '58mm' ? 'w-[230px]' : 'w-[310px]'
                  }`}
                >
                  {/* Header */}
                  <div className="text-center pb-2 border-b border-dashed border-slate-300">
                    {settings.show_logo && (
                      <div className="font-black text-sm tracking-wider uppercase mb-1">
                        ★ {settings.company_name || 'ERP STORE'} ★
                      </div>
                    )}
                    {settings.show_company_details && (
                      <>
                        <p className="text-[9px] text-slate-600">{settings.address}</p>
                        <p className="text-[9px] text-slate-600">Tel: {settings.phone}</p>
                      </>
                    )}
                    {settings.show_gst && (
                      <p className="text-[9px] font-bold text-slate-800 mt-0.5">GSTIN: {settings.gstin}</p>
                    )}
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mt-1">
                      {settings.header_text || 'Tax Invoice'}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
                    <div className="flex justify-between">
                      <span>Receipt #:</span>
                      <span className="font-bold">POS-2026-000124</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cashier:</span>
                      <span>Admin User</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span>Walk-in Customer</span>
                    </div>
                  </div>

                  {/* Item List */}
                  <div className="py-2 border-b border-dashed border-slate-300 text-[10px]">
                    <div className="flex justify-between font-bold pb-1 text-slate-700">
                      <span>ITEM</span>
                      <span>QTY x AMT</span>
                      <span>TOTAL</span>
                    </div>
                    <div className="space-y-1">
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium truncate max-w-[120px]">Enterprise Laptop Stand</span>
                          <span>1 x 1,200</span>
                          <span className="font-bold">1,200.00</span>
                        </div>
                        {settings.show_sku && <div className="text-[8px] text-slate-400">SKU: LAP-STD-01</div>}
                      </div>

                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium truncate max-w-[120px]">Wireless Silent Mouse</span>
                          <span>2 x 450</span>
                          <span className="font-bold">900.00</span>
                        </div>
                        {settings.show_sku && <div className="text-[8px] text-slate-400">SKU: MOU-WIR-02</div>}
                      </div>
                    </div>
                  </div>

                  {/* Financial Totals */}
                  <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹2,100.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount (5%):</span>
                      <span className="text-rose-600">-₹105.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span>+₹359.10</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1 border-t border-dashed border-slate-300">
                      <span>TOTAL PAYABLE:</span>
                      <span>₹2,354.10</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span>Cash Tendered:</span>
                      <span>₹2,400.00</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Change Given:</span>
                      <span>₹45.90</span>
                    </div>
                  </div>

                  {/* Barcode & QR Code */}
                  <div className="py-2 text-center flex flex-col items-center gap-1.5">
                    {settings.show_barcode && (
                      <div className="w-full flex flex-col items-center">
                        <div className="w-32 h-6 bg-slate-200/80 flex items-center justify-center text-[9px] font-mono tracking-widest">
                          |||| ||| ||||| ||
                        </div>
                        <span className="text-[8px] font-mono mt-0.5">POS-2026-000124</span>
                      </div>
                    )}

                    {settings.show_qr && (
                      <div className="w-14 h-14 bg-slate-200/80 flex items-center justify-center text-[8px] font-mono border border-slate-300">
                        [QR CODE]
                      </div>
                    )}
                  </div>

                  {/* Footer Notes */}
                  <div className="pt-2 text-center text-[9px] text-slate-600 border-t border-dashed border-slate-300 space-y-1">
                    <p className="font-semibold text-slate-800">{settings.thank_you_message}</p>
                    <p>{settings.footer_text}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-teal-600" /> Test Thermal Print
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSettings;
