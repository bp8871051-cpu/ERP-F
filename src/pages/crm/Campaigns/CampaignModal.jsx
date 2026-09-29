import React, { useState, useEffect } from 'react';
import { X, Tag, Calendar, DollarSign, Users, Layers, Mail } from 'lucide-react';
import crmService from '../../../services/crmService';
import Button from '../../../components/ui/Button';

export const CampaignModal = ({ isOpen, onClose, onSuccess, campaign = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Email',
    description: '',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    budget: '',
    status: 'draft',
    target_audience: {
      lead_sources: [],
      industry: '',
      min_lead_score: 30,
    },
  });

  const [leadSources, setLeadSources] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLeadSources();
      if (campaign) {
        setFormData({
          name: campaign.name || '',
          type: campaign.type || 'Email',
          description: campaign.description || '',
          start_date: campaign.start_date || '',
          end_date: campaign.end_date || '',
          budget: campaign.budget || '',
          status: campaign.status || 'draft',
          target_audience: campaign.target_audience || { lead_sources: [], industry: '', min_lead_score: 30 },
        });
      } else {
        setFormData({
          name: '',
          type: 'Email',
          description: '',
          start_date: new Date().toISOString().slice(0, 10),
          end_date: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
          budget: '50000',
          status: 'draft',
          target_audience: { lead_sources: [], industry: 'Technology', min_lead_score: 30 },
        });
      }
    }
  }, [isOpen, campaign]);

  const loadLeadSources = async () => {
    try {
      const res = await crmService.getLeadSources();
      setLeadSources(res.data || []);
    } catch (err) {
      console.error('Error loading lead sources:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (campaign?.id) {
        await crmService.updateCampaign(campaign.id, formData);
      } else {
        await crmService.createCampaign(formData);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {campaign ? 'Edit Marketing Campaign' : 'Create Marketing Campaign'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Campaign Name *</label>
            <input
              required
              type="text"
              placeholder="e.g. Q4 Enterprise Cloud Migration Webinar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Campaign Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="Email">Email Outreach</option>
                <option value="WhatsApp">WhatsApp Broadcast</option>
                <option value="SMS">SMS Campaign</option>
                <option value="Social Media">Social Media Ad</option>
                <option value="Event">Corporate Event / Webinar</option>
                <option value="Phone">Telemarketing / Cold Call</option>
                <option value="Other">Other Channel</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Budget Allocation (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="50000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="running">Running (Active)</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-2">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-600" /> Target Audience Filters
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Industry</label>
                <input
                  type="text"
                  placeholder="Technology, BFSI, Healthcare"
                  value={formData.target_audience?.industry || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_audience: { ...formData.target_audience, industry: e.target.value },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Min Lead Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.target_audience?.min_lead_score || 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_audience: {
                        ...formData.target_audience,
                        min_lead_score: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Campaign Description</label>
            <textarea
              rows="3"
              placeholder="Objectives, marketing hooks, offers, and conversion targets..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Saving Campaign...' : campaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignModal;
