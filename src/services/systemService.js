import api from './api';

export const systemService = {
  // Users
  getUsers: async (params) => {
    const response = await api.get('/v1/system/users', { params });
    return response.data?.data || response.data;
  },
  createUser: async (data) => {
    const response = await api.post('/v1/system/users', data);
    return response.data?.data || response.data;
  },
  getUserDetails: async (id) => {
    const response = await api.get(`/v1/system/users/${id}`);
    return response.data?.data || response.data;
  },
  updateUser: async (id, data) => {
    const response = await api.put(`/v1/system/users/${id}`, data);
    return response.data?.data || response.data;
  },
  toggleUserStatus: async (id) => {
    const response = await api.post(`/v1/system/users/${id}/toggle-status`);
    return response.data?.data || response.data;
  },
  resetUserPassword: async (id, newPassword) => {
    const response = await api.post(`/v1/system/users/${id}/reset-password`, { new_password: newPassword });
    return response.data?.data || response.data;
  },

  // Roles & Permissions
  getRoles: async () => {
    const response = await api.get('/v1/system/roles');
    return response.data?.data || response.data;
  },
  createRole: async (data) => {
    const response = await api.post('/v1/system/roles', data);
    return response.data?.data || response.data;
  },
  getPermissions: async () => {
    const response = await api.get('/v1/system/permissions');
    return response.data?.data || response.data;
  },
  syncRolePermissions: async (roleId, permissionIds) => {
    const response = await api.post(`/v1/system/roles/${roleId}/permissions`, { permission_ids: permissionIds });
    return response.data?.data || response.data;
  },

  // Delete Requests
  getDeleteRequests: async (params) => {
    const response = await api.get('/v1/system/delete-requests', { params });
    return response.data?.data || response.data;
  },
  createDeleteRequest: async (data) => {
    const response = await api.post('/v1/system/delete-requests', data);
    return response.data?.data || response.data;
  },
  approveDeleteRequest: async (id, reviewNotes) => {
    const response = await api.post(`/v1/system/delete-requests/${id}/approve`, { review_notes: reviewNotes });
    return response.data?.data || response.data;
  },
  rejectDeleteRequest: async (id, reason) => {
    const response = await api.post(`/v1/system/delete-requests/${id}/reject`, { reason });
    return response.data?.data || response.data;
  },

  // Audit Logs
  getAuditLogs: async (params) => {
    const response = await api.get('/v1/system/audit-logs', { params });
    return response.data?.data || response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await api.get('/v1/system/settings');
    return response.data?.data || response.data;
  },
  updateGeneralSettings: async (data) => {
    const response = await api.post('/v1/system/settings/general', data);
    return response.data?.data || response.data;
  },
  updateSecuritySettings: async (data) => {
    const response = await api.post('/v1/system/settings/security', data);
    return response.data?.data || response.data;
  },
  updateNotificationSettings: async (data) => {
    const response = await api.post('/v1/system/settings/notifications', data);
    return response.data?.data || response.data;
  },
  testSmtp: async (data) => {
    const response = await api.post('/v1/system/settings/smtp-test', data);
    return response.data;
  },

  // Integrations & API Keys
  getIntegrations: async () => {
    const response = await api.get('/v1/system/integrations');
    return response.data?.data || response.data;
  },
  getApiKeys: async () => {
    const response = await api.get('/v1/system/api-keys');
    return response.data?.data || response.data;
  },
  createApiKey: async (data) => {
    const response = await api.post('/v1/system/api-keys', data);
    return response.data;
  },
  revokeApiKey: async (id) => {
    const response = await api.delete(`/v1/system/api-keys/${id}`);
    return response.data;
  },
  getWebhooks: async () => {
    const response = await api.get('/v1/system/webhooks');
    return response.data?.data || response.data;
  },
  createWebhook: async (data) => {
    const response = await api.post('/v1/system/webhooks', data);
    return response.data?.data || response.data;
  },
  deleteWebhook: async (id) => {
    const response = await api.delete(`/v1/system/webhooks/${id}`);
    return response.data;
  },
  getSessions: async () => {
    const response = await api.get('/v1/system/sessions');
    return response.data?.data || response.data;
  },
};

export default systemService;
