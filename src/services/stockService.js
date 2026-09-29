import api from './api';

export const stockService = {
  // Stock Overview
  getStocks: async (params = {}) => {
    const response = await api.get('/v1/inventory/stock', { params });
    return response.data;
  },

  getStock: async (id) => {
    const response = await api.get(`/v1/inventory/stock/${id}`);
    return response.data;
  },

  // Stock Movements / Ledger
  getMovements: async (params = {}) => {
    const response = await api.get('/v1/inventory/stock/movements', { params });
    return response.data;
  },

  // Immediate Stock Actions
  addOpeningStock: async (data) => {
    const response = await api.post('/v1/inventory/stock/opening', data);
    return response.data;
  },

  receiveStock: async (data) => {
    const response = await api.post('/v1/inventory/stock/receive', data);
    return response.data;
  },

  issueStock: async (data) => {
    const response = await api.post('/v1/inventory/stock/issue', data);
    return response.data;
  },

  // Stock Adjustments
  getAdjustments: async (params = {}) => {
    const response = await api.get('/v1/inventory/stock/adjustments', { params });
    return response.data;
  },

  getAdjustment: async (id) => {
    const response = await api.get(`/v1/inventory/stock/adjustments/${id}`);
    return response.data;
  },

  createAdjustment: async (data) => {
    const response = await api.post('/v1/inventory/stock/adjustments', data);
    return response.data;
  },

  updateAdjustment: async (id, data) => {
    const response = await api.put(`/v1/inventory/stock/adjustments/${id}`, data);
    return response.data;
  },

  submitAdjustment: async (id) => {
    const response = await api.post(`/v1/inventory/stock/adjustments/${id}/submit`);
    return response.data;
  },

  approveAdjustment: async (id) => {
    const response = await api.post(`/v1/inventory/stock/adjustments/${id}/approve`);
    return response.data;
  },

  rejectAdjustment: async (id) => {
    const response = await api.post(`/v1/inventory/stock/adjustments/${id}/reject`);
    return response.data;
  },

  // Stock Transfers
  getTransfers: async (params = {}) => {
    const response = await api.get('/v1/inventory/stock/transfers', { params });
    return response.data;
  },

  getTransfer: async (id) => {
    const response = await api.get(`/v1/inventory/stock/transfers/${id}`);
    return response.data;
  },

  createTransfer: async (data) => {
    const response = await api.post('/v1/inventory/stock/transfers', data);
    return response.data;
  },

  dispatchTransfer: async (id) => {
    const response = await api.post(`/v1/inventory/stock/transfers/${id}/dispatch`);
    return response.data;
  },

  receiveTransfer: async (id) => {
    const response = await api.post(`/v1/inventory/stock/transfers/${id}/receive`);
    return response.data;
  },

  cancelTransfer: async (id) => {
    const response = await api.post(`/v1/inventory/stock/transfers/${id}/cancel`);
    return response.data;
  },
};

export default stockService;
