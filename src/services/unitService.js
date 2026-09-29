import api from './api';

export const unitService = {
  getUnits: async (params = {}) => {
    const response = await api.get('/v1/inventory/units', { params });
    return response.data;
  },

  getUnit: async (id) => {
    const response = await api.get(`/v1/inventory/units/${id}`);
    return response.data;
  },

  createUnit: async (data) => {
    const response = await api.post('/v1/inventory/units', data);
    return response.data;
  },

  updateUnit: async (id, data) => {
    const response = await api.put(`/v1/inventory/units/${id}`, data);
    return response.data;
  },

  deleteUnit: async (id) => {
    const response = await api.delete(`/v1/inventory/units/${id}`);
    return response.data;
  },
};

export default unitService;
