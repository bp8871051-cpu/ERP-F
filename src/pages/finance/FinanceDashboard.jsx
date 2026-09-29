import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  AlertCircle,
  FileText,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PieChart as PieChartIcon,
  ShieldCheck,
  Calendar,
  Wallet,
  Landmark,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import financeService from '../../services/financeService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';

const COLORS = ['#0F8B7A', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#6366F1'];

export const FinanceDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeService.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Error fetching finance dashboard:', err);
      setError('Unable to load live finance metrics and transaction data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (error || !data) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const { metrics = {}, charts = {}, recentTransactions = [] } = data;

  // Process and aggregate expense distribution into Top 5 + Other Expenses
  const rawExpenseDist = charts.expenseDistribution || [];
  const sortedExpenses = [...rawExpenseDist].sort((a, b) => (b.value || 0) - (a.value || 0));
  const totalExpenseSum = sortedExpenses.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  let formattedExpenseDist = [];
  if (sortedExpenses.length > 5) {
    const top5 = sortedExpenses.slice(0, 5);
    const otherVal = sortedExpenses.slice(5).reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
    formattedExpenseDist = [
      ...top5,
      ...(otherVal > 0 ? [{ name: 'Other Expenses', value: otherVal }] : []),
    ];
  } else {
    formattedExpenseDist = sortedExpenses;
  }

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative general ledger, operational expenses, receivables, treasury, and statutory taxes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchDashboard}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" icon={PlusCircle} onClick={() => navigate('/app/finance/expenses/create')}>
            + Add Expense
          </Button>
          <Button variant="secondary" size="sm" icon={CreditCard} onClick={() => navigate('/app/finance/payments')}>
            + Record Payment
          </Button>
          <Button variant="secondary" size="sm" icon={Wallet} onClick={() => navigate('/app/finance/cashflow')}>
            Cashflow
          </Button>
          <Button variant="primary" size="sm" icon={FileText} onClick={() => navigate('/app/finance/reports')}>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Primary 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${Number(metrics.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+14.2% MoM"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses"
          value={`$${Number(metrics.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="-3.1% MoM"
          trend="down"
          icon={ArrowDownRight}
        />
        <StatCard
          title="Net Profit"
          value={`$${Number(metrics.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="+18.5% Margin"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Accounts Receivable"
          value={`$${Number(metrics.accountsReceivable || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="Unpaid Invoices"
          trend="neutral"
          icon={CreditCard}
        />
        <StatCard
          title="Accounts Payable"
          value={`$${Number(metrics.accountsPayable || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change="Vendor Liabilities"
          trend="down"
          icon={Building2}
        />
      </div>

      {/* Secondary Liquidity & Tax Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cash Balance</span>
            <h4 className="text-xl font-bold text-slate-900 mt-1">
              ${Number(metrics.cashBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h4>
            <span className="text-[11px] text-emerald-600 font-medium">Safe & Registers</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bank Balance</span>
            <h4 className="text-xl font-bold text-slate-900 mt-1">
              ${Number(metrics.bankBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h4>
            <span className="text-[11px] text-blue-600 font-medium">Corporate Accounts</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overdue Invoices</span>
            <h4 className="text-xl font-bold text-amber-600 mt-1">
              ${Number(metrics.overduePayments || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h4>
            <span className="text-[11px] text-amber-700 font-medium">Action Required</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tax Payable Est.</span>
            <h4 className="text-xl font-bold text-slate-900 mt-1">
              ${Number(metrics.taxPayable || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">Net Statutory GST / VAT</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts: Revenue vs Expenses & Cashflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Revenue vs Expenses (6-Month Trajectory)">
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenueVsExpenses || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F8B7A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0F8B7A" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0F8B7A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Operating Expense Distribution">
            <div className="h-72 w-full flex flex-col justify-between pt-1">
              <div className="relative w-full h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formattedExpenseDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={66}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {formattedExpenseDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [
                        `$${Number(val).toLocaleString()} (${totalExpenseSum > 0 ? ((val / totalExpenseSum) * 100).toFixed(1) : 0}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px',
                        padding: '6px 10px',
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Stat */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Total</span>
                  <span className="text-xs font-bold text-slate-800">
                    ${(totalExpenseSum / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>

              {/* Clean Structured Legend */}
              <div className="space-y-1.5 px-2 pb-1 overflow-y-auto max-h-32">
                {formattedExpenseDist.map((item, idx) => {
                  const pct = totalExpenseSum > 0 ? ((item.value / totalExpenseSum) * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="truncate max-w-[140px] text-slate-600 font-medium text-[11px]" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-semibold text-slate-800">
                          ${Number(item.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Secondary Charts: Cashflow Trend & Receivables vs Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Cash Inflow vs Outflow Velocity">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.cashflowTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="inflow" name="Cash In" fill="#0F8B7A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Cash Out" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Accounts Receivable vs Payable Timeline">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.receivableTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip formatter={(val) => [`$${Number(val).toLocaleString()}`, '']} />
                <Legend />
                <Line type="monotone" dataKey="amount" name="Customer Receivables" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Central Financial Transactions */}
      <Card
        title="Recent Financial Transactions & Settlement Feed"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/finance/payments')}>
            View All Payments
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Party / Counterparty</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-600 whitespace-nowrap">{tx.date}</td>
                  <td className="py-3 px-3 font-semibold text-teal-700 whitespace-nowrap">{tx.reference}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                      tx.type.toLowerCase().includes('customer') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{tx.party}</td>
                  <td className="py-3 px-3 text-slate-500 truncate max-w-xs">{tx.description}</td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{tx.payment_method}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 text-right whitespace-nowrap">{tx.amount}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <Badge variant={tx.status.toLowerCase() === 'completed' || tx.status.toLowerCase() === 'paid' ? 'success' : 'warning'}>
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FinanceDashboard;
