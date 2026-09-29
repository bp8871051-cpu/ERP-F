import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export const CategoryModal = ({ isOpen, onClose, onSaved, category = null, parentCategories = [] }) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setParentId(category.parent_id || '');
        setDescription(category.description || '');
        setStatus(category.status || 'active');
      } else {
        setName('');
        setParentId('');
        setDescription('');
        setStatus('active');
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      setLoading(true);
      await onSaved({
        name,
        parent_id: parentId || null,
        description,
        status,
      }, category?.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.');
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
          className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                <FolderPlus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {category ? 'Edit Category' : 'Create Category'}
              </h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Storage & NAS"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
              >
                <option value="">None (Top-Level Category)</option>
                {parentCategories
                  .filter((p) => !category || p.id !== category.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief category summary..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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
                {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CategoryModal;
