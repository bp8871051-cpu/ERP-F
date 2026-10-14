import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Star, Building2, Users, Briefcase } from 'lucide-react';
import crmService from '../../../services/crmService';
import salesService from '../../../services/salesService';
import Button from '../../../components/ui/Button';
import SearchableSelect from '../../../components/ui/SearchableSelect';

export const FeedbackModal = ({ isOpen, onClose, onSuccess, feedback = null }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    contact_id: '',
    deal_id: '',
    rating: 5,
    category: 'Product',
    feedback_text: '',
    status: 'new',
  });

  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
      if (feedback) {
        setFormData({
          customer_id: feedback.customer_id || '',
          contact_id: feedback.contact_id || '',
          deal_id: feedback.deal_id || '',
          rating: feedback.rating || 5,
          category: feedback.category || 'Product',
          feedback_text: feedback.feedback_text || '',
          status: feedback.status || 'new',
        });
      } else {
        setFormData({
          customer_id: '',
          contact_id: '',
          deal_id: '',
          rating: 5,
          category: 'Product',
          feedback_text: '',
          status: 'new',
        });
      }
    }
  }, [isOpen, feedback]);

  const loadDependencies = async () => {
    try {
      const [custRes, contRes] = await Promise.all([
        salesService.getCustomers({ per_page: 100 }),
        crmService.getContacts({ per_page: 100 }),
      ]);
      const cPayload = custRes.data?.data || custRes.data;
      setCustomers(cPayload.data || cPayload || []);
      const contPayload = contRes.data?.data || contRes.data;
      setContacts(contPayload.data || contPayload || []);
    } catch (err) {
      console.error('Error loading feedback dependencies:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      alert('Please select a customer for this feedback.');
      return;
    }
    try {
      setSubmitting(true);
      if (feedback?.id) {
        await crmService.updateFeedback(feedback.id, formData);
      } else {
        await crmService.createFeedback(formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 my-8 !overflow-visible">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {feedback ? 'Edit Customer Feedback' : 'Record Customer Feedback'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs !overflow-visible">
          <div className="z-30 relative">
            <label className="font-semibold text-slate-700 block mb-1">Customer Account *</label>
            <SearchableSelect
              options={[
                { value: '', label: '-- Choose Customer --' },
                ...customers.map((c) => ({
                  value: String(c.id),
                  label: `${c.name} ${c.company_name ? `(${c.company_name})` : ''}`
                }))
              ]}
              value={String(formData.customer_id)}
              onChange={(val) => setFormData({ ...formData, customer_id: val })}
              placeholder="-- Choose Customer --"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 z-20 relative">
            <div className="z-20 relative">
              <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
              <SearchableSelect
                options={[
                  { value: '', label: '-- Optional Contact --' },
                  ...contacts.map((ct) => ({
                    value: String(ct.id),
                    label: `${ct.first_name} ${ct.last_name}`
                  }))
                ]}
                value={String(formData.contact_id)}
                onChange={(val) => setFormData({ ...formData, contact_id: val })}
                placeholder="-- Optional Contact --"
              />
            </div>

            <div className="z-10 relative">
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <SearchableSelect
                options={[
                  { value: 'Product', label: 'Product' },
                  { value: 'Service', label: 'Service' },
                  { value: 'Support', label: 'Support' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'Delivery', label: 'Delivery' },
                  { value: 'Billing', label: 'Billing' },
                  { value: 'Other', label: 'Other' }
                ]}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                placeholder="Category"
                searchable={false}
              />
            </div>
          </div>

          {/* Interactive Star Rating */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Rating (1 to 5 Stars) *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 cursor-pointer hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= formData.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">
                {formData.rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Customer Review / Feedback *</label>
            <textarea
              required
              rows="4"
              placeholder="What did the client mention about feature satisfaction, onboarding, or issue resolution?"
              value={formData.feedback_text}
              onChange={(e) => setFormData({ ...formData, feedback_text: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
