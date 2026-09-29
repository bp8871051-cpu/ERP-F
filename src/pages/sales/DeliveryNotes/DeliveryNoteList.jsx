import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Building2,
  Calendar,
  Send,
  Package,
  MapPin,
  Clock,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import warehouseService from '../../../services/warehouseService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

export const DeliveryNoteList = () => {
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [driver, setDriver] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDeliveryNotes();
  }, [search, status]);

  const fetchDeliveryNotes = async () => {
    try {
      setLoading(true);
      const res = await salesService.getDeliveryNotes({
        search: search || undefined,
        status: status || undefined,
      });
      const payload = res.data?.data || res.data;
      setDeliveryNotes(payload.data || payload || []);
    } catch (err) {
      console.error('Failed to load delivery notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    setShowModal(true);
    try {
      const [ordRes, wareRes] = await Promise.all([
        salesService.getOrders({ status: 'confirmed', per_page: 50 }),
        warehouseService.getWarehouses({ per_page: 50 }).catch(() => ({ data: [] })),
      ]);
      setOrders(ordRes.data?.data?.data || ordRes.data?.data || []);
      const wList = wareRes.data?.data || wareRes.data || [];
      setWarehouses(Array.isArray(wList) ? wList : (wList.data || []));
    } catch (err) {
      console.error('Failed to load modal dependencies:', err);
    }
  };

  const handleDispatch = async (id) => {
    if (window.confirm('Mark this delivery note as Dispatched in transit?')) {
      try {
        setActionLoadingId(id);
        await salesService.dispatchDelivery(id);
        fetchDeliveryNotes();
      } catch (err) {
        alert(err.response?.data?.message || 'Error dispatching delivery');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleDeliver = async (id) => {
    if (
      window.confirm(
        'Confirm delivery completion? This will permanently deduct reserved stock from the warehouse and create a stock movement record.'
      )
    ) {
      try {
        setActionLoadingId(id);
        await salesService.deliverDelivery(id);
        alert('Delivery confirmed! Inventory stock deducted successfully.');
        fetchDeliveryNotes();
      } catch (err) {
        alert(err.response?.data?.message || 'Error completing delivery');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert('Please select a confirmed Sales Order.');
      return;
    }

    const order = orders.find((o) => String(o.id) === String(selectedOrderId));

    try {
      setSubmitting(true);
      await salesService.createDeliveryNote({
        sales_order_id: selectedOrderId,
        customer_id: order?.customer_id,
        warehouse_id: selectedWarehouseId || order?.warehouse_id || null,
        delivery_date: deliveryDate,
        driver,
        vehicle,
        status: 'pending',
        items: (order?.items || []).map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          delivered_quantity: it.quantity,
        })),
      });
      setShowModal(false);
      fetchDeliveryNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating delivery note');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return <Badge variant="success">Delivered (Stock Deducted)</Badge>;
      case 'dispatched':
        return <Badge variant="info">In Transit / Dispatched</Badge>;
      case 'packed':
        return <Badge variant="warning">Packed</Badge>;
      default:
        return <Badge variant="neutral">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-7 h-7 text-indigo-600" />
            Delivery Notes & Fulfillment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch shipments and fulfill orders. Marking delivered permanently deducts reserved inventory.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenModal} className="gap-2 bg-indigo-600 text-white">
          <Plus className="w-4 h-4" /> Create Delivery Note
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : deliveryNotes.length === 0 ? (
          <div className="py-16 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No Delivery Notes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Delivery #</th>
                  <th className="px-5 py-3.5">Sales Order #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Driver / Vehicle</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {deliveryNotes.map((dn) => (
                  <tr key={dn.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-semibold text-indigo-600">{dn.delivery_number}</td>
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {dn.sales_order?.order_number || 'Direct'}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {dn.customer?.name || 'Customer'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{dn.delivery_date || 'N/A'}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {dn.driver || dn.vehicle ? `${dn.driver || ''} (${dn.vehicle || ''})` : '—'}
                    </td>
                    <td className="px-5 py-4 text-center">{getStatusBadge(dn.status)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {['pending', 'packed'].includes(dn.status) && (
                          <button
                            onClick={() => handleDispatch(dn.id)}
                            disabled={actionLoadingId === dn.id}
                            title="Dispatch Shipment"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {['pending', 'packed', 'dispatched'].includes(dn.status) && (
                          <button
                            onClick={() => handleDeliver(dn.id)}
                            disabled={actionLoadingId === dn.id}
                            title="Mark Delivered (Deducts Stock)"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <CheckCircle className="w-4 h-4" />
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Create Delivery Note</h3>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Sales Order *</label>
                <select
                  required
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                >
                  <option value="">Select Confirmed Order</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.order_number} ({o.customer?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Warehouse Depot</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                >
                  <option value="">Default Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh K."
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Vehicle #</label>
                  <input
                    type="text"
                    placeholder="e.g. GJ-01-AB-1234"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitting} className="bg-indigo-600 text-white">
                  {submitting ? 'Creating...' : 'Generate Delivery Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryNoteList;
