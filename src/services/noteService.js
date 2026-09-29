import api from './api';

export const noteService = {
  getNotes: async ({ filter = null, tag = null, search = '' } = {}) => {
    const params = {};
    if (filter) params.filter = filter;
    if (tag) params.tag = tag;
    if (search) params.search = search;
    const response = await api.get('/v1/notes', { params });
    return response.data;
  },

  createNote: async (data) => {
    const response = await api.post('/v1/notes', data);
    return response.data;
  },

  getNote: async (id) => {
    const response = await api.get(`/v1/notes/${id}`);
    return response.data;
  },

  updateNote: async (id, data) => {
    const response = await api.put(`/v1/notes/${id}`, data);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await api.delete(`/v1/notes/${id}`);
    return response.data;
  },

  togglePin: async (id) => {
    const response = await api.put(`/v1/notes/${id}/pin`);
    return response.data;
  },

  toggleFavorite: async (id) => {
    const response = await api.put(`/v1/notes/${id}/favorite`);
    return response.data;
  },

  toggleArchive: async (id) => {
    const response = await api.put(`/v1/notes/${id}/archive`);
    return response.data;
  },
};

export default noteService;
