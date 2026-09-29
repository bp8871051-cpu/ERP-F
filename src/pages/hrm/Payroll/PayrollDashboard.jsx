import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  CreditCard,
  CheckCircle,
  Clock,
  Printer,
  FileText,
  AlertCircle,
  Building,
  User,
  X,
  Check,
  Eye,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import financeService from '../../../services/financeService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const PayrollDashboard = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);
  const [selectedPayrollForPay, setSelectedPayrollForPay] = useState(null);
  const [selectedPayrollForPayslip, setSelectedPayrollForPayslip] = useState(null);
  const [payAccountId, setPayAccountId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [calcData, setCalcData] = useState({
    period_name: `Payroll Cycle ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
    start_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
    end_date: new Date().toISOString().slice(0, 10),
  });

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prRes, accRes] = await Promise.all([
        hrmService.getPayroll({ status: statusFilter || undefined }),
        financeService.getAccounts(),
      ]);
      setPayrolls(prRes || []);
      setAccounts(accRes || []);
      if (accRes && accRes.length > 0) {
        setPayAccountId(accRes[0].id);
      }
    } catch (err) {
      console.error('Error fetching payroll:', err);
      setError('Unable to load enterprise compensation and payroll cycles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [statusFilter]);

  const handleCalculatePayroll = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.calculatePayroll(calcData);
      setSuccessMessage('Payroll batch calculated across all active employees!');
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsCalculateModalOpen(false);
      fetchPayrollData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to calculate payroll');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisbursePay = async (e) => {
    e.preventDefault();
    if (!selectedPayrollForPay || !payAccountId) return;
    try {
      setActionLoading(true);
      await hrmService.payPayroll(selectedPayrollForPay.id, payAccountId);
      setSuccessMessage(
        `Payroll #${selectedPayrollForPay.id} disbursed. Salary expense and bank settlement posted to Finance ledger!`
      );
      setTimeout(() => setSuccessMessage(''), 4000);
      setSelectedPayrollForPay(null);
      fetchPayrollData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to disburse payroll');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayrolls = payrolls.filter((p) => {
    const q = searchTerm.toLowerCase();
    const name = `${p.employee?.first_name || ''} ${p.employee?.last_name || ''}`.toLowerCase();
    const code = p.employee?.employee_code?.toLowerCase() || '';
    const period = p.payroll_period?.name?.toLowerCase() || '';
    return name.includes(q) || code.includes(q) || period.includes(q);
  });

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);
  const displayedPayrolls = filteredPayrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Disbursed (Paid)</Badge>;
      case 'approved':
        return <Badge variant="teal">Approved</Badge>;
      case 'processed':
        return <Badge variant="warning">Processed</Badge>;
      case 'draft':
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  if (loading && payrolls.length === 0) return <LoadingSkeleton type="table" />;
  if (error && payrolls.length === 0) return <ErrorState message={error} onRetry={fetchPayrollData} />;

  // Total disbursements metric
  const totalDisbursedThisCycle = payrolls
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + Number(p.net_salary || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Payroll & Compensation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Salary structures, attendance deductions, payslip generation, and automated Finance ledger integration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => setIsCalculateModalOpen(true)}
          >
            Calculate Batch Payroll
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Total Disbursed (Paid)</span>
            <span className="text-2xl font-bold text-teal-700 mt-1 block">
              ₹{totalDisbursedThisCycle.toLocaleString()}
            </span>
          </div>
          <DollarSign className="w-8 h-8 text-teal-600 opacity-20" />
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Pending Authorizations</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">
              {payrolls.filter((p) => p.status === 'draft' || p.status === 'processed').length} Staff
            </span>
          </div>
          <Clock className="w-8 h-8 text-amber-600 opacity-20" />
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Connected Accounts Vault</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">
              {accounts.length} Bank Vaults
            </span>
          </div>
          <Building className="w-8 h-8 text-slate-400 opacity-20" />
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff, employee code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
            >
              <option value="">All Payroll Statuses</option>
              <option value="draft">Draft / Calculated</option>
              <option value="processed">Processed</option>
              <option value="paid">Paid (Finance Integrated)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Payroll Table */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Payroll Cycle</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-right">Allowances</th>
                <th className="py-3 px-4 text-right">Deductions</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedPayrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No payroll records found.
                  </td>
                </tr>
              ) : (
                displayedPayrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {p.employee?.first_name} {p.employee?.last_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.employee?.employee_code} • {p.employee?.designation?.name || 'Staff'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {p.payroll_period?.name || 'Monthly Cycle'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      ₹{Number(p.basic_salary).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                      +₹{Number(p.allowances || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-600 font-medium">
                      -₹{Number(p.deductions || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                      ₹{Number(p.net_salary).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(p.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Payslip View */}
                        <button
                          onClick={() => setSelectedPayrollForPayslip(p)}
                          title="Generate Payslip"
                          className="p-1 rounded text-slate-500 hover:text-teal-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Pay & Ledger Disburse */}
                        {p.status !== 'paid' && (
                          <button
                            onClick={() => setSelectedPayrollForPay(p)}
                            title="Disburse & Post to Finance Ledger"
                            disabled={actionLoading}
                            className="p-1 rounded text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Calculate Batch Modal */}
      {isCalculateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Calculate Batch Compensation</h3>
              </div>
              <button
                onClick={() => setIsCalculateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCalculatePayroll} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Cycle Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={calcData.period_name}
                  onChange={(e) => setCalcData({ ...calcData, period_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Period Start</label>
                  <input
                    type="date"
                    required
                    value={calcData.start_date}
                    onChange={(e) => setCalcData({ ...calcData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Period End</label>
                  <input
                    type="date"
                    required
                    value={calcData.end_date}
                    onChange={(e) => setCalcData({ ...calcData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100">
                Calculates allowances (HRA, Transport, Medical) and statutory deductions (PF, ESI, TDS) based on actual attendance.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCalculateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Run Calculation Engine
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse Payment Modal (Finance Integration) */}
      {selectedPayrollForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Disburse Salary & Post Expense</h3>
              </div>
              <button
                onClick={() => setSelectedPayrollForPay(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDisbursePay} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-lg">
                <div className="flex justify-between text-slate-700">
                  <span>Beneficiary:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedPayrollForPay.employee?.first_name} {selectedPayrollForPay.employee?.last_name}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 mt-1">
                  <span>Net Compensation:</span>
                  <span className="text-base font-bold text-teal-700">
                    ₹{Number(selectedPayrollForPay.net_salary).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Disbursement Bank / Vault *</label>
                <select
                  required
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} (₹{Number(acc.current_balance || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  This transaction will automatically create a Salary Expense record and post a double-entry ledger debit in the Finance module.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedPayrollForPay(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Confirm & Disburse Funds
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Payslip Modal */}
      {selectedPayrollForPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold text-sm">Official Employee Payslip</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedPayrollForPayslip(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Falcon ERP Enterprise Suite</h2>
                  <p className="text-[11px] text-slate-500">Corporate HQ • Bengaluru, Karnataka</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm block">PAYSLIP CONFIRMATION</span>
                  <span className="text-[10px] text-slate-500">
                    Cycle: {selectedPayrollForPayslip.payroll_period?.name || 'Standard Monthly Cycle'}
                  </span>
                </div>
              </div>

              {/* Staff and Bank Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">EMPLOYEE NAME</span>
                  <span className="font-bold text-slate-900">
                    {selectedPayrollForPayslip.employee?.first_name}{' '}
                    {selectedPayrollForPayslip.employee?.last_name}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ID: {selectedPayrollForPayslip.employee?.employee_code} •{' '}
                    {selectedPayrollForPayslip.employee?.designation?.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">BANK DIRECT DEPOSIT</span>
                  <span className="font-mono font-medium text-slate-800">
                    {selectedPayrollForPayslip.employee?.bank_name || 'HDFC Bank'} (••••{' '}
                    {selectedPayrollForPayslip.employee?.account_number
                      ? selectedPayrollForPayslip.employee.account_number.slice(-4)
                      : '4482'}
                    )
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    IFSC: {selectedPayrollForPayslip.employee?.ifsc || 'HDFC0001234'}
                  </span>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-800 border-b border-slate-200">
                    Earnings (INR)
                  </div>
                  <div className="divide-y divide-slate-100 p-3 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Basic Pay:</span>
                      <span className="font-medium">
                        ₹{Number(selectedPayrollForPayslip.basic_salary).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span>Allowances (HRA/TA):</span>
                      <span className="font-medium">
                        +₹{Number(selectedPayrollForPayslip.allowances || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-800 border-b border-slate-200">
                    Deductions (INR)
                  </div>
                  <div className="divide-y divide-slate-100 p-3 space-y-1.5">
                    <div className="flex justify-between text-rose-600">
                      <span>Statutory Deductions (PF/TDS):</span>
                      <span className="font-medium">
                        -₹{Number(selectedPayrollForPayslip.deductions || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Total Box */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">NET TAKE-HOME DISBURSEMENT:</span>
                <span className="text-xl font-bold text-teal-800">
                  ₹{Number(selectedPayrollForPayslip.net_salary).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollDashboard;
