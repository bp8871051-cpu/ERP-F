import React, { useState, useEffect } from 'react';
import {
  Palette,
  Plus,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  Star,
  Copy,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const InvoiceTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [header, setHeader] = useState('');
  const [footer, setFooter] = useState('');
  const [terms, setTerms] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await salesService.getInvoiceTemplates();
      const payload = res.data?.data || res.data;
      setTemplates(payload || []);
    } catch (err) {
      console.error('Failed to load invoice templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setName(template.name || '');
      setColor(template.color || '#4f46e5');
      setHeader(template.header || '');
      setFooter(template.footer || '');
      setTerms(template.terms || '');
      setIsDefault(Boolean(template.is_default));
    } else {
      setEditingTemplate(null);
      setName('');
      setColor('#4f46e5');
      setHeader('FALCON ENTERPRISE TAX INVOICE');
      setFooter('Thank you for choosing Falcon Enterprise Solutions.');
      setTerms('1. Payment due within net agreed terms.\n2. Goods covered under manufacturer warranty.');
      setIsDefault(templates.length === 0);
    }
    setShowModal(true);
  };

  const handleSetDefault = async (tmpl) => {
    try {
      await salesService.updateInvoiceTemplate(tmpl.id, { is_default: true });
      fetchTemplates();
    } catch (err) {
      alert('Error setting default template');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this invoice template?')) {
      try {
        await salesService.deleteInvoiceTemplate(id);
        fetchTemplates();
      } catch (err) {
        alert('Error deleting template');
      }
    }
  };

  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      setSubmitting(true);
      const payload = {
        name,
        color,
        header,
        footer,
        terms,
        is_default: isDefault,
      };

      if (editingTemplate) {
        await salesService.updateInvoiceTemplate(editingTemplate.id, payload);
      } else {
        await salesService.createInvoiceTemplate(payload);
      }
      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-7 h-7 text-indigo-600" />
            Invoice Templates & Branding
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Customize typography, corporate colors, headers, and payment terms for generated customer documents.
          </p>
        </div>
        <Button variant="teal" onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Create Template
        </Button>
      </div>

      {loading ? (
        <div className="p-8">
          <LoadingSkeleton count={4} />
        </div>
      ) : templates.length === 0 ? (
        <Card className="py-16 text-center">
          <Palette className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-800 dark:text-white">No Templates Found</p>
          <Button variant="teal" onClick={() => handleOpenModal()} className="mt-4">
            Create First Template
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => (
            <Card
              key={t.id}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: t.color || '#4f46e5' }}
              />

              <div>
                <div className="flex justify-between items-start mt-1">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{t.name}</h3>
                    {t.is_default ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                        <Star className="w-3.5 h-3.5 fill-emerald-600" /> Default Template
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 mt-1 block">Custom Template</span>
                    )}
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border"
                    style={{ backgroundColor: t.color || '#4f46e5' }}
                  />
                </div>

                <div className="my-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-semibold">{t.header || 'Standard Header'}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{t.footer || 'Standard Footer'}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                {!t.is_default && (
                  <button
                    onClick={() => handleSetDefault(t)}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Set as Default
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleOpenModal(t)}
                    className="p-1 text-slate-500 hover:text-slate-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {!t.is_default && (
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingTemplate ? 'Edit Template' : 'Create Invoice Template'}
              </h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Brand Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-9 p-1 border rounded-lg bg-white dark:bg-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Invoice Header</label>
                <input
                  type="text"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Terms & Conditions</label>
                <textarea
                  rows="3"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Invoice Footer Note</label>
                <input
                  type="text"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <label htmlFor="defaultCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Set as system default template
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="teal" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTemplateList;
