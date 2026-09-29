import api from './api';

export const taskService = {
  getTasks: async ({ view = 'all', status = null, priority = null, search = '' } = {}) => {
    const params = { view };
    if (status && status !== 'all') params.status = status;
    if (priority && priority !== 'all') params.priority = priority;
    if (search) params.search = search;
    const response = await api.get('/v1/tasks', { params });
    return response.data;
  },

  createTask: async (data) => {
    const response = await api.post('/v1/tasks', data);
    return response.data;
  },

  getTask: async (id) => {
    const response = await api.get(`/v1/tasks/${id}`);
    return response.data;
  },

  updateTask: async (id, data) => {
    const response = await api.put(`/v1/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/v1/tasks/${id}`);
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await api.post(`/v1/tasks/${id}/comments`, { comment });
    return response.data;
  },

  toggleChecklist: async (taskId, checklistId) => {
    const response = await api.post(`/v1/tasks/${taskId}/checklists/${checklistId}/toggle`);
    return response.data;
  },
};

export default taskService;
