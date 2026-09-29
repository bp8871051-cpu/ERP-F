import api from './api';

export const calendarService = {
  getEvents: async ({ start, end, category, search } = {}) => {
    const params = {};
    if (start) params.start = start;
    if (end) params.end = end;
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;
    const response = await api.get('/v1/calendar/events', { params });
    return response.data;
  },

  createEvent: async (data) => {
    const response = await api.post('/v1/calendar/events', data);
    return response.data;
  },

  getEvent: async (id) => {
    const response = await api.get(`/v1/calendar/events/${id}`);
    return response.data;
  },

  updateEvent: async (id, data) => {
    const response = await api.put(`/v1/calendar/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/v1/calendar/events/${id}`);
    return response.data;
  },
};

export default calendarService;
