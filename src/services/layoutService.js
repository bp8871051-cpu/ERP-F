import api from './api';

export const layoutService = {
  // Get current user layout preferences
  getLayoutPreferences: async () => {
    const res = await api.get('/layouts/preferences');
    return res.data;
  },

  // Save / Update layout preferences
  saveLayoutPreferences: async (preferences) => {
    const res = await api.post('/layouts/preferences', preferences);
    return res.data;
  },

  // Update specific preferences
  updateLayoutPreferences: async (preferences) => {
    const res = await api.put('/layouts/preferences', preferences);
    return res.data;
  },

  // Reset to corporate defaults
  resetLayoutPreferences: async () => {
    const res = await api.post('/layouts/reset');
    return res.data;
  },
};

export default layoutService;
