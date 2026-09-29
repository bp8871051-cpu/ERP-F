import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileCheck,
  Building2,
  Calendar,
  Save,
  AlertCircle,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import productService from '../../../services/productService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

export const QuoteCreate = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [customerId, setCustomerId] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Quotation valid for 30 calendar days from the date of issue.');

  // Items
  const [items, setItems] = useState([
    {
      product_id: '',
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 0,
      subtotal: 0,
    },
  ]);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        salesService.getCustomers({ per_page: 100 }),
        productService.getProducts({ per_page: 150 }).catch(() => ({ data: [] })),
      ]);

      const custData = custRes.data?.data?.data || custRes.data?.data || custRes.data || [];
      setCustomers(custData);
      if (custData.length > 0) setCustomerId(custData[0].id);

      const prodData = prodRes.data?.data || prodRes.data || prodRes || [];
      const pList = Array.isArray(prodData) ? prodData : (prodData.data || []);
      setProductsList(pList);

      // Default valid until 30 days
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setValidUntil(d.toISOString().slice(0, 10));
    } catch (err) {
      console.error('Failed to load prerequisites:', err);
    }
  };

  const handleProductChange = (index, prodId) => {
    const prod = productsList.find((p) => String(p.id) === String(prodId));
    const newItems = [...items];
    if (prod) {
      const price = Number(prod.selling_price || prod.price || prod.mrp || 0);
      newItems[index] = {
        ...newItems[index],
        product_id: prod.id,
        price,
        subtotal: price * (newItems[index].quantity || 1),
      };
    } else {
      newItems[index].product_id = prodId;
    }
    setItems(newItems);
  };

  const handleItemPropertyChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    const qty = Number(newItems[index].quantity) || 0;
    const price = Number(newItems[index].price) || 0;
    const disc = Number(newItems[index].discount) || 0;
    const tax = Number(newItems[index].tax) || 0;

    const base = qty * price;
    const lineDiscount = (base * disc) / 100;
    const lineTax = ((base - lineDiscount) * tax) / 100;
    newItems[index].subtotal = Math.max(0, base - lineDiscount + lineTax);

    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        product_id: '',
        quantity: 1,
        price: 0,
        discount: 0,
        tax: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedSubtotal = items.reduce((acc, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price) || 0;
    return acc + qty * price;
  }, 0);

  const calculatedDiscount = items.reduce((acc, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price) || 0;
    const discPercent = Number(it.discount) || 0;
    return acc + (qty * price * discPercent) / 100;
  }, 0);

  const calculatedTax = items.reduce((acc, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.price) || 0;
    const disc = (qty * price * (Number(it.discount) || 0)) / 100;
    const taxPercent = Number(it.tax) || 0;
    return acc + ((qty * price - disc) * taxPercent) / 100;
  }, 0);

  const grandTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedTax);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerId) {
      setErrorMessage('Please select a customer.');
      return;
    }

    const validItems = items.filter((it) => it.product_id && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      setErrorMessage('Please add at least one valid product line.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customer_id: customerId,
        quote_date: quoteDate,
        valid_until: validUntil || null,
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        tax: calculatedTax,
        grand_total: grandTotal,
        notes,
        terms,
        items: validItems.map((it) => ({
          product_id: it.product_id,
          quantity: Number(it.quantity),
          price: Number(it.price),
          discount: Number(it.discount) || 0,
          tax: Number(it.tax) || 0,
          subtotal: Number(it.subtotal),
        })),
      };

      const res = await salesService.createQuote(payload);
      const newQuoteId = res.data?.data?.id;
      if (newQuoteId) {
        navigate(`/app/sales/quotes/${newQuoteId}`);
      } else {
        navigate('/app/sales/quotes');
      }
    } catch (err) {
      console.error('Failed to create quotation:', err);
      setErrorMessage(err.response?.data?.message || 'Error creating sales quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/sales/quotes')}
            className="p-2 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-indigo-600" />
              New Sales Quotation
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft formal pricing estimate. Once accepted, convert directly into an active sales order.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Quotation Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prospective Customer *
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company_name ? `(${c.company_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Quote Date *
              </label>
              <input
                type="date"
                required
                value={quoteDate}
                onChange={(e) => setQuoteDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* Quotation Line Items */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Quotation Line Items
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItemRow}
              className="gap-1.5 text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product Line
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2.5 min-w-[240px]">Product *</th>
                  <th className="px-3 py-2.5 w-24 text-right">Qty *</th>
                  <th className="px-3 py-2.5 w-32 text-right">Offered Rate (₹) *</th>
                  <th className="px-3 py-2.5 w-24 text-right">Disc %</th>
                  <th className="px-3 py-2.5 w-24 text-right">Tax %</th>
                  <th className="px-3 py-2.5 w-32 text-right">Subtotal (₹)</th>
                  <th className="px-3 py-2.5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2">
                      <select
                        required
                        value={it.product_id}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Select a Product</option>
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min="1"
                        required
                        value={it.quantity}
                        onChange={(e) => handleItemPropertyChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={it.price}
                        onChange={(e) => handleItemPropertyChange(idx, 'price', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={it.discount}
                        onChange={(e) => handleItemPropertyChange(idx, 'discount', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={it.tax}
                        onChange={(e) => handleItemPropertyChange(idx, 'tax', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900 dark:text-white text-xs">
                      ₹{Number(it.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length === 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Proposal Notes / Executive Summary
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terms of delivery, payment schedules, or custom specifications..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows="2"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span>₹{calculatedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Discount</span>
                <span className="text-emerald-600">-₹{calculatedDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Estimated Tax (GST)</span>
                <span>₹{calculatedTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Quotation Value</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/app/sales/quotes')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Creating Quote...' : 'Save Quotation'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuoteCreate;
