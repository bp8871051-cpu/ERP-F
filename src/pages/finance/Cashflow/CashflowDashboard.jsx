import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Plus,
  Landmark,
  CreditCard,
  Building,
  Calendar,
  Filter,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import financeService from '../../../services/financeService';
import StatCard from '../../../components/ui/StatCard';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const CashflowDashboard = () => {
  const [cashflowData, setCashflowData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timeframe filter
  const [period, setPeriod] = useState('monthly');
  const [selectedAccountId, setSelectedAccountId] = useState('');

  // Add Account Modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [newAccount, setNewAccount] = useState({
    account_name: '',
    account_type: 'bank',
    account_number: '',
    bank_name: '',
    opening_balance: '0',
    currency: 'INR',
  });

  const fetchCashflowTelemetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cfRes, accRes] = await Promise.all([
        financeService.getCashflow({ period, account_id: selectedAccountId || undefined }),
        financeService.getAccounts(),
      ]);
      setCashflowData(cfRes || {});
      setAccounts(accRes || []);
    } catch (err) {
      console.error('Error fetching cashflow:', err);
      setError('Unable to load enterprise cashflow telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashflowTelemetry();
  }, [period, selectedAccountId]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await financeService.createAccount({
        ...newAccount,
        opening_balance: parseFloat(newAccount.opening_balance) || 0,
      });
      setSuccessMessage(`Account "${newAccount.account_name}" established.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsAccountModalOpen(false);
      setNewAccount({
        account_name: '',
        account_type: 'bank',
        account_number: '',
        bank_name: '',
        opening_balance: '0',
        currency: 'INR',
      });
      fetchCashflowTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create account');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !cashflowData) return <LoadingSkeleton type="dashboard" />;
  if (error && !cashflowData) return <ErrorState message={error} onRetry={fetchCashflowTelemetry} />;

  const {
    opening_balance = 0,
    total_inflow = 0,
    total_outflow = 0,
    closing_balance = 0,
    trend = [],
    transactions = [],
  } = cashflowData || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Cashflow & Treasury</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time cash in/out tracking, vault liquidity ratios, and multibank ledger positions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md capitalize cursor-pointer transition-all ${
                  period === p
                    ? 'bg-white text-teal-700 font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => setIsAccountModalOpen(true)}
          >
            New Vault Account
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 4 Core Liquidity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Opening Cash Balance"
          value={`₹${Number(opening_balance).toLocaleString()}`}
          subtitle="Beginning of period"
          icon={Wallet}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />

        <StatCard
          title="Total Cash Inflow"
          value={`₹${Number(total_inflow).toLocaleString()}`}
          subtitle="Receipts, sales & income"
          icon={ArrowDownLeft}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Total Cash Outflow"
          value={`₹${Number(total_outflow).toLocaleString()}`}
          subtitle="Payables, vendor & expenses"
          icon={ArrowUpRight}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />

        <StatCard
          title="Closing Cash Position"
          value={`₹${Number(closing_balance).toLocaleString()}`}
          subtitle="Net available liquidity"
          icon={Landmark}
          iconColor="text-teal-700"
          iconBg="bg-teal-100"
        />
      </div>

      {/* Cashflow Trend Chart & Accounts List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 p-5 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Cashflow Dynamics ({period.toUpperCase()})
              </h2>
              <p className="text-xs text-slate-500">Inflows vs Outflows vs Net Liquidity Movement</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Cash In
              </span>
              <span className="flex items-center gap-1 text-rose-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Cash Out
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
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
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Inflow"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#inflowGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  name="Outflow"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#outflowGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bank & Cash Accounts Liquidity List */}
        <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Vault & Bank Accounts</h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
              {accounts.length} Accounts
            </span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() =>
                  setSelectedAccountId(selectedAccountId === acc.id ? '' : acc.id)
                }
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedAccountId === acc.id
                    ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Landmark
                      className={`w-4 h-4 ${
                        selectedAccountId === acc.id ? 'text-teal-600' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800">{acc.account_name}</h4>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {acc.bank_name || acc.account_type} {acc.account_number ? `(•••• ${acc.account_number.slice(-4)})` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">
                      ₹{Number(acc.current_balance || 0).toLocaleString()}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">
                      {acc.currency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedAccountId && (
            <button
              onClick={() => setSelectedAccountId('')}
              className="w-full text-center text-xs text-teal-600 hover:underline pt-2 border-t border-slate-100 cursor-pointer"
            >
              Clear Account Filter (View All)
            </button>
          )}
        </Card>
      </div>

      {/* Cashflow Transaction Activity Ledger */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Cashflow Movements</h3>
            <p className="text-xs text-slate-500">Live inflow/outflow transaction entries across company vaults</p>
          </div>
          <span className="text-xs text-slate-400">
            {transactions.length} entries recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Account / Vault</th>
                <th className="py-3 px-4">Description / Reference</th>
                <th className="py-3 px-4">Category / Source</th>
                <th className="py-3 px-4 text-right">Inflow (+)</th>
                <th className="py-3 px-4 text-right">Outflow (-)</th>
                <th className="py-3 px-4 text-right">Closing Run Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No cashflow movements recorded for this timeframe.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{tx.transaction_date}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {tx.account?.account_name || 'Main Vault'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{tx.description || tx.reference_number || '—'}</td>
                    <td className="py-3 px-4 capitalize text-slate-500">{tx.category || tx.transaction_type}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      {Number(tx.inflow) > 0 ? `+₹${Number(tx.inflow).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-rose-600">
                      {Number(tx.outflow) > 0 ? `-₹${Number(tx.outflow).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{Number(tx.balance_after || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Create Vault / Bank Account</h3>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Account Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Operating Account, Primary Cash Drawer"
                  value={newAccount.account_name}
                  onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Account Type *</label>
                  <select
                    value={newAccount.account_type}
                    onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash Vault</option>
                    <option value="upi">UPI / Virtual Account</option>
                    <option value="credit_card">Corporate Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Currency</label>
                  <input
                    type="text"
                    value={newAccount.currency}
                    onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, ICICI"
                    value={newAccount.bank_name}
                    onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 50200012345678"
                    value={newAccount.account_number}
                    onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAccount.opening_balance}
                  onChange={(e) => setNewAccount({ ...newAccount, opening_balance: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAccountModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Establish Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashflowDashboard;
