import api from './api';

export const financeService = {
  // Dashboard Overview
  getDashboard: async () => {
    const res = await api.get('/finance/dashboard');
    return res.data.data;
  },

  // Expenses
  getExpenses: async (params = {}) => {
    const res = await api.get('/finance/expenses', { params });
    return res.data.data;
  },

  getExpense: async (id) => {
    const res = await api.get(`/finance/expenses/${id}`);
    return res.data.data;
  },

  createExpense: async (data) => {
    const res = await api.post('/finance/expenses', data);
    return res.data;
  },

  updateExpense: async (id, data) => {
    const res = await api.put(`/finance/expenses/${id}`, data);
    return res.data;
  },

  deleteExpense: async (id) => {
    const res = await api.delete(`/finance/expenses/${id}`);
    return res.data;
  },

  approveExpense: async (id) => {
    const res = await api.post(`/finance/expenses/${id}/approve`);
    return res.data;
  },

  payExpense: async (id, data = {}) => {
    const res = await api.post(`/finance/expenses/${id}/pay`, data);
    return res.data;
  },

  // Expense Categories
  getExpenseCategories: async () => {
    const res = await api.get('/finance/expense-categories');
    return res.data.data;
  },

  createExpenseCategory: async (data) => {
    const res = await api.post('/finance/expense-categories', data);
    return res.data;
  },

  // Payments
  getPayments: async (params = {}) => {
    const res = await api.get('/finance/payments', { params });
    return res.data.data;
  },

  createPayment: async (data) => {
    const res = await api.post('/finance/payments', data);
    return res.data;
  },

  // Cashflow & Accounts
  getCashflow: async (params = {}) => {
    const res = await api.get('/finance/cashflow', { params });
    return res.data.data;
  },

  getAccounts: async () => {
    const res = await api.get('/finance/accounts');
    return res.data.data;
  },

  createAccount: async (data) => {
    const res = await api.post('/finance/accounts', data);
    return res.data;
  },

  // Budgeting
  getBudgets: async (params = {}) => {
    const res = await api.get('/finance/budgets', { params });
    return res.data.data;
  },

  createBudget: async (data) => {
    const res = await api.post('/finance/budgets', data);
    return res.data;
  },

  // Taxes
  getTaxes: async () => {
    const res = await api.get('/finance/taxes');
    return res.data.data;
  },

  createTax: async (data) => {
    const res = await api.post('/finance/taxes', data);
    return res.data;
  },

  // Reports
  getReports: async (params = {}) => {
    const res = await api.get('/finance/reports', { params });
    return res.data.data;
  },
};

export default financeService;
