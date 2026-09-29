import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  DollarSign,
  Tag,
  Layers,
  ChevronRight,
  Folder,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import financeService from '../../../services/financeService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const ExpenseCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    parent_id: '',
    budget: '',
    description: '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getExpenseCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching expense categories:', err);
      setError('Unable to load expense category hierarchy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await financeService.createExpenseCategory({
        ...formData,
        parent_id: formData.parent_id || null,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
      });
      setSuccessMessage(`Category "${formData.name}" created successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData({ name: '', code: '', parent_id: '', budget: '', description: '' });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  // Group top-level vs children
  const rootCategories = filteredCategories.filter((c) => !c.parent_id);
  const getSubcategories = (parentId) =>
    categories.filter((c) => c.parent_id === parentId);

  if (loading && categories.length === 0) return <LoadingSkeleton type="table" />;
  if (error && categories.length === 0) return <ErrorState message={error} onRetry={fetchCategories} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expense Categories & Cost Centers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hierarchical chart of operating expenditures, departmental budget envelopes, and categorization rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            New Category
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Toolbar */}
      <Card className="p-4 bg-white shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search category name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="text-xs text-slate-500">
            Total Categories: <span className="font-semibold text-slate-800">{categories.length}</span>
          </div>
        </div>
      </Card>

      {/* Categories Hierarchy Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Category Name & Hierarchy</th>
                <th className="py-3 px-4">Category Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Allocated Budget</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rootCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No expense categories found.
                  </td>
                </tr>
              ) : (
                rootCategories.map((parent) => {
                  const children = getSubcategories(parent.id);
                  return (
                    <React.Fragment key={parent.id}>
                      {/* Parent Category Row */}
                      <tr className="hover:bg-slate-50/70 transition-colors font-medium text-slate-900 bg-slate-50/30">
                        <td className="py-3 px-4 flex items-center gap-2">
                          <Folder className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="font-semibold text-slate-900">{parent.name}</span>
                          {children.length > 0 && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                              {children.length} sub
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-mono text-[11px]">
                            {parent.code || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {parent.description || '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800">
                          {Number(parent.budget) > 0 ? `₹${Number(parent.budget).toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={parent.is_active !== false ? 'success' : 'neutral'}>
                            {parent.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>

                      {/* Child Category Rows */}
                      {children.map((child) => (
                        <tr key={child.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                          <td className="py-2.5 px-4 pl-10 flex items-center gap-2 text-slate-700">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium">{child.name}</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-mono text-[10px]">
                              {child.code || 'N/A'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate text-[11px]">
                            {child.description || '—'}
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-slate-700">
                            {Number(child.budget) > 0 ? `₹${Number(child.budget).toLocaleString()}` : '—'}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <Badge variant={child.is_active !== false ? 'teal' : 'neutral'}>
                              {child.is_active !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Create Expense Category</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Infrastructure, Office Supplies"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="e.g. EXP-CLOUD"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Annual Budget (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Parent Category (Optional)</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories
                    .filter((c) => !c.parent_id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Classification scope or remarks..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Create Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCategoryList;
