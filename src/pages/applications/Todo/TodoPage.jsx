import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Edit2,
  MessageSquare,
  Columns,
  List,
  Check,
  Send,
  X,
  Tag,
} from 'lucide-react';
import { taskService } from '../../../services/taskService';
import { useAuth } from '../../../context/AuthContext';

export const TodoPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'upcoming', 'completed', 'overdue'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    category: 'Engineering',
    assigned_to: '1',
  });

  // Comments drawer state
  const [activeTaskForDetails, setActiveTaskForDetails] = useState(null);
  const [newComment, setNewComment] = useState('');
  
  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find((t) => t.id === draggedTaskId);
    if (task && task.status !== targetStatus) {
      handleChangeStatus(draggedTaskId, targetStatus, null);
    }
    setDraggedTaskId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const kanbanColumns = [
    { id: 'todo', name: 'To Do', color: 'border-slate-300' },
    { id: 'in_progress', name: 'In Progress', color: 'border-blue-500' },
    { id: 'review', name: 'In Review', color: 'border-amber-500' },
    { id: 'completed', name: 'Completed', color: 'border-emerald-500' },
  ];

  // Load tasks
  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks();
      if (res && res.data) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Open Create Modal
  const openCreateModal = (defaultStatus = 'todo') => {
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: defaultStatus,
      due_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      category: 'Operations',
      assigned_to: user?.id ? String(user.id) : '1',
    });
    setIsTaskModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
      category: task.category || 'Operations',
      assigned_to: task.assigned_to ? String(task.assigned_to) : '1',
    });
    setIsTaskModalOpen(true);
  };

  // Save task
  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (selectedTask) {
        await taskService.updateTask(selectedTask.id, formData);
      } else {
        await taskService.createTask(formData);
      }
      setIsTaskModalOpen(false);
      loadTasks();
    } catch (err) {
      console.error('Failed to save task', err);
    }
  };

  // Change Task Status directly (drag/click progression)
  const handleChangeStatus = async (taskId, newStatus, e) => {
    e?.stopPropagation();
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      if (activeTaskForDetails?.id === taskId) {
        setActiveTaskForDetails((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (activeTaskForDetails?.id === taskId) setActiveTaskForDetails(null);
      if (selectedTask?.id === taskId) setIsTaskModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Checklist Item
  const handleToggleChecklist = async (taskId, checklistId, e) => {
    e?.stopPropagation();
    try {
      await taskService.toggleChecklist(taskId, checklistId);
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const updated = (t.checklists || []).map((ch) =>
            ch.id === checklistId ? { ...ch, is_completed: !ch.is_completed } : ch
          );
          return { ...t, checklists: updated };
        })
      );
      if (activeTaskForDetails?.id === taskId) {
        setActiveTaskForDetails((prev) => {
          const updated = (prev.checklists || []).map((ch) =>
            ch.id === checklistId ? { ...ch, is_completed: !ch.is_completed } : ch
          );
          return { ...prev, checklists: updated };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeTaskForDetails) return;
    try {
      const res = await taskService.addComment(activeTaskForDetails.id, newComment);
      if (res && res.data) {
        setActiveTaskForDetails((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data],
        }));
        setNewComment('');
        loadTasks();
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      t.title?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    const todayStr = new Date().toISOString().slice(0, 10);
    if (activeFilter === 'today') return t.due_date?.startsWith(todayStr);
    if (activeFilter === 'upcoming') return t.due_date && t.due_date > todayStr;
    if (activeFilter === 'completed') return t.status === 'completed';
    if (activeFilter === 'overdue') return t.due_date && t.due_date < todayStr && t.status !== 'completed';

    return true;
  }).sort((a, b) => {
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    const wA = priorityWeight[a.priority] || 0;
    const wB = priorityWeight[b.priority] || 0;
    
    if (wA !== wB) return wB - wA;
    
    // Sort newest first by created_at or id fallback
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    
    return b.id - a.id;
  });

  const getPriorityBadge = (p) => {
    if (p === 'urgent') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (p === 'high') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (p === 'medium') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Task Operations & To Do</h1>
          <p className="text-xs text-slate-500 mt-1">
            Collaborative task boards, sprint tracking, checklists, and delivery deadlines
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Navigation Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium overflow-x-auto">
          {[
            { id: 'all', name: 'My Tasks' },
            { id: 'today', name: 'Today' },
            { id: 'upcoming', name: 'Upcoming' },
            { id: 'completed', name: 'Completed' },
            { id: 'overdue', name: 'Overdue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Search, Priority Filter & View Mode */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'kanban' ? 'bg-white shadow-2xs text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Kanban Board"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Task View: Kanban vs List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading tasks...</span>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`bg-slate-50/70 border rounded-2xl p-3 flex flex-col min-h-[500px] transition-colors ${
                  draggedTaskId ? 'border-dashed border-teal-300' : 'border-slate-200/80'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{col.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {columnTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openCreateModal(col.id)}
                    className="p-1 text-slate-400 hover:text-teal-600 rounded cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setActiveTaskForDetails(task)}
                      className={`p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer group ${
                        draggedTaskId === task.id ? 'opacity-50 border-dashed border-teal-500 shadow-md' : ''
                      }`}
                    >
                      {/* Priority & Category tags */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        {task.category && (
                          <span className="text-[10px] text-slate-400 font-medium truncate">
                            {task.category}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-800 leading-snug mb-1 group-hover:text-teal-600 transition-colors">
                        {task.title}
                      </h4>

                      {/* Description preview */}
                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Checklists progress */}
                      {task.checklists?.length > 0 && (
                        <div className="mb-3 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Checklist</span>
                            <span>
                              {task.checklists.filter((c) => c.is_completed).length}/{task.checklists.length}
                            </span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{
                                width: `${
                                  (task.checklists.filter((c) => c.is_completed).length /
                                    task.checklists.length) *
                                  100
                                }%`,
                              }}
                              className="h-full bg-teal-500 rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer: Due date & comments */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'No deadline'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {task.comments?.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-3 h-3" />
                              <span>{task.comments.length}</span>
                            </span>
                          )}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(task);
                              }}
                              className="p-0.5 hover:text-blue-600"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="p-0.5 hover:text-rose-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setActiveTaskForDetails(task)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChangeStatus(
                            task.id,
                            task.status === 'completed' ? 'todo' : 'completed',
                            e
                          );
                        }}
                        className="mt-0.5 text-slate-400 hover:text-teal-600 cursor-pointer"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <span
                          className={`font-semibold block ${
                            task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <span className="text-[11px] text-slate-400 line-clamp-1">{task.description}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={task.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleChangeStatus(task.id, e.target.value, e)}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-700"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">{task.category || 'General'}</td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '--'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(task);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Details & Comments Drawer */}
      {activeTaskForDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Overview</span>
              <button
                onClick={() => setActiveTaskForDetails(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              <div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider inline-block mb-2 ${getPriorityBadge(
                    activeTaskForDetails.priority
                  )}`}
                >
                  {activeTaskForDetails.priority}
                </span>
                <h2 className="text-base font-bold text-slate-900 leading-snug">
                  {activeTaskForDetails.title}
                </h2>
                {activeTaskForDetails.description && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                    {activeTaskForDetails.description}
                  </p>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['todo', 'in_progress', 'review', 'completed'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleChangeStatus(activeTaskForDetails.id, st)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        activeTaskForDetails.status === st
                          ? 'border-teal-600 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Checklist */}
              {activeTaskForDetails.checklists?.length > 0 && (
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-2">Checklist</label>
                  <div className="space-y-2">
                    {activeTaskForDetails.checklists.map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => handleToggleChecklist(activeTaskForDetails.id, item.id, e)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            item.is_completed
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {item.is_completed && <Check className="w-3 h-3" />}
                        </div>
                        <span
                          className={`text-xs ${
                            item.is_completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Thread */}
              <div className="pt-4 border-t border-slate-200">
                <label className="text-[11px] font-bold uppercase text-slate-400 block mb-3">
                  Comments & Audit Updates
                </label>
                <div className="space-y-3 mb-4">
                  {(activeTaskForDetails.comments || []).length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4">No comments yet</div>
                  ) : (
                    (activeTaskForDetails.comments || []).map((cm) => (
                      <div key={cm.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-700">{cm.user?.name || 'Colleague'}</span>
                          <span>
                            {new Date(cm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{cm.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment bar */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {selectedTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct compliance audit on invoice batch"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed deliverables, prerequisites, and scope..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Operations, Finance, Sales"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoPage;
