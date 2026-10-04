import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Boxes,
  Eye,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import assetService from '../../services/assetService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const Disposal = () => {
  const navigate = useNavigate();

  const [disposals, setDisposals] = useState([]);
  const [activeAssets, setActiveAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [disposalForm, setDisposalForm] = useState({
    asset_id: '',
    disposal_type: 'sell',
    disposal_date: new Date().toISOString().split('T')[0],
    sale_value: '0',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    fetchDisposals();
    fetchActiveAssets();
  }, [selectedType, selectedStatus]);

  const fetchDisposals = async () => {
    try {
      setLoading(true);
      const res = await assetService.getDisposals({
        disposal_type: selectedType || undefined,
        status: selectedStatus || undefined,
      });
      const list = res.data?.data || res.data || [];
      setDisposals(list);
    } catch (err) {
      console.error('Failed to load asset disposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAssets = async () => {
    try {
      const res = await assetService.getAssets({ per_page: 100 });
      const list = (res.data?.data || res.data || []).filter(
        (a) => a.status !== 'disposed' && a.status !== 'retired'
      );
      setActiveAssets(list);
      if (list.length > 0) {
        setDisposalForm((prev) => ({ ...prev, asset_id: list[0].id }));
      }
    } catch (err) {
      console.warn('Could not load active assets:', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!disposalForm.asset_id || !disposalForm.reason) {
      alert('Please select an asset and specify the disposal reason.');
      return;
    }
    try {
      setActionLoading(true);
      await assetService.createDisposal({
        ...disposalForm,
        sale_value: parseFloat(disposalForm.sale_value || 0),
      });
      setShowCreateModal(false);
      setDisposalForm({
        asset_id: activeAssets[0]?.id || '',
        disposal_type: 'sell',
        disposal_date: new Date().toISOString().split('T')[0],
        sale_value: '0',
        reason: '',
        notes: '',
      });
      await fetchDisposals();
      await fetchActiveAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating disposal request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id, assetName) => {
    if (!window.confirm(`Approve disposal for asset "${assetName}"? This will officially retire the asset and update the ledger.`)) return;
    try {
      setActionLoading(true);
      await assetService.approveDisposal(id);
      await fetchDisposals();
      await fetchActiveAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving disposal');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const filteredDisposals = disposals.filter((d) => {
    const term = search.toLowerCase();
    const assetName = (d.asset?.name || d.asset_name || '').toLowerCase();
    const code = (d.asset?.asset_code || '').toLowerCase();
    const reason = (d.reason || '').toLowerCase();
    return assetName.includes(term) || code.includes(term) || reason.includes(term);
  });

  const totalSaleValue = filteredDisposals.reduce((acc, d) => acc + Number(d.sale_value || 0), 0);
  const totalBookValue = filteredDisposals.reduce((acc, d) => acc + Number(d.book_value || d.asset?.current_book_value || 0), 0);
  const netGainLoss = totalSaleValue - totalBookValue;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-rose-600" />
            Fixed Asset Disposals & Write-Offs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage asset decommissioning, sale realizations, CSR donations, scrap recycling, and accounting gain/loss recognition.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" /> Initiate Disposal
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Disposed Assets</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{filteredDisposals.length}</p>
          <span className="text-[11px] text-slate-400">Total processed</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Book Value At Exit</span>
          <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(totalBookValue)}</p>
          <span className="text-[11px] text-slate-400">Carrying balance at disposal</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Realized Sale Recovery</span>
          <p className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(totalSaleValue)}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Cash recovered from sales</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Gain / Loss on Disposal</span>
          <p className={`text-lg font-bold mt-1 ${netGainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netGainLoss >= 0 ? '+' : ''}{formatCurrency(netGainLoss)}
          </p>
          <span className="text-[11px] text-slate-400">Accounting profit / (loss)</span>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset, code, disposal reason..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-teal-500 bg-white"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-teal-500 text-slate-700 capitalize"
            >
              <option value="">All Disposal Types</option>
              <option value="sell">Sell (Liquidate)</option>
              <option value="scrap">Scrap (Recycle)</option>
              <option value="donate">Donate (CSR)</option>
              <option value="write_off">Write Off</option>
              <option value="lost">Lost / Stolen</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-teal-500 text-slate-700 capitalize"
            >
              <option value="">All Approval Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved & Retired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Disposals Table */}
      <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset Details</th>
                <th className="py-3 px-3">Disposal Type</th>
                <th className="py-3 px-3">Disposal Date</th>
                <th className="py-3 px-3 text-right">Book Value</th>
                <th className="py-3 px-3 text-right">Sale Value</th>
                <th className="py-3 px-3 text-right">Gain / (Loss)</th>
                <th className="py-3 px-3">Reason / Remarks</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="9" className="py-3 px-4">
                      <LoadingSkeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredDisposals.length > 0 ? (
                filteredDisposals.map((d) => {
                  const bookVal = Number(d.book_value || d.asset?.current_book_value || 0);
                  const saleVal = Number(d.sale_value || 0);
                  const diff = saleVal - bookVal;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div
                          className="font-semibold text-slate-900 hover:text-teal-600 cursor-pointer"
                          onClick={() => navigate(`/app/assets/${d.asset_id || d.asset?.id}`)}
                        >
                          {d.asset?.name || d.asset_name || 'Enterprise Asset'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {d.asset?.asset_code || `AST-${d.asset_id}`}
                        </div>
                      </td>
                      <td className="py-3 px-3 capitalize">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {(d.disposal_type || 'sell').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {d.disposal_date ? new Date(d.disposal_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700 font-medium">
                        {formatCurrency(bookVal)}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-600 font-bold">
                        {formatCurrency(saleVal)}
                      </td>
                      <td className={`py-3 px-3 text-right font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate">
                        {d.reason || '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={d.status === 'approved' ? 'success' : 'warning'}>
                          {d.status ? d.status.toUpperCase() : 'PENDING'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {d.status !== 'approved' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleApprove(d.id, d.asset?.name || 'Asset')}
                              disabled={actionLoading}
                              title="Approve Disposal & Retire Asset"
                              className="text-[11px] py-1 px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            >
                              <ShieldCheck className="w-3 h-3 mr-1" /> Approve
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/app/assets/${d.asset_id || d.asset?.id}`)}
                            title="View Asset"
                            className="p-1 text-slate-400 hover:text-slate-800"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    <Trash2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No asset disposals found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Initiate Disposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-rose-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Initiate Capital Asset Disposal
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Asset to Decommission *</label>
                <select
                  required
                  value={disposalForm.asset_id}
                  onChange={(e) => setDisposalForm({ ...disposalForm, asset_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500 font-medium"
                >
                  {activeAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.asset_code || `AST-${a.id}`}) — Current Book Value: ₹{Number(a.current_book_value || a.book_value || a.purchase_cost || 0).toFixed(0)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disposal Method</label>
                  <select
                    value={disposalForm.disposal_type}
                    onChange={(e) => setDisposalForm({ ...disposalForm, disposal_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                  >
                    <option value="sell">Sell (Liquidate to Buyer)</option>
                    <option value="scrap">Scrap (Recycle & Salvage)</option>
                    <option value="donate">Donate (Charity / CSR)</option>
                    <option value="write_off">Write Off (Damaged / Obsolete)</option>
                    <option value="lost">Lost / Stolen</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disposal Date</label>
                  <input
                    type="date"
                    value={disposalForm.disposal_date}
                    onChange={(e) => setDisposalForm({ ...disposalForm, disposal_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Realized Sale / Recovery Value (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={disposalForm.sale_value}
                  onChange={(e) => setDisposalForm({ ...disposalForm, sale_value: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Disposal *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="End of economic life, upgrade to newer generation, unrepairable motherboard failure..."
                  value={disposalForm.reason}
                  onChange={(e) => setDisposalForm({ ...disposalForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-[11px] flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Disposal request will require formal administrative approval before the asset is marked 'Disposed' and retired from the balance sheet.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" variant="danger" size="sm" disabled={actionLoading}>
                  {actionLoading ? 'Submitting...' : 'Submit Disposal Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disposal;
