import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Building2,
  Calendar,
  Save,
  AlertCircle,
  Clock,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import productService from '../../../services/productService';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

export const InvoiceCreate = () => {
  const navigate = useNavigate();

  // References
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [customerId, setCustomerId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [salesOrderId, setSalesOrderId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [roundOff, setRoundOff] = useState(0);

  // Items
  const [items, setItems] = useState([
    {
      product_id: '',
      quantity: 1,
      unit_price: 0,
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
      setLoadingInitial(true);
      const [custRes, wareRes, prodRes, orderRes] = await Promise.all([
        salesService.getCustomers({ per_page: 100 }),
        warehouseService.getWarehouses({ per_page: 100 }).catch(() => ({ data: [] })),
        productService.getProducts({ per_page: 150 }).catch(() => ({ data: [] })),
        salesService.getOrders({ per_page: 100 }).catch(() => ({ data: [] })),
      ]);

      const custData = custRes.data?.data?.data || custRes.data?.data || custRes.data || [];
      setCustomers(custData);
      if (custData.length > 0) setCustomerId(custData[0].id);

      const wareData = wareRes.data?.data || wareRes.data || wareRes || [];
      const wareList = Array.isArray(wareData) ? wareData : (wareData.data || []);
      setWarehouses(wareList);

      const prodData = prodRes.data?.data || prodRes.data || prodRes || [];
      const pList = Array.isArray(prodData) ? prodData : (prodData.data || []);
      setProductsList(pList);

      const orderData = orderRes.data?.data?.data || orderRes.data?.data || orderRes.data || [];
      setSalesOrders(orderData);
    } catch (err) {
      console.error('Failed to load prerequisites:', err);
    } finally {
      setLoadingInitial(false);
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
        unit_price: price,
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
    const price = Number(newItems[index].unit_price) || 0;
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
        unit_price: 0,
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
    const price = Number(it.unit_price) || 0;
    return acc + qty * price;
  }, 0);

  const calculatedDiscount = items.reduce((acc, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unit_price) || 0;
    const discPercent = Number(it.discount) || 0;
    return acc + (qty * price * discPercent) / 100;
  }, 0);

  const calculatedTax = items.reduce((acc, it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.unit_price) || 0;
    const disc = (qty * price * (Number(it.discount) || 0)) / 100;
    const taxPercent = Number(it.tax) || 0;
    return acc + ((qty * price - disc) * taxPercent) / 100;
  }, 0);

  const grandTotal = Math.max(
    0,
    calculatedSubtotal - calculatedDiscount + calculatedTax + Number(shippingFee || 0) + Number(roundOff || 0)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerId) {
      setErrorMessage('Please select a customer.');
      return;
    }

    const validItems = items.filter((it) => it.product_id && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      setErrorMessage('Please add at least one line item with valid product and quantity.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customer_id: customerId,
        warehouse_id: warehouseId || null,
        sales_order_id: salesOrderId || null,
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        shipping: Number(shippingFee) || 0,
        round_off: Number(roundOff) || 0,
        items: validItems.map((it) => ({
          product_id: it.product_id,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
          discount: Number(it.discount) || 0,
          tax: Number(it.tax) || 0,
          subtotal: Number(it.subtotal),
        })),
      };

      const res = await salesService.createInvoice(payload);
      const newInvoiceId = res.data?.data?.id;
      if (newInvoiceId) {
        navigate(`/app/sales/invoices/${newInvoiceId}`);
      } else {
        navigate('/app/sales/invoices');
      }
    } catch (err) {
      console.error('Failed to create invoice:', err);
      setErrorMessage(err.response?.data?.message || 'Error generating sales invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/sales/invoices')}
            className="p-2 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              Create Sales Invoice
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Issue a standard GST tax invoice for accounting and accounts receivable.
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
            Invoice Particulars
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Customer *
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
                    {c.customer_code ? `[${c.customer_code}] ` : ''}{c.name} {c.company_name ? `(${c.company_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Linked Sales Order
              </label>
              <select
                value={salesOrderId}
                onChange={(e) => setSalesOrderId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Direct Invoice (No Order)</option>
                {salesOrders.map((so) => (
                  <option key={so.id} value={so.id}>
                    {so.order_number} ({so.customer?.name || 'Customer'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Warehouse / Depot
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Default Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Invoice Line Items */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Invoice Items
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
                  <th className="px-3 py-2.5 w-32 text-right">Unit Price (₹) *</th>
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
                        value={it.unit_price}
                        onChange={(e) => handleItemPropertyChange(idx, 'unit_price', e.target.value)}
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

          {/* Totals Breakdown */}
          <div className="flex justify-end mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2.5">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Subtotal</span>
                <span>₹{calculatedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Total Discount</span>
                <span className="text-emerald-600">-₹{calculatedDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Total Tax (GST)</span>
                <span>₹{calculatedTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300">
                <span>Shipping</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="w-24 px-2 py-1 text-xs text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300">
                <span>Round Off</span>
                <input
                  type="number"
                  step="0.01"
                  value={roundOff}
                  onChange={(e) => setRoundOff(e.target.value)}
                  className="w-24 px-2 py-1 text-xs text-right rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/app/sales/invoices')}
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
            {submitting ? 'Generating Invoice...' : 'Generate Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceCreate;
