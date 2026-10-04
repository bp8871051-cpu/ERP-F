import api from './api';

export const posService = {
  // Dashboard
  getDashboardData: async () => {
    const response = await api.get('/pos/dashboard');
    return response.data;
  },

  // Products
  getProducts: async (params = {}) => {
    const response = await api.get('/pos/products', { params });
    return response.data;
  },

  // Secure calculation
  calculateTotals: async (payload) => {
    const response = await api.post('/pos/calculate', payload);
    return response.data;
  },

  // Orders
  getOrders: async (params = {}) => {
    const response = await api.get('/pos/orders', { params });
    return response.data;
  },

  getOrderDetails: async (id) => {
    const response = await api.get(`/pos/orders/${id}`);
    return response.data;
  },

  checkout: async (payload) => {
    const response = await api.post('/pos/orders', payload);
    return response.data;
  },

  processRefund: async (orderId, payload) => {
    const response = await api.post(`/pos/orders/${orderId}/refund`, payload);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.post(`/pos/orders/${orderId}/cancel`);
    return response.data;
  },

  // Barcode & QR Code
  getBarcodes: async () => {
    const response = await api.get('/pos/barcodes');
    return response.data;
  },

  generateBarcode: async (payload) => {
    const response = await api.post('/pos/barcodes/generate', payload);
    return response.data;
  },

  generateQr: async (payload) => {
    const response = await api.post('/pos/qr/generate', payload);
    return response.data;
  },

  // Print settings
  getSettings: async () => {
    const response = await api.get('/pos/settings');
    return response.data;
  },

  updateSettings: async (payload) => {
    const response = await api.put('/pos/settings', payload);
    return response.data;
  },

  // Register session
  getCurrentRegisterSession: async () => {
    const response = await api.get('/pos/register/current');
    return response.data;
  },

  openRegisterSession: async (payload) => {
    const response = await api.post('/pos/register/open', payload);
    return response.data;
  },

  closeRegisterSession: async (id, payload) => {
    const response = await api.post(`/pos/register/${id}/close`, payload);
    return response.data;
  },
};

export default posService;
