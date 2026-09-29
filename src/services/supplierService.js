import api from './api';

export const supplierService = {
  getSuppliers: async (params = {}) => {
    const response = await api.get('/v1/inventory/suppliers', { params });
    return response.data;
  },

  getSupplier: async (id) => {
    const response = await api.get(`/v1/inventory/suppliers/${id}`);
    return response.data;
  },

  createSupplier: async (data) => {
    const response = await api.post('/v1/inventory/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id, data) => {
    const response = await api.put(`/v1/inventory/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id) => {
    const response = await api.delete(`/v1/inventory/suppliers/${id}`);
    return response.data;
  },
};

export default supplierService;
