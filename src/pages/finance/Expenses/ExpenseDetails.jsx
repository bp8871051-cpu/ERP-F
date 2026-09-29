import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt,
  CheckCircle,
  CreditCard,
  Building,
  Calendar,
  Clock,
  Printer,
  Share2,
  FileText,
  AlertCircle,
  User,
} from 'lucide-react';
import financeService from '../../../services/financeService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getExpense(id);
      setExpense(data);
    } catch (err) {
      console.error('Error fetching expense:', err);
      setError('Unable to load expense voucher details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, [id]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await financeService.approveExpense(id);
      fetchExpense();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      setActionLoading(true);
      await financeService.payExpense(id);
      fetchExpense();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to disburse payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton type="card" />;
  if (error || !expense) return <ErrorState message={error} onRetry={fetchExpense} />;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">PAID & POSTED</Badge>;
      case 'approved':
        return <Badge variant="teal">APPROVED</Badge>;
      case 'submitted':
        return <Badge variant="warning">SUBMITTED</Badge>;
      case 'rejected':
        return <Badge variant="danger">REJECTED</Badge>;
      case 'draft':
      default:
        return <Badge variant="neutral">DRAFT</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/app/finance/expenses"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Expense #{expense.expense_number}
              </h1>
              {getStatusBadge(expense.status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged on {expense.expense_date} by {expense.creator?.name || 'Finance Department'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Voucher
          </Button>

          {(expense.status === 'draft' || expense.status === 'submitted') && (
            <Button
              variant="teal"
              size="sm"
              icon={CheckCircle}
              loading={actionLoading}
              onClick={handleApprove}
            >
              Approve Expense
            </Button>
          )}

          {expense.status === 'approved' && (
            <Button
              variant="teal"
              size="sm"
              icon={CreditCard}
              loading={actionLoading}
              onClick={handlePay}
            >
              Disburse Payment
            </Button>
          )}
        </div>
      </div>

      {/* Main Voucher Card */}
      <Card className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        {/* Voucher Header Banner */}
        <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm tracking-wider uppercase">
              <Receipt className="w-4 h-4" />
              <span>Official Disbursement Voucher</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              General Ledger Reference: {expense.account?.account_name || 'Corporate Treasury Vault'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Total Disbursement</span>
            <div className="text-2xl font-bold text-teal-400">
              ₹{Number(expense.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-b border-slate-100 pb-6">
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Category & Classification
              </span>
              <p className="font-semibold text-slate-900 text-sm">{expense.category?.name || 'Operating Expense'}</p>
              <p className="text-slate-500 mt-0.5">{expense.category?.code || 'EXP-GEN'}</p>
            </div>

            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Vendor / Payee Entity
              </span>
              <p className="font-semibold text-slate-900 text-sm">
                {expense.vendor?.name || 'Direct Enterprise Payee'}
              </p>
              <p className="text-slate-500 mt-0.5">{expense.vendor?.company_name || 'Operational Vendor'}</p>
            </div>

            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Payment Method & Ref
              </span>
              <p className="font-semibold text-slate-900 text-sm uppercase">
                {expense.payment_method?.replace('_', ' ')}
              </p>
              <p className="text-slate-500 mt-0.5">Ref: {expense.reference_number || 'N/A'}</p>
            </div>
          </div>

          {/* Description */}
          {expense.description && (
            <div className="text-xs bg-slate-50 p-4 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700 block mb-1">Business Purpose:</span>
              <p className="text-slate-600 leading-relaxed">{expense.description}</p>
            </div>
          )}

          {/* Financial Breakdown Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Item Breakdown</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 px-4 font-medium">Base Subtotal (Pre-tax)</td>
                  <td className="py-2.5 px-4 text-right font-medium">
                    ₹{Number(expense.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {Number(expense.discount) > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 text-emerald-600">Rebate / Applied Discount</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600">
                      -₹{Number(expense.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 px-4">Authoritative Tax ({expense.tax?.name || 'Standard Tax'})</td>
                  <td className="py-2.5 px-4 text-right">
                    ₹{Number(expense.tax_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-slate-50/80 font-bold text-slate-900 text-sm">
                  <td className="py-3 px-4">Final Ledger Total</td>
                  <td className="py-3 px-4 text-right text-teal-700">
                    ₹{Number(expense.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Workflow Status Timeline */}
          <div className="pt-4 border-t border-slate-100 text-xs">
            <h3 className="font-semibold text-slate-800 mb-3">Audit Trail & Approval Pipeline</h3>
            <div className="flex flex-wrap items-center gap-4 text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Submitted: {expense.expense_date}</span>
              </div>
              {expense.status === 'approved' || expense.status === 'paid' ? (
                <div className="flex items-center gap-2 text-teal-700 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Approved by Controller</span>
                </div>
              ) : null}
              {expense.status === 'paid' && (
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CreditCard className="w-4 h-4" />
                  <span>Settled & Posted to General Ledger</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExpenseDetails;
