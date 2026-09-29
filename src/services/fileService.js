import api from './api';

export const fileService = {
  getFiles: async ({ folderId = null, filter = null, search = '', sortBy = 'name', sortOrder = 'asc' } = {}) => {
    const params = {};
    if (folderId) params.folder_id = folderId;
    if (filter) params.filter = filter;
    if (search) params.search = search;
    if (sortBy) params.sort_by = sortBy;
    if (sortOrder) params.sort_order = sortOrder;
    const response = await api.get('/v1/files', { params });
    return response.data;
  },

  uploadFile: async (file, folderId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folder_id', folderId);

    const response = await api.post('/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  createFolder: async (name, parentId = null, color = '#0F8B7A') => {
    const response = await api.post('/v1/files/folders', {
      name,
      parent_id: parentId,
      color,
    });
    return response.data;
  },

  updateFile: async (id, data) => {
    const response = await api.put(`/v1/files/${id}`, data);
    return response.data;
  },

  deleteFile: async (id) => {
    const response = await api.delete(`/v1/files/${id}`);
    return response.data;
  },

  deleteFolder: async (id) => {
    const response = await api.delete(`/v1/files/folders/${id}`);
    return response.data;
  },

  shareFile: async (id, data) => {
    const response = await api.post(`/v1/files/${id}/share`, data);
    return response.data;
  },
};

export default fileService;
