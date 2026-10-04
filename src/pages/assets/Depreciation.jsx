import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingDown,
  Calculator,
  RefreshCw,
  Download,
  Printer,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight,
} from 'lucide-react';
import assetService from '../../services/assetService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

export const Depreciation = () => {
  const navigate = useNavigate();

  const [depreciationData, setDepreciationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [calcSuccess, setCalcSuccess] = useState(false);
  const [frequency, setFrequency] = useState('monthly'); // 'monthly' | 'quarterly' | 'yearly'
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  useEffect(() => {
    fetchDepreciation();
  }, [frequency]);

  const fetchDepreciation = async () => {
    try {
      setLoading(true);
      const res = await assetService.getDepreciation({ frequency });
      const list = res.data?.data || res.data || [];
      setDepreciationData(list);
    } catch (err) {
      console.error('Failed to load depreciation schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCalculation = async () => {
    if (!window.confirm('Run batch depreciation calculation for the current financial cycle? This will update accumulated depreciation and current book values across all active fixed assets.')) return;
    try {
      setCalculating(true);
      await assetService.calculateDepreciation();
      setCalcSuccess(true);
      setTimeout(() => setCalcSuccess(false), 4000);
      await fetchDepreciation();
    } catch (err) {
      alert(err.response?.data?.message || 'Depreciation calculation failed.');
    } finally {
      setCalculating(false);
    }
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const exportCSV = () => {
    const headers = ['Asset Code', 'Asset Name', 'Purchase Cost', 'Salvage Value', 'Useful Life', 'Method', 'Monthly Depr', 'Accumulated Depr', 'Current Book Value'];
    const rows = filteredData.map((d) => [
      d.asset_code || `AST-${d.id}`,
      d.name || d.asset_name,
      d.purchase_cost || d.total_cost,
      d.salvage_value || 0,
      `${d.useful_life_years || 5} Years`,
      d.depreciation_method || 'straight_line',
      d.monthly_depreciation || (d.purchase_cost ? (d.purchase_cost - (d.salvage_value || 0)) / ((d.useful_life_years || 5) * 12) : 0),
      d.accumulated_depreciation || 0,
      d.current_book_value || d.book_value || d.purchase_cost,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `depreciation_schedule_${frequency}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = depreciationData.filter((item) => {
    const term = search.toLowerCase();
    const name = (item.name || item.asset_name || '').toLowerCase();
    const code = (item.asset_code || '').toLowerCase();
    const method = (item.depreciation_method || '').toLowerCase();

    const matchesSearch = name.includes(term) || code.includes(term);
    const matchesMethod = !selectedMethod || method === selectedMethod.toLowerCase();
    return matchesSearch && matchesMethod;
  });

  const totalCost = filteredData.reduce((acc, d) => acc + Number(d.purchase_cost || d.total_cost || 0), 0);
  const totalAccum = filteredData.reduce((acc, d) => acc + Number(d.accumulated_depreciation || 0), 0);
  const totalBookVal = filteredData.reduce(
    (acc, d) => acc + Number(d.current_book_value || d.book_value || d.purchase_cost || 0),
    0
  );
  const totalMonthlyDepr = filteredData.reduce((acc, d) => {
    const cost = Number(d.purchase_cost || d.total_cost || 0);
    const salvage = Number(d.salvage_value || 0);
    const years = Number(d.useful_life_years || 5);
    const monthly = d.monthly_depreciation ? Number(d.monthly_depreciation) : (cost - salvage) / (years * 12);
    return acc + monthly;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-teal-600" />
            Fixed Asset Depreciation Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated Straight Line (SLM), Declining Balance (WDV), and Double Declining amortization schedules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {calcSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Batch Calculated!
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={exportCSV}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-teal-600" /> Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunCalculation}
            disabled={calculating}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
            {calculating ? 'Calculating Engine...' : 'Run Batch Depreciation'}
          </Button>
        </div>
      </div>

      {/* Financial Valuation Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Gross Asset Value</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(totalCost)}</p>
          <span className="text-[11px] text-slate-400">Total historical cost</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Current Book Value</span>
          <p className="text-lg font-bold text-teal-600 mt-1">{formatCurrency(totalBookVal)}</p>
          <span className="text-[11px] text-teal-600 font-medium">Balance sheet asset valuation</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Accumulated Depreciation</span>
          <p className="text-lg font-bold text-amber-600 mt-1">{formatCurrency(totalAccum)}</p>
          <span className="text-[11px] text-slate-400">Expensed to date</span>
        </Card>

        <Card className="p-4 bg-white border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Monthly Expense Run
          </span>
          <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(totalMonthlyDepr)}</p>
          <span className="text-[11px] text-slate-400">P&L monthly charge</span>
        </Card>
      </div>

      {/* Methods & Frequency Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Schedule Frequency:</span>
          {['monthly', 'quarterly', 'yearly'].map((freq) => (
            <button
              key={freq}
              onClick={() => setFrequency(freq)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                frequency === freq
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search asset or code..."
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-teal-500 bg-white w-48"
          />
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-teal-500 text-slate-700"
          >
            <option value="">All Methods</option>
            <option value="straight_line">Straight Line</option>
            <option value="declining_balance">Declining Balance</option>
            <option value="double_declining">Double Declining</option>
            <option value="units_of_production">Units of Production</option>
          </select>
        </div>
      </div>

      {/* Depreciation Table */}
      <Card className="p-0 bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset Details</th>
                <th className="py-3 px-3 text-right">Purchase Cost</th>
                <th className="py-3 px-3 text-right">Salvage Value</th>
                <th className="py-3 px-3 text-center">Useful Life</th>
                <th className="py-3 px-3">Method</th>
                <th className="py-3 px-3 text-right">
                  {frequency === 'monthly' ? 'Monthly' : frequency === 'quarterly' ? 'Quarterly' : 'Annual'} Depr
                </th>
                <th className="py-3 px-3 text-right">Accumulated Depr</th>
                <th className="py-3 px-4 text-right">Current Book Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="8" className="py-3 px-4">
                      <LoadingSkeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredData.length > 0 ? (
                filteredData.map((d) => {
                  const cost = Number(d.purchase_cost || d.total_cost || 0);
                  const salvage = Number(d.salvage_value || 0);
                  const years = Number(d.useful_life_years || 5);
                  let periodicDepr = d.monthly_depreciation
                    ? Number(d.monthly_depreciation)
                    : (cost - salvage) / (years * 12);

                  if (frequency === 'quarterly') periodicDepr *= 3;
                  if (frequency === 'yearly') periodicDepr *= 12;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div
                          className="font-semibold text-slate-900 hover:text-teal-600 cursor-pointer"
                          onClick={() => navigate(`/app/assets/${d.id}`)}
                        >
                          {d.name || d.asset_name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {d.asset_code || `AST-${d.id}`}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">{formatCurrency(cost)}</td>
                      <td className="py-3 px-3 text-right text-slate-600">{formatCurrency(salvage)}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700">{years} Yrs</td>
                      <td className="py-3 px-3 capitalize text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {(d.depreciation_method || 'straight_line').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-amber-600 font-medium">
                        -{formatCurrency(periodicDepr)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700 font-medium">
                        {formatCurrency(d.accumulated_depreciation || 0)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-teal-700">
                        {formatCurrency(d.current_book_value || d.book_value || cost)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    <TrendingDown className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No assets found in depreciation schedule.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Depreciation;
