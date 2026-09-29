import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, Edit, Trash2, Globe, AlertCircle } from 'lucide-react';
import brandService from '../../../services/brandService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import BrandModal from '../../../components/inventory/BrandModal';
import ConfirmModal from '../../../components/inventory/ConfirmModal';

export const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, [search]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await brandService.getBrands({ search: search || undefined });
      setBrands(res.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data, id) => {
    if (id) {
      await brandService.updateBrand(id, data);
    } else {
      await brandService.createBrand(data);
    }
    fetchBrands();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      await brandService.deleteBrand(deletingBrand.id);
      setDeletingBrand(null);
      fetchBrands();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete brand.');
      setDeletingBrand(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-teal-600" />
            Brands & Manufacturers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain authorized OEM brands, certified component manufacturers, and vendor lines.
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingBrand(null);
            setShowModal(true);
          }}
        >
          Add Brand
        </Button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search */}
      <Card className="p-3.5 shadow-sm border border-slate-200/80">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search brand manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>
      </Card>

      {/* Brands Table Card */}
      <Card className="overflow-hidden shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Brand Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Website</th>
                <th className="p-3 text-right">Products Count</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading brand catalog...
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No brands found.
                  </td>
                </tr>
              ) : (
                brands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-[10px]">
                        {b.name.charAt(0)}
                      </div>
                      <span>{b.name}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{b.slug}</td>
                    <td className="p-3 text-slate-600">
                      {b.website ? (
                        <a
                          href={b.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-600 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span>{b.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      {b.products_count ?? 0}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingBrand(b);
                            setShowModal(true);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingBrand(b)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <BrandModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingBrand(null);
        }}
        brand={editingBrand}
        onSaved={handleSave}
      />

      <ConfirmModal
        isOpen={!!deletingBrand}
        onClose={() => setDeletingBrand(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Brand"
        message={`Are you sure you want to delete '${deletingBrand?.name}'? Brands associated with active products cannot be deleted.`}
        confirmText="Delete Brand"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default BrandList;
