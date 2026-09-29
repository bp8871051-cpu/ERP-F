import api from './api';

export const procurementService = {
  getDashboardData: async () => {
    const response = await api.get('/procurement/dashboard');
    return response.data;
  },
  getPurchaseOrders: async (params) => {
    const response = await api.get('/procurement/purchase-orders', { params });
    return response.data;
  },
};

export default procurementService;
