import api from './api';

export const crmService = {
  // 1. Dashboard
  getDashboardData: async () => {
    const response = await api.get('/v1/crm/dashboard');
    return response.data;
  },

  // 2. Contacts
  getContacts: async (params = {}) => {
    const response = await api.get('/v1/crm/contacts', { params });
    return response.data;
  },
  getContact: async (id) => {
    const response = await api.get(`/v1/crm/contacts/${id}`);
    return response.data;
  },
  createContact: async (data) => {
    const response = await api.post('/v1/crm/contacts', data);
    return response.data;
  },
  updateContact: async (id, data) => {
    const response = await api.put(`/v1/crm/contacts/${id}`, data);
    return response.data;
  },
  deleteContact: async (id) => {
    const response = await api.delete(`/v1/crm/contacts/${id}`);
    return response.data;
  },
  importContacts: async (formData) => {
    const response = await api.post('/v1/crm/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  exportContacts: async (params = {}) => {
    const response = await api.get('/v1/crm/contacts/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // 3. Leads
  getLeads: async (params = {}) => {
    const response = await api.get('/v1/crm/leads', { params });
    return response.data;
  },
  getLead: async (id) => {
    const response = await api.get(`/v1/crm/leads/${id}`);
    return response.data;
  },
  createLead: async (data) => {
    const response = await api.post('/v1/crm/leads', data);
    return response.data;
  },
  updateLead: async (id, data) => {
    const response = await api.put(`/v1/crm/leads/${id}`, data);
    return response.data;
  },
  deleteLead: async (id) => {
    const response = await api.delete(`/v1/crm/leads/${id}`);
    return response.data;
  },
  convertLead: async (id, data = {}) => {
    const response = await api.post(`/v1/crm/leads/${id}/convert`, data);
    return response.data;
  },
  scoreLead: async (id) => {
    const response = await api.post(`/v1/crm/leads/${id}/score`);
    return response.data;
  },
  exportLeads: async (params = {}) => {
    const response = await api.get('/v1/crm/leads/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
  getLeadSources: async () => {
    const response = await api.get('/v1/crm/lead-sources');
    return response.data;
  },

  // 4. Deals
  getDeals: async (params = {}) => {
    const response = await api.get('/v1/crm/deals', { params });
    return response.data;
  },
  getDeal: async (id) => {
    const response = await api.get(`/v1/crm/deals/${id}`);
    return response.data;
  },
  createDeal: async (data) => {
    const response = await api.post('/v1/crm/deals', data);
    return response.data;
  },
  updateDeal: async (id, data) => {
    const response = await api.put(`/v1/crm/deals/${id}`, data);
    return response.data;
  },
  deleteDeal: async (id) => {
    const response = await api.delete(`/v1/crm/deals/${id}`);
    return response.data;
  },
  updateDealStage: async (id, stage_id, notes = '') => {
    const response = await api.post(`/v1/crm/deals/${id}/stage`, { stage_id, notes });
    return response.data;
  },
  createSalesOrderFromDeal: async (id, data = {}) => {
    const response = await api.post(`/v1/crm/deals/${id}/create-sales-order`, data);
    return response.data;
  },
  exportDeals: async (params = {}) => {
    const response = await api.get('/v1/crm/deals/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // 5. Pipelines & Kanban
  getPipelines: async () => {
    const response = await api.get('/v1/crm/pipelines');
    return response.data;
  },
  createPipeline: async (data) => {
    const response = await api.post('/v1/crm/pipelines', data);
    return response.data;
  },
  updatePipeline: async (id, data) => {
    const response = await api.put(`/v1/crm/pipelines/${id}`, data);
    return response.data;
  },
  deletePipeline: async (id) => {
    const response = await api.delete(`/v1/crm/pipelines/${id}`);
    return response.data;
  },
  addPipelineStage: async (pipelineId, data) => {
    const response = await api.post(`/v1/crm/pipelines/${pipelineId}/stages`, data);
    return response.data;
  },
  reorderPipelineStages: async (pipelineId, stages) => {
    const response = await api.put(`/v1/crm/pipelines/${pipelineId}/stages/reorder`, { stages });
    return response.data;
  },
  updatePipelineStage: async (pipelineId, stageId, data) => {
    const response = await api.put(`/v1/crm/pipelines/${pipelineId}/stages/${stageId}`, data);
    return response.data;
  },
  deletePipelineStage: async (pipelineId, stageId) => {
    const response = await api.delete(`/v1/crm/pipelines/${pipelineId}/stages/${stageId}`);
    return response.data;
  },

  // 6. Campaigns
  getCampaigns: async (params = {}) => {
    const response = await api.get('/v1/crm/campaigns', { params });
    return response.data;
  },
  getCampaign: async (id) => {
    const response = await api.get(`/v1/crm/campaigns/${id}`);
    return response.data;
  },
  createCampaign: async (data) => {
    const response = await api.post('/v1/crm/campaigns', data);
    return response.data;
  },
  updateCampaign: async (id, data) => {
    const response = await api.put(`/v1/crm/campaigns/${id}`, data);
    return response.data;
  },
  deleteCampaign: async (id) => {
    const response = await api.delete(`/v1/crm/campaigns/${id}`);
    return response.data;
  },
  launchCampaign: async (id) => {
    const response = await api.post(`/v1/crm/campaigns/${id}/launch`);
    return response.data;
  },
  pauseCampaign: async (id) => {
    const response = await api.post(`/v1/crm/campaigns/${id}/pause`);
    return response.data;
  },
  updateCampaignAudience: async (id, data) => {
    const response = await api.post(`/v1/crm/campaigns/${id}/audience`, data);
    return response.data;
  },

  // 7. Customer Feedback
  getFeedbackDashboard: async () => {
    const response = await api.get('/v1/crm/feedback/dashboard');
    return response.data;
  },
  getFeedback: async (params = {}) => {
    const response = await api.get('/v1/crm/feedback', { params });
    return response.data;
  },
  getFeedbackItem: async (id) => {
    const response = await api.get(`/v1/crm/feedback/${id}`);
    return response.data;
  },
  createFeedback: async (data) => {
    const response = await api.post('/v1/crm/feedback', data);
    return response.data;
  },
  updateFeedback: async (id, data) => {
    const response = await api.put(`/v1/crm/feedback/${id}`, data);
    return response.data;
  },
  deleteFeedback: async (id) => {
    const response = await api.delete(`/v1/crm/feedback/${id}`);
    return response.data;
  },
  resolveFeedback: async (id, data) => {
    const response = await api.post(`/v1/crm/feedback/${id}/resolve`, data);
    return response.data;
  },

  // 8. Analytics & Customer Segmentation
  getAnalytics: async (params = {}) => {
    const response = await api.get('/v1/crm/analytics', { params });
    return response.data;
  },
  getCustomerAnalytics: async (params = {}) => {
    const response = await api.get('/v1/crm/analytics/customers', { params });
    return response.data;
  },
  evaluateSegments: async () => {
    const response = await api.post('/v1/crm/analytics/segments/evaluate');
    return response.data;
  },

  // 9. Centralized Activities
  getActivities: async (params = {}) => {
    const response = await api.get('/v1/crm/activities', { params });
    return response.data;
  },
  createActivity: async (data) => {
    const response = await api.post('/v1/crm/activities', data);
    return response.data;
  },
  updateActivity: async (id, data) => {
    const response = await api.put(`/v1/crm/activities/${id}`, data);
    return response.data;
  },
  deleteActivity: async (id) => {
    const response = await api.delete(`/v1/crm/activities/${id}`);
    return response.data;
  },
  logCall: async (data) => {
    const response = await api.post('/v1/crm/activities/calls', data);
    return response.data;
  },
  scheduleMeeting: async (data) => {
    const response = await api.post('/v1/crm/activities/meetings', data);
    return response.data;
  },
  logEmail: async (data) => {
    const response = await api.post('/v1/crm/activities/emails', data);
    return response.data;
  },
  addNote: async (data) => {
    const response = await api.post('/v1/crm/activities/notes', data);
    return response.data;
  },

  // 10. Tasks
  getTasks: async (params = {}) => {
    const response = await api.get('/v1/crm/tasks', { params });
    return response.data;
  },
  createTask: async (data) => {
    const response = await api.post('/v1/crm/tasks', data);
    return response.data;
  },
  updateTask: async (id, data) => {
    const response = await api.put(`/v1/crm/tasks/${id}`, data);
    return response.data;
  },
  deleteTask: async (id) => {
    const response = await api.delete(`/v1/crm/tasks/${id}`);
    return response.data;
  },

  // 11. Search
  searchCrm: async (query) => {
    const response = await api.get('/v1/crm/search', { params: { query } });
    return response.data;
  },
};

export default crmService;
