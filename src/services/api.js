import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach JWT / Sanctum Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const companyId = localStorage.getItem('erp_company_id');
    if (companyId) {
      config.headers['X-Company-ID'] = companyId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401 and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      // If not already on login page, redirect
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
