import React, { useState, useEffect } from 'react';
import { Scale, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import unitService from '../../../services/unitService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import UnitModal from '../../../components/inventory/UnitModal';
import ConfirmModal from '../../../components/inventory/ConfirmModal';

export const UnitList = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [deletingUnit, setDeletingUnit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await unitService.getUnits();
      setUnits(res.data || []);
    } catch (err) {
      console.error('Error fetching units:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data, id) => {
    if (id) {
      await unitService.updateUnit(id, data);
    } else {
      await unitService.createUnit(data);
    }
    fetchUnits();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUnit) return;
    try {
      setActionLoading(true);
      setErrorMessage(null);
      await unitService.deleteUnit(deletingUnit.id);
      setDeletingUnit(null);
      fetchUnits();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete unit.');
      setDeletingUnit(null);
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
            <Scale className="w-6 h-6 text-teal-600" />
            Units of Measure (UOM)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard packaging configurations, unit conversion ratios, and weight/length definitions.
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingUnit(null);
            setShowModal(true);
          }}
        >
          Add Unit
        </Button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Units Table Card */}
      <Card className="overflow-hidden shadow-sm border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Unit Name</th>
                <th className="p-3">Symbol</th>
                <th className="p-3">Short Code</th>
                <th className="p-3">Unit Type</th>
                <th className="p-3 text-right">Conversion Factor</th>
                <th className="p-3 text-right">Linked Products</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Loading units of measure...
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No units defined yet.
                  </td>
                </tr>
              ) : (
                units.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="p-3 font-mono font-bold text-teal-700">{u.short_name}</td>
                    <td className="p-3 font-mono text-slate-500 uppercase">{u.short_code || u.short_name}</td>
                    <td className="p-3 text-slate-600 capitalize">{u.unit_type || 'quantity'}</td>
                    <td className="p-3 text-right font-mono font-medium text-slate-800">
                      {Number(u.conversion_factor || 1).toFixed(4)}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-800">
                      {u.products_count ?? 0}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingUnit(u);
                            setShowModal(true);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUnit(u)}
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

      <UnitModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUnit(null);
        }}
        unit={editingUnit}
        onSaved={handleSave}
      />

      <ConfirmModal
        isOpen={!!deletingUnit}
        onClose={() => setDeletingUnit(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Unit"
        message={`Are you sure you want to delete '${deletingUnit?.name}'? Units used in product catalog cannot be deleted.`}
        confirmText="Delete Unit"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default UnitList;
