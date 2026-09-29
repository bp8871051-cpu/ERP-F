import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Receipt,
  Building,
  CreditCard,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import financeService from '../../../services/financeService';
import api from '../../../services/api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export const ExpenseCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(true);

  // Metadata dropdowns
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [taxes, setTaxes] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    expense_number: `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    expense_date: new Date().toISOString().slice(0, 10),
    expense_category_id: '',
    vendor_id: '',
    description: '',
    amount: '',
    tax_id: '',
    discount: '0',
    payment_method: 'bank_transfer',
    reference_number: '',
    account_id: '',
    status: 'submitted',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setFetchingMeta(true);
        const [catRes, accRes, taxRes, venRes] = await Promise.all([
          financeService.getExpenseCategories(),
          financeService.getAccounts(),
          financeService.getTaxes(),
          api.get('/purchase/vendors').then((r) => r.data.data).catch(() => []),
        ]);
        setCategories(catRes || []);
        setAccounts(accRes || []);
        setTaxes(taxRes || []);
        setVendors(venRes || []);

        if (catRes && catRes.length > 0) {
          setFormData((prev) => ({ ...prev, expense_category_id: catRes[0].id }));
        }
        if (accRes && accRes.length > 0) {
          setFormData((prev) => ({ ...prev, account_id: accRes[0].id }));
        }
      } catch (err) {
        console.error('Failed to load expense form meta:', err);
      } finally {
        setFetchingMeta(false);
      }
    };
    loadMetadata();
  }, []);

  // Compute calculated amounts
  const subtotal = parseFloat(formData.amount) || 0;
  const discount = parseFloat(formData.discount) || 0;
  const selectedTax = taxes.find((t) => String(t.id) === String(formData.tax_id));
  const taxRate = selectedTax ? parseFloat(selectedTax.rate) : 0;
  const taxAmount = ((subtotal - discount) * taxRate) / 100;
  const grandTotal = Math.max(0, subtotal - discount + taxAmount);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.expense_number) errors.expense_number = 'Expense number is required.';
    if (!formData.expense_date) errors.expense_date = 'Date is required.';
    if (!formData.expense_category_id) errors.expense_category_id = 'Category is required.';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Valid amount is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      await financeService.createExpense({
        ...formData,
        amount: subtotal,
        discount: discount,
        tax_amount: taxAmount,
        total_amount: grandTotal,
      });
      navigate('/app/finance/expenses');
    } catch (err) {
      console.error('Failed to save expense:', err);
      alert(err.response?.data?.message || 'Error saving expense. Please verify the submitted values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            to="/app/finance/expenses"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Record Business Expense</h1>
            <p className="text-xs text-slate-500">
              Submit operational disbursement with tax calculations and ledger destination.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                Primary Expense Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Expense # */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Expense Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="expense_number"
                    value={formData.expense_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                  {formErrors.expense_number && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.expense_number}</p>
                  )}
                </div>

                {/* Expense Date */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Expense Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="expense_date"
                    value={formData.expense_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                  {formErrors.expense_date && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.expense_date}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Expense Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="expense_category_id"
                    value={formData.expense_category_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.budget ? `(Budget: ₹${Number(c.budget).toLocaleString()})` : ''}
                      </option>
                    ))}
                  </select>
                  {formErrors.expense_category_id && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.expense_category_id}</p>
                  )}
                </div>

                {/* Vendor / Payee */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Vendor / Payee (Optional)</label>
                  <select
                    name="vendor_id"
                    value={formData.vendor_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  >
                    <option value="">Select Vendor / External Entity</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.company_name || 'Vendor'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs">
                <label className="block font-medium text-slate-700 mb-1">Item Description / Purpose</label>
                <textarea
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. Monthly cloud hosting compute charges, travel ticket reimbursement..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                />
              </div>
            </Card>

            {/* Financial Calculations */}
            <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-600" />
                Line Item Financials & Authoritative Tax
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Amount */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Pre-tax Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white font-medium"
                  />
                  {formErrors.amount && <p className="text-[10px] text-rose-500 mt-1">{formErrors.amount}</p>}
                </div>

                {/* Applicable Tax */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tax Code / Bracket</label>
                  <select
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  >
                    <option value="">No Tax (0%)</option>
                    {taxes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.rate}% - {t.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Discount */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Real-time Calculation Summary Box */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-₹{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Calculated Tax ({taxRate}%):</span>
                  <span className="font-semibold text-slate-800">₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-teal-700">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Method & Destination Account */}
          <div className="space-y-6">
            <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-600" />
                Settlement & Ledger
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  >
                    <option value="draft">Draft (Saved only)</option>
                    <option value="submitted">Submitted (Awaiting Approval)</option>
                    <option value="approved">Approved (Ready for Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Disbursement Account / Vault</label>
                  <select
                    name="account_id"
                    value={formData.account_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name} (₹{Number(acc.current_balance || 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash in Hand</option>
                    <option value="card">Corporate Card</option>
                    <option value="upi">UPI / Instant Pay</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Reference / UTR</label>
                  <input
                    type="text"
                    name="reference_number"
                    placeholder="e.g. TXN987654321"
                    value={formData.reference_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Audit Notes</label>
                  <textarea
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Optional internal justification..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="teal"
                className="w-full"
                loading={loading}
                icon={Save}
              >
                Save & Post Expense
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseCreate;
