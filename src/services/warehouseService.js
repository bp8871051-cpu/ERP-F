import api from './api';

export const warehouseService = {
  getWarehouses: async (params = {}) => {
    const response = await api.get('/v1/inventory/warehouses', { params });
    return response.data;
  },

  getWarehouse: async (id) => {
    const response = await api.get(`/v1/inventory/warehouses/${id}`);
    return response.data;
  },

  createWarehouse: async (data) => {
    const response = await api.post('/v1/inventory/warehouses', data);
    return response.data;
  },

  updateWarehouse: async (id, data) => {
    const response = await api.put(`/v1/inventory/warehouses/${id}`, data);
    return response.data;
  },

  deleteWarehouse: async (id) => {
    const response = await api.delete(`/v1/inventory/warehouses/${id}`);
    return response.data;
  },
};

export default warehouseService;
