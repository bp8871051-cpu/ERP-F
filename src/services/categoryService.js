import api from './api';

export const categoryService = {
  getCategories: async (params = {}) => {
    const response = await api.get('/v1/inventory/categories', { params });
    return response.data;
  },

  getCategory: async (id) => {
    const response = await api.get(`/v1/inventory/categories/${id}`);
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/v1/inventory/categories', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/v1/inventory/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/v1/inventory/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
