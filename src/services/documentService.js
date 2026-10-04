import api from './api';

export const documentService = {
  // Dashboard
  getDashboardData: async () => {
    const response = await api.get('/documents/dashboard');
    return response.data;
  },

  // Folders & Tree
  getFolders: async () => {
    const response = await api.get('/documents/folders');
    return response.data;
  },

  // Documents
  getDocuments: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  getDocumentDetails: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  createDocument: async (formData) => {
    const response = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDocument: async (id, payload) => {
    const response = await api.put(`/documents/${id}`, payload);
    return response.data;
  },

  deleteDocument: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Version Control
  uploadVersion: async (id, formData) => {
    const response = await api.post(`/documents/${id}/upload-version`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getVersions: async (id) => {
    const response = await api.get(`/documents/${id}/versions`);
    return response.data;
  },

  // Download
  getDownloadUrl: (id) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return `${base}/documents/${id}/download`;
  },

  // Sharing
  shareDocument: async (id, payload) => {
    const response = await api.post(`/documents/${id}/share`, payload);
    return response.data;
  },

  // Approvals & Workflow
  approveDocument: async (id, payload = {}) => {
    const response = await api.post(`/documents/${id}/approve`, payload);
    return response.data;
  },

  rejectDocument: async (id, payload = {}) => {
    const response = await api.post(`/documents/${id}/reject`, payload);
    return response.data;
  },

  requestChanges: async (id, payload = {}) => {
    const response = await api.post(`/documents/${id}/request-changes`, payload);
    return response.data;
  },

  // Policies & Manuals
  getPolicies: async (params = {}) => {
    const response = await api.get('/documents/policies', { params });
    return response.data;
  },

  createPolicy: async (payload) => {
    const response = await api.post('/documents/policies', payload);
    return response.data;
  },

  // Compliance
  getCompliance: async (params = {}) => {
    const response = await api.get('/documents/compliance', { params });
    return response.data;
  },

  getComplianceAlerts: async () => {
    const response = await api.get('/documents/compliance/alerts');
    return response.data;
  },

  createCompliance: async (payload) => {
    const response = await api.post('/documents/compliance', payload);
    return response.data;
  },

  // Workflows
  getWorkflows: async () => {
    const response = await api.get('/documents/workflows');
    return response.data;
  },

  createWorkflow: async (payload) => {
    const response = await api.post('/documents/workflows', payload);
    return response.data;
  },
};

export default documentService;
