import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Edit, Trash2, Folder, CornerDownRight, AlertCircle } from 'lucide-react';
import categoryService from '../../../services/categoryService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import CategoryModal from '../../../components/inventory/CategoryModal';
import ConfirmModal from '../../../components/inventory/ConfirmModal';

export const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories({ search: search || undefined });
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data, id) => {
    if (id) {
      await categoryService.updateCategory(id, data);
    } else {
      await categoryService.createCategory(data);
    }
    fetchCategories();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      await categoryService.deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete category.');
      setDeletingCategory(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Organize hierarchical parent & child list
  const parentCats = categories.filter((c) => !c.parent_id);
  const getSubcategories = (parentId) => categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-600" />
            Product Categories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize catalog inventory into primary categories and hierarchical sub-divisions.
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
        >
          Add Category
        </Button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <Card className="p-3.5 shadow-sm border border-slate-200/80">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search category title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>
      </Card>

      {/* Hierarchical Categories View */}
      <Card className="overflow-hidden shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Category Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Assigned Products</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No categories found.
                  </td>
                </tr>
              ) : (
                parentCats.map((parent) => {
                  const children = getSubcategories(parent.id);

                  return (
                    <React.Fragment key={parent.id}>
                      {/* Parent Row */}
                      <tr className="bg-slate-50/40 hover:bg-slate-50 font-medium">
                        <td className="p-3">
                          <div className="flex items-center gap-2 font-bold text-slate-900">
                            <Folder className="w-4 h-4 text-teal-600 shrink-0" />
                            <span>{parent.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{parent.slug}</td>
                        <td className="p-3 text-slate-600 max-w-[200px] truncate">
                          {parent.description || '—'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-800">
                          {parent.products_count ?? 0}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              parent.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {parent.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCategory(parent);
                                setShowModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingCategory(parent)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Subcategory Rows */}
                      {children.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50">
                          <td className="p-3 pl-8">
                            <div className="flex items-center gap-2 text-slate-800">
                              <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{sub.name}</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-400 text-[11px]">{sub.slug}</td>
                          <td className="p-3 text-slate-500 max-w-[200px] truncate">
                            {sub.description || '—'}
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-700">
                            {sub.products_count ?? 0}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                sub.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingCategory(sub);
                                  setShowModal(true);
                                }}
                                className="p-1 text-slate-400 hover:text-amber-600"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingCategory(sub)}
                                className="p-1 text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

      <CategoryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        parentCategories={parentCats}
        onSaved={handleSave}
      />

      <ConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete '${deletingCategory?.name}'? Categories with linked products or active subcategories cannot be deleted.`}
        confirmText="Delete Category"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default CategoryList;
