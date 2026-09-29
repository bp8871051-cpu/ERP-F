import api from './api';

export const callService = {
  getCalls: async (filter = 'all', search = '') => {
    const params = {};
    if (filter && filter !== 'all') params.filter = filter;
    if (search) params.search = search;
    const response = await api.get('/v1/calls', { params });
    return response.data;
  },

  initiateCall: async (data) => {
    const response = await api.post('/v1/calls', data);
    return response.data;
  },

  getCall: async (id) => {
    const response = await api.get(`/v1/calls/${id}`);
    return response.data;
  },

  updateCall: async (id, data) => {
    const response = await api.put(`/v1/calls/${id}`, data);
    return response.data;
  },
};

export default callService;
