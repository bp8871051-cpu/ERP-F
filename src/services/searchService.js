import api from './api';

export const searchService = {
  // Global search across chat, calls, events, emails, files, notes, tasks, workflows
  search: async (query) => {
    if (!query || query.trim().length < 2) {
      return { success: true, query: '', results: [] };
    }
    const res = await api.get('/search', { params: { q: query } });
    return res.data;
  },
};

export default searchService;
