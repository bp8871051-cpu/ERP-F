import api from './api';

export const roleDashboardService = {
  // 1. Service Engineer
  serviceEngineer: {
    getDashboard: async () => {
      const response = await api.get('/v1/service-engineer/dashboard');
      return response.data?.data || response.data;
    },
    createTicket: async (data) => {
      const response = await api.post('/v1/service-engineer/tickets', data);
      return response.data;
    },
    deleteTicket: async (id) => {
      const response = await api.delete(`/v1/service-engineer/tickets/${id}`);
      return response.data;
    },
    updateStatus: async (data) => {
      const response = await api.post('/v1/service-engineer/update-status', data);
      return response.data;
    },
    scheduleVisit: async (data) => {
      const response = await api.post('/v1/service-engineer/schedule-visit', data);
      return response.data;
    },
    deleteVisit: async (id) => {
      const response = await api.delete(`/v1/service-engineer/visits/${id}`);
      return response.data;
    },
    createReport: async (data) => {
      const response = await api.post('/v1/service-engineer/service-report', data);
      return response.data;
    },
    deleteReport: async (id) => {
      const response = await api.delete(`/v1/service-engineer/service-reports/${id}`);
      return response.data;
    },
    signOffReport: async (id) => {
      const response = await api.post(`/v1/service-engineer/reports/${id}/sign-off`);
      return response.data;
    },
    requestSpareParts: async (data) => {
      const response = await api.post('/v1/service-engineer/request-spare-parts', data);
      return response.data;
    },
    deleteSpareParts: async (id) => {
      const response = await api.delete(`/v1/service-engineer/spare-parts/${id}`);
      return response.data;
    },
    completeJob: async (data) => {
      const response = await api.post('/v1/service-engineer/complete-job', data);
      return response.data;
    },
  },

  // 2. Store Executive
  storeExecutive: {
    getDashboard: async () => {
      const response = await api.get('/v1/store-executive/dashboard');
      return response.data?.data || response.data;
    },
    createInward: async (data) => {
      const response = await api.post('/v1/store-executive/create-inward', data);
      return response.data;
    },
    createOutward: async (data) => {
      const response = await api.post('/v1/store-executive/create-outward', data);
      return response.data;
    },
    issueMaterial: async (data) => {
      const response = await api.post('/v1/store-executive/issue-material', data);
      return response.data;
    },
    recordMaterialReturn: async (data) => {
      const response = await api.post('/v1/store-executive/material-return', data);
      return response.data;
    },
    requestTransfer: async (data) => {
      const response = await api.post('/v1/store-executive/request-transfer', data);
      return response.data;
    },
    submitAdjustment: async (data) => {
      const response = await api.post('/v1/store-executive/submit-adjustment', data);
      return response.data;
    },
    recordDamaged: async (data) => {
      const response = await api.post('/v1/store-executive/record-damaged', data);
      return response.data;
    },
  },

  // 3. Quality Control
  qualityControl: {
    getDashboard: async () => {
      const response = await api.get('/v1/quality-control/dashboard');
      return response.data?.data || response.data;
    },
    startInspection: async (data) => {
      const response = await api.post('/v1/quality-control/start-inspection', data);
      return response.data;
    },
    recordMeasurements: async (data) => {
      const response = await api.post('/v1/quality-control/record-measurements', data);
      return response.data;
    },
    submitDecision: async (data) => {
      const response = await api.post('/v1/quality-control/submit-decision', data);
      return response.data;
    },
    createNcr: async (data) => {
      const response = await api.post('/v1/quality-control/create-ncr', data);
      return response.data;
    },
    scheduleReinspection: async (data) => {
      const response = await api.post('/v1/quality-control/schedule-reinspection', data);
      return response.data;
    },
  },

  // 4. Project Engineer
  projectEngineer: {
    getDashboard: async () => {
      const response = await api.get('/v1/project-engineer/dashboard');
      return response.data?.data || response.data;
    },
    updateTask: async (data) => {
      const response = await api.post('/v1/project-engineer/update-task', data);
      return response.data;
    },
    submitProgressReport: async (data) => {
      const response = await api.post('/v1/project-engineer/submit-progress-report', data);
      return response.data;
    },
    recordIssue: async (data) => {
      const response = await api.post('/v1/project-engineer/record-issue', data);
      return response.data;
    },
    submitMaterialRequest: async (data) => {
      const response = await api.post('/v1/project-engineer/submit-material-request', data);
      return response.data;
    },
    enterTimesheet: async (data) => {
      const response = await api.post('/v1/project-engineer/enter-timesheet', data);
      return response.data;
    },
    submitTechnicalReview: async (data) => {
      const response = await api.post('/v1/project-engineer/submit-technical-review', data);
      return response.data;
    },
  },
};

export default roleDashboardService;
