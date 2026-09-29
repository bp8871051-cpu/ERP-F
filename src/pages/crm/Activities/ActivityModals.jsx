import React, { useState } from 'react';
import { Phone, Calendar, Mail, CheckSquare, FileText, X } from 'lucide-react';
import crmService from '../../../services/crmService';
import Button from '../../../components/ui/Button';

// 1. LOG CALL MODAL
export const LogCallModal = ({ isOpen, onClose, onSuccess, defaultEntity = {} }) => {
  const [formData, setFormData] = useState({
    call_type: 'outgoing',
    duration_minutes: 5,
    outcome: 'connected',
    notes: '',
    contact_id: defaultEntity.contact_id || '',
    lead_id: defaultEntity.lead_id || '',
    deal_id: defaultEntity.deal_id || '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await crmService.logCall(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error logging call');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-teal-600" />
            Log Call Activity
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Call Direction</label>
            <div className="grid grid-cols-3 gap-2">
              {['outgoing', 'incoming', 'missed'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFormData({ ...formData, call_type: type })}
                  className={`py-2 rounded-lg font-medium capitalize border text-center transition-all cursor-pointer ${
                    formData.call_type === type
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Duration (Mins)</label>
              <input
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Call Outcome</label>
              <select
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="connected">Connected / Discussed</option>
                <option value="left_message">Left Voicemail</option>
                <option value="no_answer">No Answer</option>
                <option value="rescheduled">Meeting Rescheduled</option>
                <option value="wrong_number">Wrong Number</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Discussion Notes *</label>
            <textarea
              required
              rows="3"
              placeholder="What was discussed during the call?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Call Log'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. SCHEDULE MEETING MODAL
export const ScheduleMeetingModal = ({ isOpen, onClose, onSuccess, defaultEntity = {} }) => {
  const [formData, setFormData] = useState({
    title: '',
    meeting_date: new Date().toISOString().slice(0, 10),
    start_time: '14:00',
    end_time: '14:30',
    location: 'Google Meet',
    meeting_link: 'https://meet.google.com/new',
    description: '',
    contact_id: defaultEntity.contact_id || '',
    lead_id: defaultEntity.lead_id || '',
    deal_id: defaultEntity.deal_id || '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await crmService.scheduleMeeting(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling meeting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-teal-600" />
            Schedule Client Meeting
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Meeting Title *</label>
            <input
              required
              type="text"
              placeholder="e.g. Enterprise Solution Demo"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.meeting_date}
                onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                className="w-full px-2 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-2 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-2 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Location</label>
              <input
                type="text"
                placeholder="Google Meet, Zoom, Office"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Meeting URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Agenda / Description</label>
            <textarea
              rows="3"
              placeholder="Outline objectives, demo scope, or key attendees..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. SEND / LOG EMAIL MODAL
export const SendEmailModal = ({ isOpen, onClose, onSuccess, defaultEntity = {} }) => {
  const [formData, setFormData] = useState({
    to_email: defaultEntity.email || '',
    subject: '',
    body: '',
    contact_id: defaultEntity.contact_id || '',
    lead_id: defaultEntity.lead_id || '',
    deal_id: defaultEntity.deal_id || '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await crmService.logEmail(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error dispatching email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-teal-600" />
            Send Client Email
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">To Email *</label>
            <input
              required
              type="email"
              placeholder="client@company.com"
              value={formData.to_email}
              onChange={(e) => setFormData({ ...formData, to_email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Subject *</label>
            <input
              required
              type="text"
              placeholder="e.g. Follow-up on Proposal and Agreement"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Body *</label>
            <textarea
              required
              rows="5"
              placeholder="Write your email message..."
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Sending via Queue...' : 'Send Email'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. ADD TASK MODAL
export const AddTaskModal = ({ isOpen, onClose, onSuccess, defaultEntity = {} }) => {
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    description: '',
    contact_id: defaultEntity.contact_id || '',
    lead_id: defaultEntity.lead_id || '',
    deal_id: defaultEntity.deal_id || '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await crmService.createTask(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            Add CRM Task
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Task Title *</label>
            <input
              required
              type="text"
              placeholder="e.g. Send updated pricing schedule"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Task Description</label>
            <textarea
              rows="3"
              placeholder="Additional details or instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. ADD NOTE MODAL
export const AddNoteModal = ({ isOpen, onClose, onSuccess, defaultEntity = {} }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contact_id: defaultEntity.contact_id || '',
    lead_id: defaultEntity.lead_id || '',
    deal_id: defaultEntity.deal_id || '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await crmService.addNote(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-teal-600" />
            Add Note
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Note Title *</label>
            <input
              required
              type="text"
              placeholder="e.g. Budget approval discussed with CFO"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Content *</label>
            <textarea
              required
              rows="4"
              placeholder="Write detailed observation, stakeholder feedback, or decision notes..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="teal" size="sm" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
