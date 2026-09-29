import api from './api';

export const dashboardService = {
  getOverview: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  },
};

export default dashboardService;
