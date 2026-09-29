import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/v1/inventory/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/v1/inventory/products/${id}`);
    return response.data;
  },

  createProduct: async (data) => {
    const response = await api.post('/v1/inventory/products', data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.put(`/v1/inventory/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/v1/inventory/products/${id}`);
    return response.data;
  },

  duplicateProduct: async (id) => {
    const response = await api.post(`/v1/inventory/products/${id}/duplicate`);
    return response.data;
  },

  getStockHistory: async (id, params = {}) => {
    const response = await api.get(`/v1/inventory/products/${id}/stock-history`, { params });
    return response.data;
  },

  exportProductsUrl: () => {
    return `${api.defaults.baseURL || ''}/v1/inventory/products/export`;
  },
};

export default productService;
