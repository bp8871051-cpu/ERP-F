import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FolderPlus,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  UserCheck,
  Tag,
} from 'lucide-react';
import Button from '../ui/Button';
import projectService from '../../services/projectService';

export const AddProjectModal = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    category: 'Enterprise ERP',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    budget: '',
    spent: '0',
    status: 'in_progress',
    progress: 0,
    priority: 'high',
    lead_id: '',
    member_ids: [],
  });

  const [meta, setMeta] = useState({
    clients: [],
    users: [],
    statuses: [],
    categories: [],
  });

  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadMeta();
      // Reset form
      setFormData({
        name: '',
        client_id: '',
        category: 'Enterprise ERP',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        budget: '',
        spent: '0',
        status: 'in_progress',
        progress: 0,
        priority: 'high',
        lead_id: '',
        member_ids: [],
      });
      setError(null);
    }
  }, [isOpen]);

  const loadMeta = async () => {
    try {
      setFetchingMeta(true);
      const res = await projectService.getMeta();
      if (res?.data) {
        setMeta({
          clients: res.data.clients || [],
          users: res.data.users || [],
          statuses: res.data.statuses || [],
          categories: res.data.categories || [],
        });
        if (res.data.clients?.length > 0 && !formData.client_id) {
          setFormData((prev) => ({ ...prev, client_id: res.data.clients[0].id }));
        }
        if (res.data.users?.length > 0 && !formData.lead_id) {
          setFormData((prev) => ({ ...prev, lead_id: res.data.users[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load project metadata:', err);
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const exists = prev.member_ids.includes(userId);
      return {
        ...prev,
        member_ids: exists
          ? prev.member_ids.filter((id) => id !== userId)
          : [...prev.member_ids, userId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required.');
      return;
    }
    if (!formData.start_date) {
      setError('Start date is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = {
        name: formData.name.trim(),
        client_id: formData.client_id ? Number(formData.client_id) : null,
        description: formData.description
          ? `${formData.category ? `[${formData.category}] ` : ''}${formData.description.trim()}`
          : (formData.category ? `[${formData.category}] Project initiative` : null),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        budget: formData.budget !== '' ? parseFloat(formData.budget) : 0,
        spent: formData.spent !== '' ? parseFloat(formData.spent) : 0,
        status: formData.status,
        progress: parseInt(formData.progress, 10) || 0,
        lead_id: formData.lead_id ? Number(formData.lead_id) : null,
        member_ids: formData.member_ids,
      };

      const res = await projectService.createProject(payload);
      if (onSaved) {
        onSaved(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create project:', err);
      const serverMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : 'Failed to create project. Please verify inputs and try again.');
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Create New Project</h2>
                <p className="text-xs text-slate-300">
                  Launch a new initiative, set timelines, allocate budget, and assign team
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Project Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. NextGen Microservices Migration & API Gateway"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-600" />
                    Project Domain / Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="Enterprise ERP">Enterprise ERP</option>
                    <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                    <option value="Cybersecurity & Zero-Trust">Cybersecurity & Zero-Trust</option>
                    <option value="Mobile Application">Mobile Application</option>
                    <option value="Web Application">Web Application</option>
                    <option value="AI / Machine Learning">AI / Machine Learning</option>
                    <option value="Data Warehouse & ETL">Data Warehouse & ETL</option>
                    <option value="DevOps & Automation">DevOps & Automation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Client / Organization
                  </label>
                  <select
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="">Internal Project / Falcon LLP</option>
                    {meta.clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company_name ? `(${c.company_name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline & Budget */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Schedule & Financial Allocation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-slate-400" />
                    Allocated Budget ($ USD)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g. 150000"
                    min="0"
                    step="500"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-slate-400" />
                    Initial Spent ($ USD)
                  </label>
                  <input
                    type="number"
                    name="spent"
                    value={formData.spent}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Status, Priority & Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="not_started">Planning / Not Started</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sprint Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex justify-between">
                  <span>Initial Progress</span>
                  <span className="font-bold text-teal-600">{formData.progress}%</span>
                </label>
                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={handleChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                />
              </div>
            </div>

            {/* Team Lead & Member Assignment */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                Project Lead / Tech Lead
              </label>
              <select
                name="lead_id"
                value={formData.lead_id}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Select Project Lead</option>
                {meta.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role || 'Staff'} ({u.email})
                  </option>
                ))}
              </select>

              {meta.users.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                    Assign Additional Engineers / Contributors:
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl border border-slate-100 bg-slate-50/50">
                    {meta.users.map((u) => {
                      const isSelected = formData.member_ids.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleMemberToggle(u.id)}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle className="w-3 h-3 text-teal-200" />}
                          {u.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Project Description & Deliverables
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Key architectural goals, tech stack deliverables, milestones, and success criteria..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="teal"
                size="sm"
                icon={loading ? Clock : FolderPlus}
                disabled={loading}
              >
                {loading ? 'Creating Project...' : 'Launch Project'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProjectModal;
