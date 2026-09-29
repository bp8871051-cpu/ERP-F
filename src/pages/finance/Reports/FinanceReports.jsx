import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Scale,
  PieChart,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  Building,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import financeService from '../../../services/financeService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const FinanceReports = () => {
  const [activeTab, setActiveTab] = useState('pnl'); // pnl, balance, receivables, payables
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`);
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getReports({
        report_type: activeTab,
        start_date: startDate,
        end_date: endDate,
      });
      setReportData(data || {});
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Unable to compile financial statements from general ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab, startDate, endDate]);

  const handleExportCSV = () => {
    let headers = ['Item', 'Amount'];
    let rows = [];

    if (activeTab === 'pnl') {
      headers = ['Category / Account', 'Total (INR)'];
      rows = [
        ['Total Revenue (Sales & Inflow)', reportData?.total_revenue || 0],
        ['Total Operating Expenses', reportData?.total_expenses || 0],
        ['Cost of Goods / Purchases', reportData?.cost_of_goods || 0],
        ['Net Operating Profit / (Loss)', reportData?.net_profit || 0],
      ];
    } else if (activeTab === 'receivables') {
      headers = ['Customer Name', 'Outstanding Invoices', 'Total Due (INR)'];
      rows = (reportData?.items || []).map((i) => [i.name, i.invoices_count, i.amount]);
    } else if (activeTab === 'payables') {
      headers = ['Vendor Name', 'Pending Purchases', 'Total Payable (INR)'];
      rows = (reportData?.items || []).map((i) => [i.name, i.bills_count, i.amount]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `financial_report_${activeTab}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !reportData) return <LoadingSkeleton type="table" />;
  if (error && !reportData) return <ErrorState message={error} onRetry={fetchReports} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Financial Statements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Certified double-entry Profit & Loss, balance sheet telemetry, and agings from the general ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
            Print Statement
          </Button>
          <Button variant="teal" size="sm" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Selection Tabs & Date Range Filter */}
      <Card className="p-4 bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {[
              { id: 'pnl', label: 'Profit & Loss Statement' },
              { id: 'balance', label: 'Balance Sheet Summary' },
              { id: 'receivables', label: 'Accounts Receivable (Aging)' },
              { id: 'payables', label: 'Accounts Payable' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-teal-700 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Reporting Period:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Statement Content */}
      {activeTab === 'pnl' && (
        <Card className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold tracking-tight">Statement of Profit & Loss</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                For the period {startDate} to {endDate}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400">Net Profit</span>
              <div
                className={`text-xl font-bold ${
                  Number(reportData?.net_profit || 0) >= 0 ? 'text-teal-400' : 'text-rose-400'
                }`}
              >
                ₹{Number(reportData?.net_profit || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 text-xs text-slate-700">
            {/* Revenue Section */}
            <div>
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 font-bold text-slate-900 text-sm">
                <span>1. OPERATING REVENUE</span>
                <span className="text-emerald-700">
                  ₹{Number(reportData?.total_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="divide-y divide-slate-100 mt-2">
                <div className="py-2 flex justify-between">
                  <span>Gross Sales & Invoiced Services</span>
                  <span className="font-semibold text-slate-800">
                    ₹{Number(reportData?.total_revenue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="py-2 flex justify-between text-slate-500">
                  <span>Other Miscellaneous Operating Income</span>
                  <span>₹0.00</span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 font-bold text-slate-900 text-sm">
                <span>2. OPERATING & ADMINISTRATIVE EXPENDITURES</span>
                <span className="text-rose-700">
                  ₹{Number(reportData?.total_expenses || 0).toLocaleString()}
                </span>
              </div>
              <div className="divide-y divide-slate-100 mt-2">
                <div className="py-2 flex justify-between">
                  <span>General Operating Disbursements & Utilities</span>
                  <span className="font-semibold text-slate-800">
                    ₹{Number(reportData?.total_expenses || 0).toLocaleString()}
                  </span>
                </div>
                <div className="py-2 flex justify-between text-slate-500">
                  <span>Cost of Materials & Procurement</span>
                  <span>₹{Number(reportData?.cost_of_goods || 0).toLocaleString()}</span>
                </div>
                <div className="py-2 flex justify-between text-slate-500">
                  <span>Statutory Tax & Compliance Remittances</span>
                  <span>₹{Number(reportData?.tax_paid || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Total */}
            <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center font-bold text-base text-slate-900 bg-slate-50 p-4 rounded-lg">
              <span>NET OPERATING SURPLUS / (DEFICIT)</span>
              <span
                className={
                  Number(reportData?.net_profit || 0) >= 0 ? 'text-teal-700' : 'text-rose-600'
                }
              >
                ₹{Number(reportData?.net_profit || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Balance Summary */}
      {activeTab === 'balance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto text-xs">
          {/* Assets */}
          <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b-2 border-teal-600 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">CURRENT ASSETS</h3>
              <span className="font-bold text-teal-700 text-sm">
                ₹{Number(reportData?.total_assets || 0).toLocaleString()}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="py-2.5 flex justify-between">
                <span>Bank Vaults & Cash in Hand</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(reportData?.cash_balance || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Accounts Receivable (Customer Balances)</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(reportData?.accounts_receivable || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Current Inventory Value (At Cost)</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(reportData?.inventory_value || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Liabilities */}
          <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b-2 border-rose-600 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">CURRENT LIABILITIES</h3>
              <span className="font-bold text-rose-700 text-sm">
                ₹{Number(reportData?.total_liabilities || 0).toLocaleString()}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="py-2.5 flex justify-between">
                <span>Accounts Payable (Vendor Balances)</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(reportData?.accounts_payable || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Accrued Payroll & Statutory Dues</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(reportData?.accrued_payroll || 0).toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Output Tax Payable (GST/VAT)</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(reportData?.tax_payable || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Receivables & Payables Agings */}
      {(activeTab === 'receivables' || activeTab === 'payables') && (
        <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">
              {activeTab === 'receivables' ? 'Customer Outstanding Receivables' : 'Vendor Accounts Payable'}
            </h3>
            <span className="text-xs text-slate-500">
              Outstanding Total:{' '}
              <span className="font-bold text-slate-900">
                ₹{Number(reportData?.total_outstanding || 0).toLocaleString()}
              </span>
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Entity Name</th>
                  <th className="py-3 px-4">Reference / Contact</th>
                  <th className="py-3 px-4 text-center">Unsettled Documents</th>
                  <th className="py-3 px-4 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(reportData?.items || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No outstanding records in this category.
                    </td>
                  </tr>
                ) : (
                  (reportData?.items || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-slate-500">{item.contact || 'Direct Account'}</td>
                      <td className="py-3 px-4 text-center font-medium">{item.count || 1}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{Number(item.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinanceReports;
