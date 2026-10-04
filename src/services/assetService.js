import api from './api';

export const assetService = {
  // Dashboard & Analytics
  getDashboardData: async () => {
    const response = await api.get('/assets/dashboard');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/assets/analytics');
    return response.data;
  },

  getLookups: async () => {
    const response = await api.get('/assets/lookups');
    return response.data;
  },

  // Assets Register
  getAssets: async (params = {}) => {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  getAssetDetails: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  createAsset: async (payload) => {
    const response = await api.post('/assets', payload);
    return response.data;
  },

  updateAsset: async (id, payload) => {
    const response = await api.put(`/assets/${id}`, payload);
    return response.data;
  },

  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  // Assignments
  getAssignments: async (params = {}) => {
    const response = await api.get('/assets/assignments', { params });
    return response.data;
  },

  assignAsset: async (id, payload) => {
    const response = await api.post(`/assets/${id}/assign`, payload);
    return response.data;
  },

  returnAsset: async (id, payload) => {
    const response = await api.post(`/assets/${id}/return`, payload);
    return response.data;
  },

  // Depreciation
  getDepreciation: async (params = {}) => {
    const response = await api.get('/assets/depreciation', { params });
    return response.data;
  },

  calculateDepreciation: async () => {
    const response = await api.post('/assets/depreciation/calculate');
    return response.data;
  },

  // Maintenance
  getMaintenance: async (params = {}) => {
    const response = await api.get('/assets/maintenance', { params });
    return response.data;
  },

  createMaintenanceTicket: async (payload) => {
    const response = await api.post('/assets/maintenance', payload);
    return response.data;
  },

  updateMaintenanceTicket: async (id, payload) => {
    const response = await api.put(`/assets/maintenance/${id}`, payload);
    return response.data;
  },

  // Disposals
  getDisposals: async (params = {}) => {
    const response = await api.get('/assets/disposals', { params });
    return response.data;
  },

  createDisposal: async (payload) => {
    const response = await api.post('/assets/disposals', payload);
    return response.data;
  },

  approveDisposal: async (id) => {
    const response = await api.post(`/assets/disposals/${id}/approve`);
    return response.data;
  },
};

export default assetService;
