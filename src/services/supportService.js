import api from './api';

export const supportService = {
  // Dashboard
  getDashboardData: async () => {
    const response = await api.get('/v1/support/dashboard');
    return response.data?.data || response.data;
  },

  // Contact Messages
  getContactMessages: async (params) => {
    const response = await api.get('/v1/support/contact-messages', { params });
    return response.data?.data || response.data;
  },
  createContactMessage: async (data) => {
    const response = await api.post('/v1/support/contact-messages', data);
    return response.data?.data || response.data;
  },
  replyContactMessage: async (id, replyMessage) => {
    const response = await api.post(`/v1/support/contact-messages/${id}/reply`, { reply_message: replyMessage });
    return response.data?.data || response.data;
  },
  convertContactMessage: async (id, data) => {
    const response = await api.post(`/v1/support/contact-messages/${id}/convert-to-ticket`, data);
    return response.data?.data || response.data;
  },

  // Tickets
  getTickets: async (params) => {
    const response = await api.get('/v1/support/tickets', { params });
    return response.data?.data || response.data;
  },
  createTicket: async (data) => {
    const response = await api.post('/v1/support/tickets', data);
    return response.data?.data || response.data;
  },
  getTicketDetails: async (id) => {
    const response = await api.get(`/v1/support/tickets/${id}`);
    return response.data?.data || response.data;
  },
  replyTicket: async (id, data) => {
    const response = await api.post(`/v1/support/tickets/${id}/reply`, data);
    return response.data?.data || response.data;
  },
  assignTicket: async (id, agentId) => {
    const response = await api.post(`/v1/support/tickets/${id}/assign`, { agent_id: agentId });
    return response.data?.data || response.data;
  },
  updateTicketStatus: async (id, status) => {
    const response = await api.post(`/v1/support/tickets/${id}/status`, { status });
    return response.data?.data || response.data;
  },
  mergeTicket: async (id, targetTicketId) => {
    const response = await api.post(`/v1/support/tickets/${id}/merge`, { target_ticket_id: targetTicketId });
    return response.data?.data || response.data;
  },
  convertTicketToKb: async (id, data) => {
    const response = await api.post(`/v1/support/tickets/${id}/convert-to-kb`, data);
    return response.data?.data || response.data;
  },

  // Knowledge Base
  getKnowledgeBase: async (params) => {
    const response = await api.get('/v1/support/knowledge-base', { params });
    return response.data?.data || response.data;
  },
  getKbArticle: async (id) => {
    const response = await api.get(`/v1/support/knowledge-base/${id}`);
    return response.data?.data || response.data;
  },
  voteKbArticle: async (id, isHelpful) => {
    const response = await api.post(`/v1/support/knowledge-base/${id}/vote`, { is_helpful: isHelpful });
    return response.data?.data || response.data;
  },
  createKbArticle: async (data) => {
    const response = await api.post('/v1/support/knowledge-base', data);
    return response.data?.data || response.data;
  },

  // SLA Management
  getSlaPolicies: async () => {
    const response = await api.get('/v1/support/sla');
    return response.data?.data || response.data;
  },
  createSlaPolicy: async (data) => {
    const response = await api.post('/v1/support/sla', data);
    return response.data?.data || response.data;
  },
};

export default supportService;
