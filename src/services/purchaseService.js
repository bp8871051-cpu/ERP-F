import api from './api';

export const purchaseService = {
  // Dashboard & Analytics
  getDashboard: () => api.get('/purchase/dashboard'),
  getAnalytics: (params) => api.get('/purchase/analytics', { params }),

  // Vendors
  getVendors: (params) => api.get('/purchase/vendors', { params }),
  getVendor: (id) => api.get(`/purchase/vendors/${id}`),
  createVendor: (data) => api.post('/purchase/vendors', data),
  updateVendor: (id, data) => api.put(`/purchase/vendors/${id}`, data),
  deleteVendor: (id) => api.delete(`/purchase/vendors/${id}`),

  // Purchase Orders
  getOrders: (params) => api.get('/purchase/orders', { params }),
  getOrder: (id) => api.get(`/purchase/orders/${id}`),
  createOrder: (data) => api.post('/purchase/orders', data),
  updateOrder: (id, data) => api.put(`/purchase/orders/${id}`, data),
  approveOrder: (id) => api.post(`/purchase/orders/${id}/approve`),
  receiveOrder: (id, data) => api.post(`/purchase/orders/${id}/receive`, data),
  cancelOrder: (id, reason) => api.post(`/purchase/orders/${id}/cancel`, { reason }),

  // Purchases
  getPurchases: (params) => api.get('/purchase/purchases', { params }),
  getPurchase: (id) => api.get(`/purchase/purchases/${id}`),
  createPurchase: (data) => api.post('/purchase/purchases', data),
  recordPayment: (id, data) => api.post(`/purchase/purchases/${id}/payment`, data),

  // Purchase Returns
  getReturns: (params) => api.get('/purchase/returns', { params }),
  createReturn: (data) => api.post('/purchase/returns', data),
  approveReturn: (id) => api.post(`/purchase/returns/${id}/approve`),
  completeReturn: (id) => api.post(`/purchase/returns/${id}/complete`),
};

export default purchaseService;
