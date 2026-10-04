import api from './api';

export const membershipService = {
  // Dashboard
  getDashboardData: async () => {
    const response = await api.get('/v1/membership/dashboard');
    return response.data?.data || response.data;
  },

  // Plans & Addons
  getPlans: async (params) => {
    const response = await api.get('/v1/membership/plans', { params });
    return response.data?.data || response.data;
  },
  createPlan: async (data) => {
    const response = await api.post('/v1/membership/plans', data);
    return response.data?.data || response.data;
  },
  updatePlan: async (id, data) => {
    const response = await api.put(`/v1/membership/plans/${id}`, data);
    return response.data?.data || response.data;
  },
  getAddons: async () => {
    const response = await api.get('/v1/membership/addons');
    return response.data?.data || response.data;
  },
  createAddon: async (data) => {
    const response = await api.post('/v1/membership/addons', data);
    return response.data?.data || response.data;
  },

  // Customer Memberships
  getMembers: async (params) => {
    const response = await api.get('/v1/membership/members', { params });
    return response.data?.data || response.data;
  },
  createMember: async (data) => {
    const response = await api.post('/v1/membership/members', data);
    return response.data?.data || response.data;
  },
  getMemberDetails: async (id) => {
    const response = await api.get(`/v1/membership/members/${id}`);
    return response.data?.data || response.data;
  },
  renewMember: async (id, data) => {
    const response = await api.post(`/v1/membership/members/${id}/renew`, data);
    return response.data?.data || response.data;
  },
  calculateProrata: async (id, newPlanId) => {
    const response = await api.get(`/v1/membership/members/${id}/calculate-prorata`, { params: { new_plan_id: newPlanId } });
    return response.data?.data || response.data;
  },
  switchPlan: async (id, newPlanId) => {
    const response = await api.post(`/v1/membership/members/${id}/switch-plan`, { new_plan_id: newPlanId });
    return response.data?.data || response.data;
  },
  cancelMember: async (id, reason) => {
    const response = await api.post(`/v1/membership/members/${id}/cancel`, { reason });
    return response.data?.data || response.data;
  },

  // Transactions
  getTransactions: async (params) => {
    const response = await api.get('/v1/membership/transactions', { params });
    return response.data?.data || response.data;
  },
};

export default membershipService;
