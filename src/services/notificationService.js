import api from './api';

export const notificationService = {
  // Get all ERP notifications
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  // Mark a single notification as read
  markRead: async (id) => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },

  // Mark all notifications as read
  markAllRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
};

export default notificationService;
