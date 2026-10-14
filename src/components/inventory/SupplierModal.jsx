import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';

export const SupplierModal = ({ isOpen, onClose, onSaved, supplier = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    supplier_code: '',
    contact_person: '',
    email: '',
    phone: '',
    gst_number: '',
    address: '',
    city: '',
    state: '',
    bank_name: '',
    account_number: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          name: supplier.name || '',
          company_name: supplier.company_name || supplier.name || '',
          supplier_code: supplier.supplier_code || '',
          contact_person: supplier.contact_person || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          gst_number: supplier.gst_number || supplier.tax_id || '',
          address: supplier.address || '',
          city: supplier.city || '',
          state: supplier.state || '',
          bank_name: supplier.bank_name || '',
          account_number: supplier.account_number || '',
          status: supplier.status || 'active',
        });
      } else {
        setFormData({
          name: '',
          company_name: '',
          supplier_code: 'SUP-' + Math.floor(1000 + Math.random() * 9000),
          contact_person: '',
          email: '',
          phone: '',
          gst_number: '',
          address: '',
          city: '',
          state: '',
          bank_name: '',
          account_number: '',
          status: 'active',
        });
      }
    }
  }, [isOpen, supplier]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Supplier / Company name is required.');
      return;
    }

    try {
      setLoading(true);
      await onSaved(formData, supplier?.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {supplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Company / Supplier Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dell Direct Enterprise"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Code</label>
                <input
                  type="text"
                  name="supplier_code"
                  value={formData.supplier_code}
                  onChange={handleChange}
                  placeholder="e.g. SUP-0042"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="e.g. Robert Smith"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GST / Tax Number</label>
                <input
                  type="text"
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  placeholder="27AAACG1234A1Z5"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 uppercase font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vendor@company.com"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
              <textarea
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Corporate headquarters or warehouse address..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <SearchableSelect
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
                value={formData.status}
                onChange={(val) => handleChange({ target: { name: 'status', value: val } })}
                placeholder="Select Status"
                searchable={false}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="teal" type="submit" disabled={loading}>
                {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Create Supplier'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SupplierModal;
