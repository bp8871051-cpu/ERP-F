import React, { useState, useEffect } from 'react';
import { X, UserPlus, Building2, Users, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import crmService from '../../../services/crmService';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';

export const LeadConvertModal = ({ isOpen, onClose, onSuccess, lead }) => {
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_mode: 'existing', // 'existing' or 'new'
    customer_id: '',
    customer_name: '',
    create_deal: true,
    deal_name: '',
    pipeline_id: '',
    stage_id: '',
    deal_value: 0,
    expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (isOpen && lead) {
      loadData();
      setFormData({
        customer_mode: lead.customer_id ? 'existing' : 'new',
        customer_id: lead.customer_id || '',
        customer_name: lead.company_name || lead.name,
        create_deal: true,
        deal_name: `${lead.name} - Deal`,
        pipeline_id: '',
        stage_id: '',
        deal_value: Number(lead.expected_value || lead.budget || 0),
        expected_close_date: lead.expected_close_date || new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
      });
    }
  }, [isOpen, lead]);

  const loadData = async () => {
    try {
      const [custRes, pipeRes] = await Promise.all([
        salesService.getCustomers({ per_page: 100 }),
        crmService.getPipelines(),
      ]);
      const cPayload = custRes.data?.data || custRes.data;
      setExistingCustomers(cPayload.data || cPayload || []);
      const pipeList = pipeRes.data || [];
      setPipelines(pipeList);
      if (pipeList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          pipeline_id: pipeList[0].id,
          stage_id: pipeList[0].stages?.[0]?.id || '',
        }));
      }
    } catch (err) {
      console.error('Error loading conversion options:', err);
    }
  };

  const handlePipelineChange = (e) => {
    const pipeId = e.target.value;
    const selected = pipelines.find((p) => String(p.id) === String(pipeId));
    setFormData((prev) => ({
      ...prev,
      pipeline_id: pipeId,
      stage_id: selected?.stages?.[0]?.id || '',
    }));
  };

  const selectedPipeline = pipelines.find((p) => String(p.id) === String(formData.pipeline_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        customer_id: formData.customer_mode === 'existing' ? formData.customer_id : null,
        company_name: formData.customer_mode === 'new' ? formData.customer_name : null,
        create_deal: formData.create_deal,
        deal_name: formData.deal_name,
        pipeline_id: formData.pipeline_id,
        stage_id: formData.stage_id,
        deal_value: formData.deal_value,
        expected_close_date: formData.expected_close_date,
      };

      const res = await crmService.convertLead(lead.id, payload);
      alert('Lead successfully converted into Contact, Customer, and Deal!');
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error converting lead.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">Convert Lead to Customer & Deal</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Conversion Flow Diagram Banner */}
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center justify-between text-teal-900">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs">{lead.name}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-600" />
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-teal-700" />
              <span>Contact</span>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-600" />
            <div className="flex items-center gap-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5 text-teal-700" />
              <span>Customer</span>
            </div>
            <ArrowRight className="w-4 h-4 text-teal-600" />
            <div className="flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-teal-700" />
              <span>Deal</span>
            </div>
          </div>

          {/* Section: Customer Destination */}
          <div className="space-y-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            <label className="font-semibold text-slate-800 block text-xs">
              ERP Customer Linking (Prevents Duplication)
            </label>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cust_mode"
                  checked={formData.customer_mode === 'existing'}
                  onChange={() => setFormData({ ...formData, customer_mode: 'existing' })}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span>Link Existing Customer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cust_mode"
                  checked={formData.customer_mode === 'new'}
                  onChange={() => setFormData({ ...formData, customer_mode: 'new' })}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span>Create New Customer Record</span>
              </label>
            </div>

            {formData.customer_mode === 'existing' ? (
              <div>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="">-- Choose Existing ERP Customer --</option>
                  {existingCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company_name ? `(${c.company_name})` : ''} - {c.customer_code}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Company / Customer Name</label>
                <input
                  required
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Reliance Retail Ltd"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Section: Optional Deal Creation */}
          <div className="space-y-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.create_deal}
                onChange={(e) => setFormData({ ...formData, create_deal: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Create Deal in Pipeline</span>
            </label>

            {formData.create_deal && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-slate-600 block mb-1">Deal Title *</label>
                  <input
                    required
                    type="text"
                    value={formData.deal_name}
                    onChange={(e) => setFormData({ ...formData, deal_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Pipeline</label>
                    <select
                      value={formData.pipeline_id}
                      onChange={handlePipelineChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {pipelines.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Stage</label>
                    <select
                      value={formData.stage_id}
                      onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      {selectedPipeline?.stages?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.probability}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Deal Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.deal_value}
                      onChange={(e) => setFormData({ ...formData, deal_value: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Expected Close</label>
                    <input
                      type="date"
                      value={formData.expected_close_date}
                      onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Converting via DB Transaction...' : 'Convert Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadConvertModal;
