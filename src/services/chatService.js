import api from './api';

export const chatService = {
  getConversations: async (search = '') => {
    const params = search ? { search } : {};
    const response = await api.get('/v1/chat/conversations', { params });
    return response.data;
  },

  createConversation: async (data) => {
    const response = await api.post('/v1/chat/conversations', data);
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/v1/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId, data) => {
    const response = await api.post(`/v1/chat/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  editMessage: async (messageId, body) => {
    const response = await api.put(`/v1/chat/messages/${messageId}`, { body });
    return response.data;
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/v1/chat/messages/${messageId}`);
    return response.data;
  },

  toggleReaction: async (messageId, reaction) => {
    const response = await api.post(`/v1/chat/messages/${messageId}/reaction`, { reaction });
    return response.data;
  },

  togglePin: async (messageId) => {
    const response = await api.post(`/v1/chat/messages/${messageId}/pin`);
    return response.data;
  },

  markAsRead: async (conversationId) => {
    const response = await api.post(`/v1/chat/conversations/${conversationId}/read`);
    return response.data;
  },
};

export default chatService;
