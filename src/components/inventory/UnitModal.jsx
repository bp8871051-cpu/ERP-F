import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export const UnitModal = ({ isOpen, onClose, onSaved, unit = null }) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [unitType, setUnitType] = useState('quantity');
  const [conversionFactor, setConversionFactor] = useState('1.0000');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (unit) {
        setName(unit.name || '');
        setShortName(unit.short_name || '');
        setShortCode(unit.short_code || unit.short_name || '');
        setUnitType(unit.unit_type || 'quantity');
        setConversionFactor(unit.conversion_factor || '1.0000');
        setStatus(unit.status || 'active');
      } else {
        setName('');
        setShortName('');
        setShortCode('');
        setUnitType('quantity');
        setConversionFactor('1.0000');
        setStatus('active');
      }
    }
  }, [isOpen, unit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) {
      setError('Unit name and short code are required.');
      return;
    }

    try {
      setLoading(true);
      await onSaved({
        name,
        short_name: shortName,
        short_code: shortCode || shortName,
        unit_type: unitType,
        conversion_factor: parseFloat(conversionFactor) || 1.0,
        status,
      }, unit?.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save unit.');
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
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{unit ? 'Edit Unit' : 'Create Unit'}</h3>
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
                Unit Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kilogram or Box"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Symbol <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="e.g. kg, box, pcs"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Code</label>
                <input
                  type="text"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  placeholder="e.g. KG, BOX"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Type</label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600 bg-white"
                >
                  <option value="quantity">Quantity / Pieces</option>
                  <option value="pack">Packaging / Pack</option>
                  <option value="weight">Weight (Mass)</option>
                  <option value="volume">Volume (Liquid)</option>
                  <option value="length">Length / Linear</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Conversion Factor</label>
                <input
                  type="number"
                  step="0.0001"
                  value={conversionFactor}
                  onChange={(e) => setConversionFactor(e.target.value)}
                  placeholder="1.0000"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-teal-600"
                />
              </div>
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
                {loading ? 'Saving...' : unit ? 'Update Unit' : 'Create Unit'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnitModal;
