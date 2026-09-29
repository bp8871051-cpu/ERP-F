import api from './api';

export const supportService = {
  getDashboardData: async () => {
    const response = await api.get('/support/dashboard');
    return response.data;
  },
  getTickets: async (params) => {
    const response = await api.get('/support/tickets', { params });
    return response.data;
  }
};

export default supportService;
