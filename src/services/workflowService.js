import api from './api';

export const workflowService = {
  // Get all workflows with steps & requests metrics
  getWorkflows: async (params = {}) => {
    const res = await api.get('/workflows', { params });
    return res.data;
  },

  // Create new workflow
  createWorkflow: async (data) => {
    const res = await api.post('/workflows', data);
    return res.data;
  },

  // Update workflow
  updateWorkflow: async (id, data) => {
    const res = await api.put(`/workflows/${id}`, data);
    return res.data;
  },

  // Delete workflow
  deleteWorkflow: async (id) => {
    const res = await api.delete(`/workflows/${id}`);
    return res.data;
  },

  // Get approval requests list
  getRequests: async (params = {}) => {
    const res = await api.get('/workflow-requests', { params });
    return res.data;
  },

  // Create a new approval request
  createRequest: async (data) => {
    const res = await api.post('/workflow-requests', data);
    return res.data;
  },

  // Approve a request
  approve: async (id, comments = '') => {
    const res = await api.post(`/workflow-requests/${id}/approve`, { comments });
    return res.data;
  },

  // Reject a request
  reject: async (id, comments = '') => {
    const res = await api.post(`/workflow-requests/${id}/reject`, { comments });
    return res.data;
  },

  // Request changes on a request
  requestChanges: async (id, comments = '') => {
    const res = await api.post(`/workflow-requests/${id}/request-changes`, { comments });
    return res.data;
  },

  // Add comment to request
  addComment: async (id, comment) => {
    const res = await api.post(`/workflow-requests/${id}/comments`, { comment });
    return res.data;
  },
};

export default workflowService;
