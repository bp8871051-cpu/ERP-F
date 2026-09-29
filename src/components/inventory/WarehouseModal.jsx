import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Warehouse as WarehouseIcon, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export const WarehouseModal = ({ isOpen, onClose, onSaved, warehouse = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'main',
    manager_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (warehouse) {
        setFormData({
          name: warehouse.name || '',
          code: warehouse.code || '',
          type: warehouse.type || 'main',
          manager_name: warehouse.manager_name || '',
          email: warehouse.email || '',
          phone: warehouse.phone || '',
          address: warehouse.address || '',
          city: warehouse.city || '',
          state: warehouse.state || '',
          status: warehouse.status || 'active',
        });
      } else {
        setFormData({
          name: '',
          code: 'WH-' + Math.floor(100 + Math.random() * 900),
          type: 'branch',
          manager_name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          status: 'active',
        });
      }
    }
  }, [isOpen, warehouse]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Warehouse name and unique code are required.');
      return;
    }

    try {
      setLoading(true);
      await onSaved(formData, warehouse?.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save warehouse.');
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
                <WarehouseIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {warehouse ? 'Edit Warehouse' : 'Create Warehouse'}
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
                  Warehouse Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. South Logistics Depot"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warehouse Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. WH-SOUTH"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 uppercase font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
                >
                  <option value="main">Main Hub</option>
                  <option value="branch">Branch Depot</option>
                  <option value="distribution">Distribution Center</option>
                  <option value="storage">Storage Facility</option>
                  <option value="virtual">Virtual / Transit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Manager In-Charge</label>
                <input
                  type="text"
                  name="manager_name"
                  value={formData.manager_name}
                  onChange={handleChange}
                  placeholder="Manager name"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="warehouse@falconerp.com"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
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
                  placeholder="e.g. Bengaluru"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Karnataka"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="teal" type="submit" disabled={loading}>
                {loading ? 'Saving...' : warehouse ? 'Update Warehouse' : 'Create Warehouse'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WarehouseModal;
