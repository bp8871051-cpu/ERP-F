import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Building2,
  Calendar,
  AlertTriangle,
  Package,
} from 'lucide-react';
import purchaseService from '../../../services/purchaseService';
import productService from '../../../services/productService';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const PurchaseReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [vendorId, setVendorId] = useState('');
  const [purchaseId, setPurchaseId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [modalItems, setModalItems] = useState([
    { product_id: '', quantity: 1, unit_cost: 0, tax: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [search, status]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getReturns({
        search: search || undefined,
        status: status || undefined,
      });
      const payload = res.data?.data || res.data;
      setReturns(payload.data || payload || []);
    } catch (err) {
      console.error('Failed to load purchase returns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    setShowModal(true);
    try {
      const [vndRes, purRes, prodRes, wareRes] = await Promise.all([
        purchaseService.getVendors({ per_page: 50 }),
        purchaseService.getPurchases({ per_page: 50 }),
        productService.getProducts({ per_page: 100 }).catch(() => ({ data: [] })),
        warehouseService.getWarehouses({ per_page: 50 }).catch(() => ({ data: [] })),
      ]);
      setVendors(vndRes.data?.data?.data || vndRes.data?.data || []);
      setPurchases(purRes.data?.data?.data || purRes.data?.data || []);
      const pList = prodRes.data?.data || prodRes.data || [];
      setProducts(Array.isArray(pList) ? pList : (pList.data || []));
      const wList = wareRes.data?.data || wareRes.data || [];
      setWarehouses(Array.isArray(wList) ? wList : (wList.data || []));
    } catch (err) {
      console.error('Failed to load modal dependencies:', err);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this purchase return?')) {
      try {
        setActionLoadingId(id);
        await purchaseService.approveReturn(id);
        fetchReturns();
      } catch (err) {
        alert(err.response?.data?.message || 'Error approving return');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleComplete = async (id) => {
    if (
      window.confirm(
        'Complete this purchase return? This will deduct the returned stock from the warehouse via StockService and record a PURCHASE_RETURN_OUT movement.'
      )
    ) {
      try {
        setActionLoadingId(id);
        await purchaseService.completeReturn(id);
        alert('Purchase return completed! Stock decreased.');
        fetchReturns();
      } catch (err) {
        alert(err.response?.data?.message || 'Error completing return');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!vendorId || !reason) {
      alert('Please fill vendor and reason.');
      return;
    }

    try {
      setSubmitting(true);
      const validItems = modalItems.filter((i) => i.product_id && Number(i.quantity) > 0);
      const totalAmount = validItems.reduce((acc, i) => acc + Number(i.unit_cost) * Number(i.quantity), 0);

      await purchaseService.createReturn({
        vendor_id: vendorId,
        purchase_id: purchaseId || null,
        warehouse_id: warehouseId || null,
        return_date: returnDate,
        reason,
        subtotal: totalAmount,
        total: totalAmount,
        grand_total: totalAmount,
        items: validItems.map((i) => ({
          product_id: i.product_id,
          quantity: Number(i.quantity),
          unit_cost: Number(i.unit_cost),
          tax: Number(i.tax || 0),
          total: Number(i.unit_cost) * Number(i.quantity),
        })),
      });

      setShowModal(false);
      fetchReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating purchase return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-7 h-7 text-indigo-600" />
            Purchase Returns (Debit Notes)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Return damaged or non-conforming goods to suppliers. Deducts inventory stock and reduces payable balance.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenModal} className="gap-2 bg-indigo-600 text-white">
          <Plus className="w-4 h-4" /> Create Purchase Return
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : returns.length === 0 ? (
          <div className="py-16 text-center">
            <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 dark:text-white">No Purchase Returns Found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Return #</th>
                  <th className="px-5 py-3.5">Vendor</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5 text-right">Debit Total</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-mono font-bold text-indigo-600">{r.return_number}</td>
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {r.vendor?.name || 'Vendor'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{r.return_date || 'N/A'}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">{r.reason}</td>
                    <td className="px-5 py-4 text-right font-bold text-rose-600">
                      ₹{Number(r.total || r.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={r.status === 'completed' || r.status === 'returned' ? 'success' : 'neutral'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {r.status === 'requested' && (
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={actionLoadingId === r.id}
                            title="Approve Return"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {['requested', 'approved'].includes(r.status) && (
                          <button
                            onClick={() => handleComplete(r.id)}
                            disabled={actionLoadingId === r.id}
                            title="Complete Return (Deducts Stock)"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Create Purchase Return</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Vendor *</label>
                  <select
                    required
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Linked Purchase Bill</label>
                  <select
                    value={purchaseId}
                    onChange={(e) => setPurchaseId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="">Direct Return (No Bill)</option>
                    {purchases.map((pc) => (
                      <option key={pc.id} value={pc.id}>{pc.purchase_number}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Reason for Return *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Defective raw materials, expired batch"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Returned Products</span>
                {modalItems.map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={it.product_id}
                      onChange={(e) => {
                        const prod = products.find((p) => String(p.id) === e.target.value);
                        const n = [...modalItems];
                        n[idx].product_id = e.target.value;
                        if (prod) n[idx].unit_cost = Number(prod.purchase_price || prod.cost_price || 0);
                        setModalItems(n);
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-800"
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => {
                        const n = [...modalItems];
                        n[idx].quantity = e.target.value;
                        setModalItems(n);
                      }}
                      className="w-20 px-2 py-1.5 text-xs rounded border text-right"
                    />

                    <input
                      type="number"
                      placeholder="Cost ₹"
                      value={it.unit_cost}
                      onChange={(e) => {
                        const n = [...modalItems];
                        n[idx].unit_cost = e.target.value;
                        setModalItems(n);
                      }}
                      className="w-24 px-2 py-1.5 text-xs rounded border text-right"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitting} className="bg-indigo-600 text-white">
                  {submitting ? 'Creating...' : 'Record Return'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseReturnList;
