import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ChevronRight,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  UserPlus,
  X,
  Check,
} from 'lucide-react';
import hrmService from '../../../services/hrmService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';

export const RecruitmentDashboard = () => {
  const [activeTab, setActiveTab] = useState('pipeline'); // pipeline, jobs, candidates
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // New Job form
  const [jobFormData, setJobFormData] = useState({
    title: '',
    department_id: '',
    location: 'Bangalore, India',
    employment_type: 'full_time',
    openings: 1,
    description: '',
  });

  // New Candidate form
  const [candidateFormData, setCandidateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    job_position_id: '',
    experience: '3 years',
    skills: 'React, Node.js, Laravel',
    notes: '',
  });

  // Interview form
  const [interviewData, setInterviewData] = useState({
    interview_date: new Date().toISOString().slice(0, 10),
    interview_time: '14:00',
    type: 'video',
    meeting_link: 'https://meet.google.com/xyz-abc-def',
  });

  const fetchRecruitmentTelemetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobsRes, candRes, depRes] = await Promise.all([
        hrmService.getRecruitmentJobs(),
        hrmService.getRecruitmentCandidates(),
        hrmService.getDepartments(),
      ]);
      setJobs(jobsRes || []);
      const cands = candRes?.pipeline ? Object.values(candRes.pipeline).flat() : (candRes || []);
      setCandidates(cands);
      setDepartments(depRes || []);
      if (depRes && depRes.length > 0 && !jobFormData.department_id) {
        setJobFormData((prev) => ({ ...prev, department_id: depRes[0].id }));
      }
    } catch (err) {
      console.error('Error fetching recruitment:', err);
      setError('Unable to load talent acquisition pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitmentTelemetry();
  }, []);

  const handleStageMove = async (candidateId, newStage) => {
    try {
      setActionLoading(true);
      await hrmService.updateCandidateStage(candidateId, newStage);
      setSuccessMessage(`Candidate moved to "${newStage.toUpperCase()}" stage!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchRecruitmentTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update candidate pipeline stage');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.createJob(jobFormData);
      setSuccessMessage(`Job position "${jobFormData.title}" published!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsJobModalOpen(false);
      setJobFormData({
        title: '',
        department_id: departments[0]?.id || '',
        location: 'Bangalore, India',
        employment_type: 'full_time',
        openings: 1,
        description: '',
      });
      fetchRecruitmentTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create job position');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await hrmService.createCandidate(candidateFormData);
      setSuccessMessage(`Candidate "${candidateFormData.name}" added to pipeline!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsCandidateModalOpen(false);
      fetchRecruitmentTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create candidate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    try {
      setActionLoading(true);
      await hrmService.scheduleInterview({
        candidate_id: selectedCandidate.id,
        job_position_id: selectedCandidate.job_position_id || jobs[0]?.id,
        ...interviewData,
      });
      setSuccessMessage(`Interview scheduled for ${selectedCandidate.name}!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsInterviewModalOpen(false);
      setSelectedCandidate(null);
      fetchRecruitmentTelemetry();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setActionLoading(false);
    }
  };

  // Pipeline stages
  const stages = [
    { id: 'applied', label: 'Applied', color: 'border-slate-300' },
    { id: 'screening', label: 'Screening', color: 'border-blue-400' },
    { id: 'shortlisted', label: 'Shortlisted', color: 'border-indigo-400' },
    { id: 'interview', label: 'Interview', color: 'border-amber-400' },
    { id: 'selected', label: 'Selected', color: 'border-teal-400' },
    { id: 'offer', label: 'Offer Sent', color: 'border-purple-400' },
    { id: 'hired', label: 'Hired & Onboarded', color: 'border-emerald-500' },
  ];

  if (loading && jobs.length === 0 && candidates.length === 0)
    return <LoadingSkeleton type="dashboard" />;
  if (error && jobs.length === 0)
    return <ErrorState message={error} onRetry={fetchRecruitmentTelemetry} />;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Talent Acquisition & Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Requisitions, applicant evaluation stages, interview coordination, and offer generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={UserPlus}
            onClick={() => setIsCandidateModalOpen(true)}
          >
            Add Candidate
          </Button>
          <Button
            variant="teal"
            size="sm"
            icon={Plus}
            onClick={() => setIsJobModalOpen(true)}
          >
            Publish Job Requisition
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
            activeTab === 'pipeline'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Interactive Kanban Pipeline
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
            activeTab === 'jobs'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Open Positions ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
            activeTab === 'candidates'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Candidate Directory ({candidates.length})
        </button>
      </div>

      {/* TAB 1: KANBAN PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px]">
            {stages.map((stage) => {
              const stageCandidates = candidates.filter(
                (c) => (c.stage?.toLowerCase() || 'applied') === stage.id
              );

              return (
                <div
                  key={stage.id}
                  className="w-72 bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex flex-col shrink-0"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      {stage.label}
                    </span>
                    <span className="text-[10px] bg-white font-bold text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {stageCandidates.length === 0 ? (
                      <div className="text-center py-6 text-[11px] text-slate-400 italic">
                        No candidates in this stage
                      </div>
                    ) : (
                      stageCandidates.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2 hover:border-teal-400 transition-all text-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900">{c.name}</h4>
                              <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                {c.job_position?.title || 'Engineer'}
                              </p>
                            </div>
                            <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                              {c.experience || '2y'}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 truncate">
                            Skills: {c.skills || 'Software'}
                          </div>

                          {/* Stage Transition Control */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <select
                              value={c.stage?.toLowerCase() || 'applied'}
                              onChange={(e) => handleStageMove(c.id, e.target.value)}
                              className="text-[10px] px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-700 cursor-pointer"
                            >
                              {stages.map((st) => (
                                <option key={st.id} value={st.id}>
                                  Move: {st.label}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                setSelectedCandidate(c);
                                setIsInterviewModalOpen(true);
                              }}
                              title="Schedule Interview"
                              className="p-1 rounded text-teal-600 hover:bg-teal-50 cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: JOBS */}
      {activeTab === 'jobs' && (
        <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Contract</th>
                  <th className="py-3 px-4 text-center">Openings</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">{j.title}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {j.department?.name || 'Engineering'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{j.location || 'Headquarters'}</td>
                    <td className="py-3 px-4 capitalize">{j.employment_type?.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-center font-bold text-teal-700">{j.openings || 1}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="success">{j.status || 'Active'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: CANDIDATES */}
      {activeTab === 'candidates' && (
        <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Target Job</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Skills</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.email}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {c.job_position?.title || 'Open Position'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.experience || '2+ years'}</td>
                    <td className="py-3 px-4">
                      <Badge variant="teal">{c.stage || 'Applied'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{c.skills || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCandidate(c);
                          setIsInterviewModalOpen(true);
                        }}
                        className="text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                      >
                        Interview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Job Requisition Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Publish Job Requisition</h3>
              </div>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Job Position Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Full-Stack Architect"
                  value={jobFormData.title}
                  onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={jobFormData.department_id}
                    onChange={(e) => setJobFormData({ ...jobFormData, department_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Openings</label>
                  <input
                    type="number"
                    min="1"
                    value={jobFormData.openings}
                    onChange={(e) => setJobFormData({ ...jobFormData, openings: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Work Location</label>
                <input
                  type="text"
                  value={jobFormData.location}
                  onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsJobModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Publish Requisition
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Add Applicant</h3>
              </div>
              <button
                onClick={() => setIsCandidateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Candidate Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={candidateFormData.name}
                  onChange={(e) => setCandidateFormData({ ...candidateFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={candidateFormData.email}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={candidateFormData.phone}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Applying For Position</label>
                <select
                  value={candidateFormData.job_position_id}
                  onChange={(e) => setCandidateFormData({ ...candidateFormData, job_position_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  <option value="">Select Position</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Key Technical Skills</label>
                <input
                  type="text"
                  placeholder="e.g. PHP, Laravel, React, MySQL"
                  value={candidateFormData.skills}
                  onChange={(e) => setCandidateFormData({ ...candidateFormData, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCandidateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Add Candidate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isInterviewModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Schedule Interview for {selectedCandidate.name}
                </h3>
              </div>
              <button
                onClick={() => setIsInterviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewData.interview_date}
                    onChange={(e) => setInterviewData({ ...interviewData, interview_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={interviewData.interview_time}
                    onChange={(e) => setInterviewData({ ...interviewData, interview_time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Interview Format</label>
                <select
                  value={interviewData.type}
                  onChange={(e) => setInterviewData({ ...interviewData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                >
                  <option value="video">Google Meet / Video</option>
                  <option value="phone">Phone Screening</option>
                  <option value="in_person">In-Person Technical Round</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Conference Link</label>
                <input
                  type="text"
                  value={interviewData.meeting_link}
                  onChange={(e) => setInterviewData({ ...interviewData, meeting_link: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-500 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsInterviewModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="teal"
                  size="sm"
                  loading={actionLoading}
                >
                  Confirm Interview
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentDashboard;
