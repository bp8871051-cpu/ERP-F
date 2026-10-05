import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
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

// Response interceptor to handle retry for network glitches & unauthenticated 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 unauthenticated
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Auto-retry up to 2 times for transient network/server hiccups (e.g. ERR_NETWORK, 502, 503)
    if (config && !config.__isRetryRequest) {
      config.__retryCount = config.__retryCount || 0;
      const shouldRetry =
        !error.response ||
        (error.response.status >= 500 && error.response.status <= 504);

      if (shouldRetry && config.__retryCount < 2) {
        config.__retryCount += 1;
        const delay = config.__retryCount * 400;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
