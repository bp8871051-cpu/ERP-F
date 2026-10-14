import React, { useState, useEffect } from 'react';
import { X, Briefcase, Plus, Trash2, Building2, Users, DollarSign, Calendar, Layers } from 'lucide-react';
import crmService from '../../../services/crmService';
import salesService from '../../../services/salesService';
import productService from '../../../services/productService';
import Button from '../../../components/ui/Button';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const DealModal = ({ isOpen, onClose, onSuccess, deal = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    customer_id: '',
    contact_id: '',
    pipeline_id: '',
    stage_id: '',
    currency: 'INR',
    probability: 50,
    expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    notes: '',
  });

  const [items, setItems] = useState([
    { product_id: '', product_name: '', quantity: 1, unit_price: 50000, discount_percentage: 0, tax_percentage: 18 },
  ]);

  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      if (deal) {
        setFormData({
          name: deal.name || '',
          customer_id: deal.customer_id || '',
          contact_id: deal.contact_id || '',
          pipeline_id: deal.pipeline_id || '',
          stage_id: deal.stage_id || '',
          currency: deal.currency || 'INR',
          probability: deal.probability || 50,
          expected_close_date: deal.expected_close_date || '',
          notes: deal.notes || '',
        });
        if (deal.deal_items?.length) {
          setItems(
            deal.deal_items.map((i) => ({
              product_id: i.product_id || '',
              product_name: i.product_name || '',
              quantity: i.quantity || 1,
              unit_price: i.unit_price || 0,
              discount_percentage: i.discount_percentage || 0,
              tax_percentage: i.tax_percentage || 18,
            }))
          );
        }
      } else {
        setFormData({
          name: '',
          customer_id: '',
          contact_id: '',
          pipeline_id: '',
          stage_id: '',
          currency: 'INR',
          probability: 50,
          expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
          notes: '',
        });
        setItems([
          { product_id: '', product_name: 'Enterprise Cloud License', quantity: 1, unit_price: 250000, discount_percentage: 10, tax_percentage: 18 },
        ]);
      }
    }
  }, [isOpen, deal]);

  const loadDependencies = async () => {
    try {
      const [custRes, contRes, pipeRes, prodRes] = await Promise.all([
        salesService.getCustomers({ per_page: 100 }),
        crmService.getContacts({ per_page: 100 }),
        crmService.getPipelines(),
        productService.getProducts({ per_page: 100 }),
      ]);
      const cPayload = custRes.data?.data || custRes.data;
      setCustomers(cPayload.data || cPayload || []);
      const contPayload = contRes.data?.data || contRes.data;
      setContacts(contPayload.data || contPayload || []);
      const payload = pipeRes.data?.data || pipeRes.data;
      const pipeList = payload?.all_pipelines || (Array.isArray(payload) ? payload : []);
      setPipelines(pipeList);
      if (!deal && pipeList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          pipeline_id: pipeList[0].id,
          stage_id: pipeList[0].stages?.[0]?.id || '',
          probability: pipeList[0].stages?.[0]?.probability || 50,
        }));
      }
      const prodPayload = prodRes.data?.data || prodRes.data;
      setProducts(prodPayload.data || prodPayload || []);
    } catch (err) {
      console.error('Failed to load deal dependencies:', err);
    }
  };

  const handlePipelineChange = (e) => {
    const pipeId = e.target.value;
    const selected = pipelines.find((p) => String(p.id) === String(pipeId));
    setFormData((prev) => ({
      ...prev,
      pipeline_id: pipeId,
      stage_id: selected?.stages?.[0]?.id || '',
      probability: selected?.stages?.[0]?.probability || prev.probability,
    }));
  };

  const handleStageChange = (e) => {
    const stageId = e.target.value;
    const selectedPipeline = pipelines.find((p) => String(p.id) === String(formData.pipeline_id));
    const selectedStage = selectedPipeline?.stages?.find((s) => String(s.id) === String(stageId));
    setFormData((prev) => ({
      ...prev,
      stage_id: stageId,
      probability: selectedStage ? selectedStage.probability : prev.probability,
    }));
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { product_id: '', product_name: '', quantity: 1, unit_price: 10000, discount_percentage: 0, tax_percentage: 18 },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      if (field === 'product_id') {
        const p = products.find((prod) => String(prod.id) === String(value));
        if (p) {
          copy[index].product_name = p.name;
          copy[index].unit_price = Number(p.price || p.sale_price || 0);
        }
      }
      return copy;
    });
  };

  // Preview calculations (server calculates authoritative values)
  const calculateTotal = () => {
    return items.reduce((acc, item) => {
      const subtotal = Number(item.quantity || 1) * Number(item.unit_price || 0);
      const discount = subtotal * (Number(item.discount_percentage || 0) / 100);
      const taxable = subtotal - discount;
      const tax = taxable * (Number(item.tax_percentage || 0) / 100);
      return acc + taxable + tax;
    }, 0);
  };

  const totalValue = calculateTotal();
  const expectedRevenue = totalValue * (Number(formData.probability || 0) / 100);

  const selectedPipeline = pipelines.find((p) => String(p.id) === String(formData.pipeline_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      alert('Please select a customer for the deal.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        items,
      };
      if (deal?.id) {
        await crmService.updateDeal(deal.id, payload);
      } else {
        await crmService.createDeal(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving deal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 my-8 !overflow-visible">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {deal ? 'Edit Deal Opportunity' : 'Create Pipeline Deal'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs !overflow-visible">
          {/* Section: Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Deal Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Enterprise ERP Cloud Migration"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Currency</label>
              <SearchableSelect
                options={[
                  { value: 'INR', label: 'INR (₹)' },
                  { value: 'USD', label: 'USD ($)' }
                ]}
                value={formData.currency}
                onChange={(val) => setFormData({ ...formData, currency: val })}
                placeholder="Currency"
                searchable={false}
              />
            </div>
          </div>

          {/* Section: Customer & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-100">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Customer Account *
              </label>
              <SearchableSelect
                options={[
                  { value: '', label: '-- Select Existing ERP Customer --' },
                  ...customers.map((c) => ({
                    value: String(c.id),
                    label: `${c.name} ${c.company_name ? `(${c.company_name})` : ''} - ${c.customer_code}`
                  }))
                ]}
                value={String(formData.customer_id)}
                onChange={(val) => setFormData({ ...formData, customer_id: val })}
                placeholder="-- Select Existing ERP Customer --"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                Key Contact Person
              </label>
              <SearchableSelect
                options={[
                  { value: '', label: '-- Select Linked Contact --' },
                  ...contacts.map((ct) => ({
                    value: String(ct.id),
                    label: `${ct.first_name} ${ct.last_name} (${ct.company_name || 'Individual'})`
                  }))
                ]}
                value={String(formData.contact_id)}
                onChange={(val) => setFormData({ ...formData, contact_id: val })}
                placeholder="-- Select Linked Contact --"
              />
            </div>
          </div>

          {/* Section: Pipeline & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-teal-600" /> Pipeline
              </label>
              <SearchableSelect
                options={pipelines.map((p) => ({ value: String(p.id), label: p.name }))}
                value={String(formData.pipeline_id)}
                onChange={(val) => handlePipelineChange({ target: { value: val } })}
                placeholder="Pipeline"
                searchable={false}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Current Stage</label>
              <SearchableSelect
                options={selectedPipeline?.stages?.map((s) => ({
                  value: String(s.id),
                  label: `${s.name} (${s.probability}%)`
                })) || []}
                value={String(formData.stage_id)}
                onChange={(val) => handleStageChange({ target: { value: val } })}
                placeholder="Current Stage"
                searchable={false}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Expected Close</label>
              <input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section: Products / Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-600" />
                Line Items & Products Calculation
              </span>
              <Button variant="secondary" size="xs" icon={Plus} type="button" onClick={handleAddItem}>
                Add Item
              </Button>
            </div>

            <div className="border border-slate-200 rounded-xl !overflow-visible">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Product / Service</th>
                    <th className="py-2.5 px-2 w-20">Qty</th>
                    <th className="py-2.5 px-2 w-28">Unit Price</th>
                    <th className="py-2.5 px-2 w-20">Disc %</th>
                    <th className="py-2.5 px-2 w-20">Tax %</th>
                    <th className="py-2.5 px-3 w-28 text-right">Subtotal</th>
                    <th className="py-2.5 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => {
                    const lineSub = Number(it.quantity || 1) * Number(it.unit_price || 0);
                    const lineDisc = lineSub * (Number(it.discount_percentage || 0) / 100);
                    const lineTax = (lineSub - lineDisc) * (Number(it.tax_percentage || 0) / 100);
                    const lineTotal = lineSub - lineDisc + lineTax;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <div className="space-y-1">
                            {products.length > 0 && (
                              <div className="mb-1">
                                <SearchableSelect
                                  options={[
                                    { value: '', label: '-- Choose Existing ERP Product --' },
                                    ...products.map((p) => ({
                                      value: String(p.id),
                                      label: `${p.name} (₹${p.price || p.sale_price || 0})`
                                    }))
                                  ]}
                                  value={String(it.product_id)}
                                  onChange={(val) => handleItemChange(idx, 'product_id', val)}
                                  placeholder="-- Choose Existing ERP Product --"
                                />
                              </div>
                            )}
                            <input
                              type="text"
                              required
                              placeholder="Product or service description"
                              value={it.product_name}
                              onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                              className="w-full p-1.5 rounded border border-slate-200 text-xs"
                            />
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full p-1.5 rounded border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={it.unit_price}
                            onChange={(e) => handleItemChange(idx, 'unit_price', Number(e.target.value))}
                            className="w-full p-1.5 rounded border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={it.discount_percentage}
                            onChange={(e) => handleItemChange(idx, 'discount_percentage', Number(e.target.value))}
                            className="w-full p-1.5 rounded border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={it.tax_percentage}
                            onChange={(e) => handleItemChange(idx, 'tax_percentage', Number(e.target.value))}
                            className="w-full p-1.5 rounded border border-slate-200 text-xs"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-slate-800">
                          ₹{Math.round(lineTotal).toLocaleString()}
                        </td>
                        <td className="p-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary Bar */}
            <div className="flex flex-col sm:flex-row items-end justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="text-[11px] text-slate-500">
                Authoritative calculations performed by Laravel DealService on save.
              </span>
              <div className="flex items-center gap-6 mt-2 sm:mt-0">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Total Deal Value</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{Math.round(totalValue).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Expected Revenue</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    ₹{Math.round(expectedRevenue).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Deal Notes</label>
            <textarea
              rows="2"
              placeholder="Key deliverables, contractual stipulations, renewal timelines..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Calculating & Saving...' : deal ? 'Update Deal' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealModal;
