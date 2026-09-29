import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Truck, Plus, Search, Edit, Trash2, Eye, Phone, Mail, Building, AlertCircle } from 'lucide-react';
import supplierService from '../../../services/supplierService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import SupplierModal from '../../../components/inventory/SupplierModal';
import ConfirmModal from '../../../components/inventory/ConfirmModal';

export const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, [search, page]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await supplierService.getSuppliers({
        search: search || undefined,
        page,
        per_page: 15,
      });
      setSuppliers(res.data || []);
      setMeta(res.meta || { current_page: 1, last_page: 1, total: 0 });
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data, id) => {
    if (id) {
      await supplierService.updateSupplier(id, data);
    } else {
      await supplierService.createSupplier(data);
    }
    fetchSuppliers();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      await supplierService.deleteSupplier(deletingSupplier.id);
      setDeletingSupplier(null);
      fetchSuppliers();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete supplier.');
      setDeletingSupplier(null);
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
            <Truck className="w-6 h-6 text-teal-600" />
            Suppliers & Vendors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain authorized supplier network, trade credit records, GST registrations, and contact rosters.
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingSupplier(null);
            setShowModal(true);
          }}
        >
          Add Supplier
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
            placeholder="Search supplier name, code, contact or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>
      </Card>

      {/* Suppliers Table */}
      <Card className="overflow-hidden shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Supplier Code</th>
                <th className="p-3">Company Name</th>
                <th className="p-3">Contact Person</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Email</th>
                <th className="p-3">GST / Tax #</th>
                <th className="p-3">City</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Loading suppliers network...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No suppliers found matching your query.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-700">
                      {s.supplier_code || `SUP-${s.id}`}
                    </td>
                    <td className="p-3 font-bold text-slate-900 max-w-[200px] truncate">
                      <NavLink to={`/app/inventory/suppliers/${s.id}`} className="hover:text-teal-600">
                        {s.name}
                      </NavLink>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{s.contact_person || '—'}</td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{s.phone || '—'}</td>
                    <td className="p-3 text-slate-600 truncate max-w-[150px]">{s.email || '—'}</td>
                    <td className="p-3 font-mono text-slate-600 uppercase text-[11px]">
                      {s.gst_number || s.tax_id || '—'}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{s.city || '—'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <NavLink
                          to={`/app/inventory/suppliers/${s.id}`}
                          title="View Details"
                          className="p-1 text-slate-400 hover:text-teal-600"
                        >
                          <Eye className="w-4 h-4" />
                        </NavLink>
                        <button
                          title="Edit"
                          onClick={() => {
                            setEditingSupplier(s);
                            setShowModal(true);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeletingSupplier(s)}
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

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50/60 border-t border-slate-200/80 text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {suppliers.length > 0 ? (page - 1) * 15 + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(page * 15, meta.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{meta.total}</span> suppliers
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="px-2 font-semibold">
              Page {page} of {meta.last_page || 1}
            </span>
            <Button
              variant="secondary"
              size="xs"
              disabled={page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <SupplierModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSupplier(null);
        }}
        supplier={editingSupplier}
        onSaved={handleSave}
      />

      <ConfirmModal
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message={`Are you sure you want to remove supplier '${deletingSupplier?.name}'? Historical purchase orders and vendor payments will be preserved.`}
        confirmText="Delete Supplier"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default SupplierList;
