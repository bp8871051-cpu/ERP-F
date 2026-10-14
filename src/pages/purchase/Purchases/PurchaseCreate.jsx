import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ShoppingBag,
  Building2,
  Calendar,
  Save,
  AlertCircle,
} from 'lucide-react';
import purchaseService from '../../../services/purchaseService';
import productService from '../../../services/productService';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const PurchaseCreate = () => {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [vendorId, setVendorId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [shippingFee, setShippingFee] = useState(0);

  // Items
  const [items, setItems] = useState([
    {
      product_id: '',
      quantity: 1,
      unit_cost: 0,
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
      const [vndRes, wareRes, prodRes, poRes] = await Promise.all([
        purchaseService.getVendors({ per_page: 100 }),
        warehouseService.getWarehouses({ per_page: 50 }).catch(() => ({ data: [] })),
        productService.getProducts({ per_page: 150 }).catch(() => ({ data: [] })),
        purchaseService.getOrders({ per_page: 100 }).catch(() => ({ data: [] })),
      ]);

      const vData = vndRes.data?.data?.data || vndRes.data?.data || vndRes.data || [];
      setVendors(vData);
      if (vData.length > 0) setVendorId(vData[0].id);

      const wData = wareRes.data?.data || wareRes.data || [];
      const wList = Array.isArray(wData) ? wData : (wData.data || []);
      setWarehouses(wList);
      if (wList.length > 0) setWarehouseId(wList[0].id);

      const pData = prodRes.data?.data || prodRes.data || [];
      const pList = Array.isArray(pData) ? pData : (pData.data || []);
      setProductsList(pList);

      const poData = poRes.data?.data?.data || poRes.data?.data || [];
      setPurchaseOrders(poData);
    } catch (err) {
      console.error('Failed to load prerequisites:', err);
    }
  };

  const handleProductChange = (index, prodId) => {
    const prod = productsList.find((p) => String(p.id) === String(prodId));
    const newItems = [...items];
    if (prod) {
      const cost = Number(prod.purchase_price || prod.cost_price || 0);
      newItems[index] = {
        ...newItems[index],
        product_id: prod.id,
        unit_cost: cost,
        subtotal: cost * (newItems[index].quantity || 1),
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
    const cost = Number(newItems[index].unit_cost) || 0;
    const disc = Number(newItems[index].discount) || 0;
    const tax = Number(newItems[index].tax) || 0;

    const base = qty * cost;
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
        unit_cost: 0,
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

  const calculatedSubtotal = items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unit_cost) || 0), 0);
  const calculatedDiscount = items.reduce((acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.unit_cost) || 0) * (Number(it.discount) || 0)) / 100, 0);
  const calculatedTax = items.reduce((acc, it) => {
    const base = (Number(it.quantity) || 0) * (Number(it.unit_cost) || 0);
    const disc = (base * (Number(it.discount) || 0)) / 100;
    return acc + ((base - disc) * (Number(it.tax) || 0)) / 100;
  }, 0);
  const grandTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedTax + Number(shippingFee || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!vendorId) {
      setErrorMessage('Please select a supplier/vendor.');
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
        vendor_id: vendorId,
        warehouse_id: warehouseId || null,
        purchase_order_id: purchaseOrderId || null,
        vendor_invoice_number: vendorInvoiceNumber || null,
        invoice_date: invoiceDate,
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        tax: calculatedTax,
        shipping: Number(shippingFee) || 0,
        grand_total: grandTotal,
        items: validItems.map((it) => ({
          product_id: it.product_id,
          quantity: Number(it.quantity),
          unit_cost: Number(it.unit_cost),
          discount: Number(it.discount) || 0,
          tax: Number(it.tax) || 0,
          subtotal: Number(it.subtotal),
        })),
      };

      const res = await purchaseService.createPurchase(payload);
      const newPurchaseId = res.data?.data?.id;
      if (newPurchaseId) {
        navigate(`/app/purchase/purchases/${newPurchaseId}`);
      } else {
        navigate('/app/purchase/purchases');
      }
    } catch (err) {
      console.error('Failed to create purchase:', err);
      setErrorMessage(err.response?.data?.message || 'Error recording purchase receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/purchase/purchases')}
            className="p-2 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
              Record Purchase & Goods Receipt (GRN)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter supplier invoice particulars. Confirming receipt will increase warehouse inventory and create vendor payable.
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
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm !overflow-visible">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Vendor Invoice Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="z-30">
              <label className="block text-xs font-semibold mb-1">Vendor *</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'Select Vendor' },
                  ...vendors.map((v) => ({
                    value: String(v.id),
                    label: v.name
                  }))
                ]}
                value={String(vendorId)}
                onChange={(val) => setVendorId(val)}
                placeholder="Select Vendor"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Vendor Bill / Invoice #</label>
              <input
                type="text"
                placeholder="e.g. INV-9908"
                value={vendorInvoiceNumber}
                onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Invoice Date *</label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
              />
            </div>

            <div className="z-10">
              <label className="block text-xs font-semibold mb-1">Warehouse Depot</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'Default Warehouse' },
                  ...warehouses.map((w) => ({
                    value: String(w.id),
                    label: w.name
                  }))
                ]}
                value={String(warehouseId)}
                onChange={(val) => setWarehouseId(val)}
                placeholder="Default Warehouse"
              />
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm !overflow-visible">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Received Products
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addItemRow}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product Line
            </Button>
          </div>

          <div className="!overflow-visible">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-3 py-2.5 min-w-[240px]">Product *</th>
                  <th className="px-3 py-2.5 w-24 text-right">Qty *</th>
                  <th className="px-3 py-2.5 w-32 text-right">Cost Rate (₹) *</th>
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
                      <SearchableSelect
                        options={[
                          { value: '', label: 'Select Product' },
                          ...productsList.map((p) => ({
                            value: String(p.id),
                            label: p.name
                          }))
                        ]}
                        value={String(it.product_id)}
                        onChange={(val) => handleProductChange(idx, val)}
                        placeholder="Select Product"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min="1"
                        required
                        value={it.quantity}
                        onChange={(e) => handleItemPropertyChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-right rounded border border-slate-200 dark:border-slate-700"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={it.unit_cost}
                        onChange={(e) => handleItemPropertyChange(idx, 'unit_cost', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs text-right rounded border border-slate-200 dark:border-slate-700"
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
                        className="w-full px-2 py-1.5 text-xs text-right rounded border border-slate-200 dark:border-slate-700"
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
                        className="w-full px-2 py-1.5 text-xs text-right rounded border border-slate-200 dark:border-slate-700"
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
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{calculatedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="text-emerald-600">-₹{calculatedDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST):</span>
                <span>₹{calculatedTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Total Payable:</span>
                <span className="text-indigo-600">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/app/purchase/purchases')}>
            Cancel
          </Button>
          <Button type="submit" variant="teal" disabled={submitting}>
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Record Purchase'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseCreate;
