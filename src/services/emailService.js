import api from './api';

export const emailService = {
  getEmails: async (folder = 'inbox', search = '', labelId = null) => {
    const params = { folder };
    if (search) params.search = search;
    if (labelId) params.label = labelId;
    const response = await api.get('/v1/emails', { params });
    return response.data;
  },

  getEmail: async (id) => {
    const response = await api.get(`/v1/emails/${id}`);
    return response.data;
  },

  sendEmail: async (data) => {
    const response = await api.post('/v1/emails', data);
    return response.data;
  },

  replyEmail: async (id, data) => {
    const response = await api.post(`/v1/emails/${id}/reply`, data);
    return response.data;
  },

  forwardEmail: async (id, data) => {
    const response = await api.post(`/v1/emails/${id}/forward`, data);
    return response.data;
  },

  toggleRead: async (id) => {
    const response = await api.put(`/v1/emails/${id}/read`);
    return response.data;
  },

  toggleStar: async (id) => {
    const response = await api.put(`/v1/emails/${id}/star`);
    return response.data;
  },

  deleteEmail: async (id) => {
    const response = await api.delete(`/v1/emails/${id}`);
    return response.data;
  },
};

export default emailService;
