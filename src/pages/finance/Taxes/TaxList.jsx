import React, { useState, useEffect } from 'react';
import {
  Percent,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  Scale,
  FileText,
  X,
  Check,
} from 'lucide-react';
import financeService from '../../../services/financeService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const TaxList = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create Tax Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage',
    rate: '',
    is_compound: false,
    description: '',
  });

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getTaxes();
      setTaxes(data || []);
    } catch (err) {
      console.error('Error fetching taxes:', err);
      setError('Unable to load statutory tax rates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleCreateTax = async (e) => {
    e.preventDefault();
    if (!formData.rate || parseFloat(formData.rate) < 0) {
      alert('Please specify a valid tax rate percentage.');
      return;
    }
    try {
      setActionLoading(true);
      await financeService.createTax({
        ...formData,
        rate: parseFloat(formData.rate),
      });
      setSuccessMessage(`Tax bracket "${formData.name}" established.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData({
        name: '',
        code: '',
        type: 'percentage',
        rate: '',
        is_compound: false,
        description: '',
      });
      fetchTaxes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create tax bracket');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTaxes = taxes.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.code?.toLowerCase().includes(q) ||
      t.type?.toLowerCase().includes(q)
    );
  });

  if (loading && taxes.length === 0) return <LoadingSkeleton type="table" />;
  if (error && taxes.length === 0) return <ErrorState message={error} onRetry={fetchTaxes} />;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Statutory Tax & Compliance Rates</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure GST, CGST, SGST, IGST, VAT, and compound levies for automated invoice and procurement calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Tax Bracket
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
              placeholder="Search tax name, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div className="text-xs text-slate-500">
            Configured Tax Schedules: <span className="font-semibold text-slate-800">{taxes.length}</span>
          </div>
        </div>
      </Card>

      {/* Taxes Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Tax Name</th>
                <th className="py-3 px-4">Tax Code</th>
                <th className="py-3 px-4">Tax Type</th>
                <th className="py-3 px-4 text-right">Applicable Rate</th>
                <th className="py-3 px-4 text-center">Compound Tax</th>
                <th className="py-3 px-4">Statutory Notes</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTaxes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Percent className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No taxes found.
                  </td>
                </tr>
              ) : (
                filteredTaxes.map((tax) => (
                  <tr key={tax.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Percent className="w-3.5 h-3.5 text-teal-600" />
                      <span>{tax.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {tax.code || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-600 text-[11px]">{tax.type}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                      {Number(tax.rate)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {tax.is_compound ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {tax.description || 'Statutory standard rate'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={tax.is_active !== false ? 'success' : 'neutral'}>
                        {tax.is_active !== false ? 'Active' : 'Disabled'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Tax Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Configure Tax Rate Schedule</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTax} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tax Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GST 18%, SGST 9%, VAT 5%"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tax Code</label>
                  <input
                    type="text"
                    placeholder="e.g. GST-18"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Rate (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="18.00"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tax Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="gst">GST (General)</option>
                  <option value="cgst">CGST (Central)</option>
                  <option value="sgst">SGST (State)</option>
                  <option value="igst">IGST (Integrated)</option>
                  <option value="vat">VAT</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="compoundCheck"
                  checked={formData.is_compound}
                  onChange={(e) => setFormData({ ...formData, is_compound: e.target.checked })}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <label htmlFor="compoundCheck" className="font-medium text-slate-700 cursor-pointer">
                  Compound Tax (Calculate on top of previous taxes)
                </label>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Compliance category or applicability guidelines..."
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
                  Establish Tax Rate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxList;
