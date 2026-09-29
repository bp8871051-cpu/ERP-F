import React, { useState, useEffect } from 'react';
import {
  PieChart as PieChartIcon,
  Plus,
  AlertTriangle,
  CheckCircle,
  Building,
  TrendingUp,
  DollarSign,
  Calendar,
  X,
  Check,
  BarChart3,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import financeService from '../../../services/financeService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Budget Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    financial_year: `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    start_date: `${new Date().getFullYear()}-04-01`,
    end_date: `${new Date().getFullYear() + 1}-03-31`,
    department: 'General',
    category_id: '',
    amount: '',
  });

  const fetchBudgetsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bRes, cRes] = await Promise.all([
        financeService.getBudgets(),
        financeService.getExpenseCategories(),
      ]);
      setBudgets(bRes || []);
      setCategories(cRes || []);
      if (cRes && cRes.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: cRes[0].id }));
      }
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError('Unable to load departmental budget allocations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetsData();
  }, []);

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid budget allocation amount.');
      return;
    }
    try {
      setActionLoading(true);
      await financeService.createBudget({
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null,
      });
      setSuccessMessage(`Budget "${formData.name}" established successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      setFormData({
        name: '',
        financial_year: `FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        start_date: `${new Date().getFullYear()}-04-01`,
        end_date: `${new Date().getFullYear() + 1}-03-31`,
        department: 'General',
        category_id: categories[0]?.id || '',
        amount: '',
      });
      fetchBudgetsData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create budget envelope');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && budgets.length === 0) return <LoadingSkeleton type="dashboard" />;
  if (error && budgets.length === 0) return <ErrorState message={error} onRetry={fetchBudgetsData} />;

  // Chart data
  const chartData = budgets.slice(0, 8).map((b) => ({
    name: b.name.length > 14 ? b.name.substring(0, 14) + '...' : b.name,
    budget: Number(b.amount || 0),
    actual: Number(b.spent_amount || 0),
  }));

  const getUtilizationBadge = (pct) => {
    if (pct >= 100) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          {pct.toFixed(1)}% Exceeded
        </span>
      );
    }
    if (pct >= 90) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {pct.toFixed(1)}% Critical
        </span>
      );
    }
    if (pct >= 80) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
          {pct.toFixed(1)}% Alert (80%+)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        {pct.toFixed(1)}% Safe
      </span>
    );
  };

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'bg-rose-500';
    if (pct >= 90) return 'bg-amber-500';
    if (pct >= 80) return 'bg-yellow-500';
    return 'bg-teal-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Budgeting & Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Departmental spending thresholds, variance analysis, and 80%/90%/100% automated overrun monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="teal" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Budget Envelope
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Chart: Budget vs Actual */}
      <Card className="p-5 bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Planned Budget vs Actual Expenditure</h2>
            <p className="text-xs text-slate-500">Telemetry comparison across key operational cost envelopes</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="budget" name="Approved Budget" fill="#0F8B7A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual Spending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Budget Cards & Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const budgetAmt = Number(b.amount || 0);
          const actualAmt = Number(b.spent_amount || 0);
          const remainingAmt = budgetAmt - actualAmt;
          const utilizationPct = budgetAmt > 0 ? (actualAmt / budgetAmt) * 100 : 0;

          return (
            <Card key={b.id} className="p-4 bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {b.department || 'All Departments'} • {b.financial_year || 'FY 2026-27'}
                  </span>
                </div>
                {getUtilizationBadge(utilizationPct)}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                      utilizationPct
                    )}`}
                    style={{ width: `${Math.min(100, utilizationPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>₹0</span>
                  <span>Cap: ₹{budgetAmt.toLocaleString()}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Allocated</span>
                  <span className="font-semibold text-slate-800">₹{budgetAmt.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Spent</span>
                  <span className="font-bold text-slate-900">₹{actualAmt.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Remaining</span>
                  <span
                    className={`font-semibold ${
                      remainingAmt < 0 ? 'text-rose-600' : 'text-teal-700'
                    }`}
                  >
                    ₹{remainingAmt.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Create Departmental Budget Envelope</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Budget Envelope Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering Q3 R&D, Corporate Marketing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Financial Year</label>
                  <input
                    type="text"
                    value={formData.financial_year}
                    onChange={(e) => setFormData({ ...formData, financial_year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Expense Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Allocated Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Effective Start</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Effective End</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
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
                  Save Budget Envelope
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetList;
