import api from './api';

export const projectService = {
  getDashboardData: async () => {
    const response = await api.get('/projects/dashboard');
    return response.data;
  },
  getProjects: async (params) => {
    const response = await api.get('/projects/list', { params });
    return response.data;
  },
  getTasks: async (params) => {
    const response = await api.get('/projects/tasks', { params });
    return response.data;
  }
};

export default projectService;
