import api from './api';

export const brandService = {
  getBrands: async (params = {}) => {
    const response = await api.get('/v1/inventory/brands', { params });
    return response.data;
  },

  getBrand: async (id) => {
    const response = await api.get(`/v1/inventory/brands/${id}`);
    return response.data;
  },

  createBrand: async (data) => {
    const response = await api.post('/v1/inventory/brands', data);
    return response.data;
  },

  updateBrand: async (id, data) => {
    const response = await api.put(`/v1/inventory/brands/${id}`, data);
    return response.data;
  },

  deleteBrand: async (id) => {
    const response = await api.delete(`/v1/inventory/brands/${id}`);
    return response.data;
  },
};

export default brandService;
