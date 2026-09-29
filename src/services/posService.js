import api from './api';

export const posService = {
  getDashboardData: async () => {
    const response = await api.get('/pos/dashboard');
    return response.data;
  },
  getRecentOrders: async (params) => {
    const response = await api.get('/pos/orders', { params });
    return response.data;
  },
};

export default posService;
