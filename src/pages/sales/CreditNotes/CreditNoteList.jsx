import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileMinus,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Building2,
  Calendar,
  AlertCircle,
  Package,
} from 'lucide-react';
import salesService from '../../../services/salesService';
import productService from '../../../services/productService';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const CreditNoteList = () => {
  const navigate = useNavigate();
  const [creditNotes, setCreditNotes] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [returnToInventory, setReturnToInventory] = useState(true);
  const [modalItems, setModalItems] = useState([
    { product_id: '', quantity: 1, amount: 0, tax: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchCreditNotes();
  }, [search, status, page]);

  const fetchCreditNotes = async () => {
    try {
      setLoading(true);
      const res = await salesService.getCreditNotes({
        search: search || undefined,
        status: status || undefined,
        page,
        per_page: 15,
      });
      const payload = res.data?.data || res.data;
      setCreditNotes(payload.data || payload || []);
      setMeta({
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || (payload.data ? payload.data.length : 0),
      });
    } catch (err) {
      console.error('Failed to load credit notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    setShowModal(true);
    try {
      const [custRes, invRes, prodRes] = await Promise.all([
        salesService.getCustomers({ per_page: 100 }),
        salesService.getInvoices({ per_page: 100 }),
        productService.getProducts({ per_page: 100 }).catch(() => ({ data: [] })),
      ]);
      setCustomers(custRes.data?.data?.data || custRes.data?.data || []);
      setInvoices(invRes.data?.data?.data || invRes.data?.data || []);
      const pList = prodRes.data?.data || prodRes.data || [];
      setProducts(Array.isArray(pList) ? pList : (pList.data || []));
    } catch (err) {
      console.error('Failed to load modal data:', err);
    }
  };

  const handleIssueCreditNote = async (id) => {
    if (window.confirm('Issue this credit note? This will reduce customer receivable balance and process stock return.')) {
      try {
        setActionLoadingId(id);
        await salesService.issueCreditNote(id);
        fetchCreditNotes();
      } catch (err) {
        alert(err.response?.data?.message || 'Error issuing credit note');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !reason) {
      alert('Please fill customer and reason.');
      return;
    }

    try {
      setSubmitting(true);
      const validItems = modalItems.filter((i) => i.product_id && Number(i.quantity) > 0);
      const totalAmount = validItems.reduce((acc, i) => acc + Number(i.amount) * Number(i.quantity), 0);
      const totalTax = validItems.reduce((acc, i) => acc + (Number(i.amount) * Number(i.quantity) * Number(i.tax || 0)) / 100, 0);

      await salesService.createCreditNote({
        customer_id: customerId,
        invoice_id: invoiceId || null,
        credit_note_date: creditNoteDate,
        reason,
        return_to_inventory: returnToInventory,
        subtotal: totalAmount,
        tax: totalTax,
        total: totalAmount + totalTax,
        items: validItems.map((i) => ({
          product_id: i.product_id,
          quantity: Number(i.quantity),
          amount: Number(i.amount),
          tax: Number(i.tax || 0),
          total: Number(i.amount) * Number(i.quantity),
        })),
      });

      setShowModal(false);
      fetchCreditNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating credit note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileMinus className="w-7 h-7 text-indigo-600" />
            Credit Notes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Issue sales credit adjustments, process return-in stock movements, and reduce customer receivable.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="teal"
            onClick={handleOpenCreateModal}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Issue Credit Note
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 !overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search credit note #, customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="relative z-10">
            <SearchableSelect
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'issued', label: 'Issued' },
                { value: 'applied', label: 'Applied' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              placeholder="All Statuses"
              searchable={false}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="p-8">
            <LoadingSkeleton count={6} />
          </div>
        ) : creditNotes.length === 0 ? (
          <div className="py-16 text-center">
            <FileMinus className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">No Credit Notes Found</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Create a credit note for customer returns or price adjustments.</p>
            <Button variant="teal" onClick={handleOpenCreateModal}>
              Create Credit Note
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Credit Note #</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5 text-right">Credit Total</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {creditNotes.map((cn) => (
                  <tr key={cn.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-semibold text-indigo-600">{cn.credit_note_number}</td>
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {cn.customer?.name || 'Customer'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{cn.date || cn.credit_note_date || 'N/A'}</td>
                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {cn.reason || 'General sales return'}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-rose-600">
                      ₹{Number(cn.total || cn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={cn.status === 'issued' || cn.status === 'applied' ? 'success' : 'neutral'}>
                        {cn.status || 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {cn.status === 'draft' && (
                        <button
                          onClick={() => handleIssueCreditNote(cn.id)}
                          disabled={actionLoadingId === cn.id}
                          title="Issue Credit Note"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] !overflow-visible">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Credit Note</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer *</label>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'Select Customer' },
                      ...customers.map((c) => ({ value: String(c.id), label: c.name }))
                    ]}
                    value={String(customerId)}
                    onChange={(val) => setCustomerId(val)}
                    placeholder="Select Customer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Invoice (Optional)</label>
                  <SearchableSelect
                    options={[
                      { value: '', label: 'No Invoice' },
                      ...invoices.map((inv) => ({ value: String(inv.id), label: inv.invoice_number }))
                    ]}
                    value={String(invoiceId)}
                    onChange={(val) => setInvoiceId(val)}
                    placeholder="Select Invoice"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Defective merchandise returned, price discrepancy"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="returnStock"
                  checked={returnToInventory}
                  onChange={(e) => setReturnToInventory(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <label htmlFor="returnStock" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Return items to inventory stock (triggers RETURN_IN movement)
                </label>
              </div>

              {/* Items */}
              <div className="space-y-2 !overflow-visible">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Returned Line Items</span>
                {modalItems.map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <SearchableSelect
                        options={[
                          { value: '', label: 'Select Product' },
                          ...products.map((p) => ({ value: String(p.id), label: p.name }))
                        ]}
                        value={String(it.product_id)}
                        onChange={(val) => {
                          const prod = products.find((p) => String(p.id) === val);
                          const n = [...modalItems];
                          n[idx].product_id = val;
                          if (prod) n[idx].amount = Number(prod.selling_price || prod.price || 0);
                          setModalItems(n);
                        }}
                        placeholder="Select Product"
                      />
                    </div>

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
                      className="w-20 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 text-right"
                    />

                    <input
                      type="number"
                      placeholder="Rate ₹"
                      value={it.amount}
                      onChange={(e) => {
                        const n = [...modalItems];
                        n[idx].amount = e.target.value;
                        setModalItems(n);
                      }}
                      className="w-24 px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 text-right"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="teal" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Issue Credit Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditNoteList;
