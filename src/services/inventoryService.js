import api from './api';

export const inventoryService = {
  // 1. Dashboard Comprehensive Payload
  getDashboardData: async (params = {}) => {
    try {
      const response = await api.get('/v1/inventory/dashboard', { params });
      return response.data;
    } catch {
      const fallback = await api.get('/inventory/dashboard', { params });
      return fallback.data;
    }
  },

  // 2. Individual Sub-endpoints
  getSummary: async () => {
    const res = await api.get('/v1/inventory/summary');
    return res.data;
  },

  getMovement: async (params = {}) => {
    const res = await api.get('/v1/inventory/movement', { params });
    return res.data;
  },

  getValueTrend: async () => {
    const res = await api.get('/v1/inventory/value-trend');
    return res.data;
  },

  getCategoryDistribution: async () => {
    const res = await api.get('/v1/inventory/category-distribution');
    return res.data;
  },

  getTopProducts: async () => {
    const res = await api.get('/v1/inventory/top-products');
    return res.data;
  },

  getLowStock: async () => {
    const res = await api.get('/v1/inventory/low-stock');
    return res.data;
  },

  getWarehouses: async () => {
    const res = await api.get('/v1/inventory/warehouses');
    return res.data;
  },

  getSuppliers: async () => {
    const res = await api.get('/v1/inventory/suppliers');
    return res.data;
  },

  getForecast: async () => {
    const res = await api.get('/v1/inventory/forecast');
    return res.data;
  },

  getReorderRecommendations: async () => {
    const res = await api.get('/v1/inventory/reorder-recommendations');
    return res.data;
  },

  getActivities: async () => {
    const res = await api.get('/v1/inventory/activities');
    return res.data;
  },

  getPurchaseImpact: async () => {
    const res = await api.get('/v1/inventory/purchase-impact');
    return res.data;
  },

  getSalesImpact: async () => {
    const res = await api.get('/v1/inventory/sales-impact');
    return res.data;
  },

  getReports: async () => {
    const res = await api.get('/v1/inventory/reports');
    return res.data;
  },

  // 3. Stock Mutations
  addStock: async (data) => {
    const res = await api.post('/v1/inventory/add-stock', data);
    return res.data;
  },

  adjustStock: async (data) => {
    const res = await api.post('/v1/inventory/stock-adjustment', data);
    return res.data;
  },

  transferStock: async (data) => {
    const res = await api.post('/v1/inventory/stock-transfer', data);
    return res.data;
  },

  // 4. Export CSV
  exportInventory: async (type = 'stock_summary') => {
    const response = await api.post(
      '/v1/inventory/export',
      { type },
      { responseType: 'blob' }
    );
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory_${type}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Standard product helpers
  getProducts: async (params = {}) => {
    const response = await api.get('/v1/inventory/products', { params });
    return response.data;
  },
};

export default inventoryService;
