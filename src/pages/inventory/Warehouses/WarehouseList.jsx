import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import WarehouseModal from '../../../components/inventory/WarehouseModal';
import ConfirmModal from '../../../components/inventory/ConfirmModal';

export const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, [search]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await warehouseService.getWarehouses({ search: search || undefined });
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data, id) => {
    if (id) {
      await warehouseService.updateWarehouse(id, data);
    } else {
      await warehouseService.createWarehouse(data);
    }
    fetchWarehouses();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWarehouse) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      await warehouseService.deleteWarehouse(deletingWarehouse.id);
      setDeletingWarehouse(null);
      fetchWarehouses();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete warehouse.');
      setDeletingWarehouse(null);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <WarehouseIcon className="w-6 h-6 text-teal-600" />
            Depots & Warehouses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise fulfillment centers, regional distribution hubs, and storage yards.
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingWarehouse(null);
            setShowModal(true);
          }}
        >
          Add Warehouse
        </Button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                  <WarehouseIcon className="w-5 h-5" />
                </div>
                <div>
                  <NavLink
                    to={`/app/inventory/warehouses/${wh.id}`}
                    className="font-bold text-sm text-slate-900 hover:text-teal-600"
                  >
                    {wh.name}
                  </NavLink>
                  <span className="block font-mono text-[11px] text-slate-400 font-bold uppercase">
                    {wh.code}
                  </span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  wh.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {wh.status}
              </span>
            </div>

            <div className="py-3 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {wh.city ? `${wh.city}, ${wh.state || 'India'}` : 'Location unassigned'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Manager: <strong className="text-slate-800">{wh.manager_name || 'Unassigned'}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center bg-slate-50/60 -mx-4 -mb-4 p-3 rounded-b-xl">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Total SKUs</span>
                <span className="font-extrabold text-sm text-slate-900">{wh.total_products ?? 0}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Stock Value</span>
                <span className="font-extrabold text-sm text-teal-700">{formatCurrency(wh.total_stock_value)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-3">
              <NavLink
                to={`/app/inventory/warehouses/${wh.id}`}
                title="View Depot"
                className="p-1 text-slate-400 hover:text-teal-600"
              >
                <Eye className="w-4 h-4" />
              </NavLink>
              <button
                title="Edit"
                onClick={() => {
                  setEditingWarehouse(wh);
                  setShowModal(true);
                }}
                className="p-1 text-slate-400 hover:text-amber-600"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                title="Delete"
                onClick={() => setDeletingWarehouse(wh)}
                className="p-1 text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <WarehouseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingWarehouse(null);
        }}
        warehouse={editingWarehouse}
        onSaved={handleSave}
      />

      <ConfirmModal
        isOpen={!!deletingWarehouse}
        onClose={() => setDeletingWarehouse(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Warehouse"
        message={`Are you sure you want to remove '${deletingWarehouse?.name}'? Warehouses with active stock units cannot be deleted.`}
        confirmText="Delete Warehouse"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default WarehouseList;
