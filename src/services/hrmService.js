import api from './api';

export const hrmService = {
  // Dashboard Overview
  getDashboard: async () => {
    const res = await api.get('/hrm/dashboard');
    return res.data.data;
  },

  // Employees
  getEmployees: async (params = {}) => {
    const res = await api.get('/hrm/employees', { params });
    return res.data.data;
  },

  getEmployee: async (id) => {
    const res = await api.get(`/hrm/employees/${id}`);
    return res.data.data;
  },

  createEmployee: async (data) => {
    const res = await api.post('/hrm/employees', data);
    return res.data;
  },

  updateEmployee: async (id, data) => {
    const res = await api.put(`/hrm/employees/${id}`, data);
    return res.data;
  },

  deleteEmployee: async (id) => {
    const res = await api.delete(`/hrm/employees/${id}`);
    return res.data;
  },

  // Departments & Designations
  getDepartments: async () => {
    const res = await api.get('/hrm/departments');
    return res.data.data;
  },

  createDepartment: async (data) => {
    const res = await api.post('/hrm/departments', data);
    return res.data;
  },

  getDesignations: async () => {
    const res = await api.get('/hrm/designations');
    return res.data.data;
  },

  createDesignation: async (data) => {
    const res = await api.post('/hrm/designations', data);
    return res.data;
  },

  // Attendance
  getAttendance: async (params = {}) => {
    const res = await api.get('/hrm/attendance', { params });
    return res.data.data;
  },

  checkIn: async (data = {}) => {
    const res = await api.post('/hrm/attendance/check-in', data);
    return res.data;
  },

  checkOut: async (data = {}) => {
    const res = await api.post('/hrm/attendance/check-out', data);
    return res.data;
  },

  markAttendance: async (data) => {
    const res = await api.post('/hrm/attendance', data);
    return res.data;
  },

  // Leave Management
  getLeaveRequests: async (params = {}) => {
    const res = await api.get('/hrm/leave', { params });
    return res.data.data;
  },

  createLeaveRequest: async (data) => {
    const res = await api.post('/hrm/leave', data);
    return res.data;
  },

  approveLeave: async (id) => {
    const res = await api.post(`/hrm/leave/${id}/approve`);
    return res.data;
  },

  rejectLeave: async (id, reason) => {
    const res = await api.post(`/hrm/leave/${id}/reject`, { reason });
    return res.data;
  },

  getLeaveBalances: async (employeeId = null) => {
    const res = await api.get('/hrm/leave/balances', { params: { employee_id: employeeId } });
    return res.data.data;
  },

  // Holidays
  getHolidays: async () => {
    const res = await api.get('/hrm/holidays');
    return res.data.data;
  },

  createHoliday: async (data) => {
    const res = await api.post('/hrm/holidays', data);
    return res.data;
  },

  // Payroll
  getPayroll: async (params = {}) => {
    const res = await api.get('/hrm/payroll', { params });
    return res.data.data;
  },

  calculatePayroll: async (data) => {
    const res = await api.post('/hrm/payroll/calculate', data);
    return res.data;
  },

  payPayroll: async (id, accountId = null) => {
    const res = await api.post(`/hrm/payroll/${id}/pay`, { account_id: accountId });
    return res.data;
  },

  // Recruitment
  getRecruitmentJobs: async () => {
    const res = await api.get('/hrm/recruitment/jobs');
    return res.data.data;
  },

  createJob: async (data) => {
    const res = await api.post('/hrm/recruitment/jobs', data);
    return res.data;
  },

  getRecruitmentCandidates: async (jobPositionId = null) => {
    const res = await api.get('/hrm/recruitment/candidates', { params: { job_position_id: jobPositionId } });
    return res.data.data;
  },

  createCandidate: async (data) => {
    const res = await api.post('/hrm/recruitment/candidates', data);
    return res.data;
  },

  updateCandidateStage: async (id, stage) => {
    const res = await api.post(`/hrm/recruitment/candidates/${id}/stage`, { stage });
    return res.data;
  },

  scheduleInterview: async (data) => {
    const res = await api.post('/hrm/recruitment/interviews', data);
    return res.data;
  },

  createOffer: async (data) => {
    const res = await api.post('/hrm/recruitment/offers', data);
    return res.data;
  },

  // Performance
  getPerformance: async () => {
    const res = await api.get('/hrm/performance');
    return res.data.data;
  },

  submitReview: async (data) => {
    const res = await api.post('/hrm/performance/review', data);
    return res.data;
  },

  // Training
  getTraining: async () => {
    const res = await api.get('/hrm/training');
    return res.data.data;
  },

  createTraining: async (data) => {
    const res = await api.post('/hrm/training', data);
    return res.data;
  },

  enrollTraining: async (data) => {
    const res = await api.post('/hrm/training/enroll', data);
    return res.data;
  },

  // Analytics
  getAnalytics: async (params = {}) => {
    const res = await api.get('/hrm/analytics', { params });
    return res.data.data;
  },
};

export default hrmService;
