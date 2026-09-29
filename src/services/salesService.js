import api from './api';

export const salesService = {
  // Dashboard & Analytics
  getDashboard: () => api.get('/sales/dashboard'),
  getAnalytics: (params) => api.get('/sales/analytics', { params }),

  // Customers
  getCustomers: (params) => api.get('/sales/customers', { params }),
  getCustomer: (id) => api.get(`/sales/customers/${id}`),
  createCustomer: (data) => api.post('/sales/customers', data),
  updateCustomer: (id, data) => api.put(`/sales/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/sales/customers/${id}`),

  // Sales Orders
  getOrders: (params) => api.get('/sales/orders', { params }),
  getOrder: (id) => api.get(`/sales/orders/${id}`),
  createOrder: (data) => api.post('/sales/orders', data),
  updateOrder: (id, data) => api.put(`/sales/orders/${id}`, data),
  confirmOrder: (id) => api.post(`/sales/orders/${id}/confirm`),
  cancelOrder: (id, reason) => api.post(`/sales/orders/${id}/cancel`, { reason }),
  convertOrderToInvoice: (id) => api.post(`/sales/orders/${id}/convert-to-invoice`),

  // Invoices
  getInvoices: (params) => api.get('/sales/invoices', { params }),
  getInvoice: (id) => api.get(`/sales/invoices/${id}`),
  createInvoice: (data) => api.post('/sales/invoices', data),
  updateInvoice: (id, data) => api.put(`/sales/invoices/${id}`, data),
  sendInvoice: (id) => api.post(`/sales/invoices/${id}/send`),
  recordPayment: (id, data) => api.post(`/sales/invoices/${id}/payment`, data),

  // Recurring Invoices
  getRecurringInvoices: (params) => api.get('/sales/recurring-invoices', { params }),
  createRecurringInvoice: (data) => api.post('/sales/recurring-invoices', data),
  updateRecurringInvoice: (id, data) => api.put(`/sales/recurring-invoices/${id}`, data),

  // Invoice Templates
  getInvoiceTemplates: () => api.get('/sales/invoice-templates'),
  createInvoiceTemplate: (data) => api.post('/sales/invoice-templates', data),
  updateInvoiceTemplate: (id, data) => api.put(`/sales/invoice-templates/${id}`, data),
  deleteInvoiceTemplate: (id) => api.delete(`/sales/invoice-templates/${id}`),

  // Quotes
  getQuotes: (params) => api.get('/sales/quotes', { params }),
  getQuote: (id) => api.get(`/sales/quotes/${id}`),
  createQuote: (data) => api.post('/sales/quotes', data),
  updateQuote: (id, data) => api.put(`/sales/quotes/${id}`, data),
  acceptQuote: (id) => api.post(`/sales/quotes/${id}/accept`),
  convertQuote: (id) => api.post(`/sales/quotes/${id}/convert`),

  // Credit Notes
  getCreditNotes: (params) => api.get('/sales/credit-notes', { params }),
  getCreditNote: (id) => api.get(`/sales/credit-notes/${id}`),
  createCreditNote: (data) => api.post('/sales/credit-notes', data),
  issueCreditNote: (id) => api.post(`/sales/credit-notes/${id}/issue`),

  // Cash Sales
  getCashSales: (params) => api.get('/sales/cash-sales', { params }),
  createCashSale: (data) => api.post('/sales/cash-sales', data),

  // Refunds
  getRefunds: (params) => api.get('/sales/refunds', { params }),
  createRefund: (data) => api.post('/sales/refunds', data),
  approveRefund: (id) => api.post(`/sales/refunds/${id}/approve`),
  processRefund: (id) => api.post(`/sales/refunds/${id}/process`),

  // Delivery Notes
  getDeliveryNotes: (params) => api.get('/sales/delivery-notes', { params }),
  getDeliveryNote: (id) => api.get(`/sales/delivery-notes/${id}`),
  createDeliveryNote: (data) => api.post('/sales/delivery-notes', data),
  dispatchDelivery: (id) => api.post(`/sales/delivery-notes/${id}/dispatch`),
  deliverDelivery: (id) => api.post(`/sales/delivery-notes/${id}/deliver`),
};

export default salesService;
