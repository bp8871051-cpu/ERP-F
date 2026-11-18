import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

export const MandatoryDailyTaskModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('General Operations');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    const checkDailyTask = async () => {
      // Saturday (6) and Sunday (0) are holidays -> do not show mandatory popup
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setIsOpen(false);
        setChecking(false);
        return;
      }
      try {
        setChecking(true);
        const res = await taskService.getTasks({ view: 'today' });
        const todayTasks = res?.tasks || [];

        const localKey = `daily_task_done_${user.id}_${todayStr}`;
        const locallyDone = localStorage.getItem(localKey);

        if (todayTasks.length === 0 && !locallyDone) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } catch (err) {
        console.error('Failed to check daily task status:', err);
        const localKey = `daily_task_done_${user?.id}_${todayStr}`;
        if (!localStorage.getItem(localKey)) {
          setIsOpen(true);
        }
      } finally {
        setChecking(false);
      }
    };

    checkDailyTask();
  }, [user, todayStr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await taskService.createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        status: 'todo',
        due_date: todayStr,
        assigned_to: user?.id,
      });

      const localKey = `daily_task_done_${user.id}_${todayStr}`;
      localStorage.setItem(localKey, 'true');

      setIsOpen(false);
    } catch (err) {
      console.error('Failed to create daily mandatory task:', err);
      setError(err.response?.data?.message || 'Failed to submit task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking || !isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white my-auto"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header with High-Contrast Falcon Teal Header */}
        <div
          className="p-5 text-white"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Daily Task Mandatory Check-In
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-900 rounded-full shadow-xs">
                  Required
                </span>
              </div>
              <p className="text-xs text-teal-100 mt-0.5">
                Welcome, {user?.name || 'User'}! Please add your agenda for today ({todayStr}).
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex items-center gap-2 text-[11px] text-teal-100 bg-black/20 p-2.5 rounded-xl border border-white/10">
            <Lock className="w-3.5 h-3.5 shrink-0 text-amber-300" />
            <span>This window cannot be closed until your first task for today is submitted.</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs bg-white">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
              Task Title / Goal for Today <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Complete Site Inspection / Review Inward Stock / Client Follow-ups"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
              Key Deliverables / Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief details about what will be accomplished today..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 bg-slate-50/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 text-xs">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white text-slate-800 font-medium"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent / Critical</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 text-xs">Department / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white text-slate-800 font-medium"
              >
                <option value="General Operations">General Operations</option>
                <option value="Engineering">Engineering</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Store & Inventory">Store & Inventory</option>
                <option value="Accounts & Finance">Accounts & Finance</option>
                <option value="Sales & CRM">Sales & CRM</option>
                <option value="Licensing & Compliance">Licensing & Compliance</option>
              </select>
            </div>
          </div>

          {/* Submit Action Button - High Contrast & Clearly Visible */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:brightness-105 active:scale-[0.99]"
              style={{
                backgroundColor: '#0d9488',
                backgroundImage: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
              }}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span className="text-white font-semibold">Logging Daily Task...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                  <span className="text-white text-xs sm:text-sm font-bold tracking-wide">
                    Submit Task & Unlock Falcon ERP
                  </span>
                  <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MandatoryDailyTaskModal;
