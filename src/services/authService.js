import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data?.token) {
      localStorage.setItem('erp_token', response.data.token);
      localStorage.setItem('erp_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      localStorage.removeItem('erp_company_id');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('/change-password', data);
    return response.data;
  },

  getCompanies: async () => {
    const response = await api.get('/companies');
    return response.data;
  }
};

export default authService;
