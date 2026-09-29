import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Video,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { calendarService } from '../../../services/calendarService';
import { useAuth } from '../../../context/AuthContext';

export const CalendarPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month'); // 'month', 'week', 'day', 'agenda'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Event modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'meeting',
    start_time: '',
    end_time: '',
    location: '',
    meeting_link: '',
    color: '#0F8B7A',
    status: 'scheduled',
  });

  const categories = [
    { id: 'all', name: 'All Categories', color: '#64748B' },
    { id: 'meeting', name: 'Meetings', color: '#0F8B7A' },
    { id: 'task', name: 'Tasks & Sprints', color: '#2563EB' },
    { id: 'approval', name: 'Approvals', color: '#D97706' },
    { id: 'personal', name: 'Personal', color: '#7C3AED' },
  ];

  // Load events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await calendarService.getEvents();
      if (res && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Month navigation helpers
  const handlePrev = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (currentView === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (currentView === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Open modal for new event
  const openNewEventModal = (dateStr = null) => {
    setSelectedEvent(null);
    const now = new Date();
    const start = dateStr ? new Date(dateStr) : now;
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(10, 0, 0, 0);

    const formatForInput = (d) => {
      const pad = (n) => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormData({
      title: '',
      description: '',
      category: 'meeting',
      start_time: formatForInput(start),
      end_time: formatForInput(end),
      location: 'Executive Boardroom 3A',
      meeting_link: 'https://meet.falconerp.com/internal-session',
      color: '#0F8B7A',
      status: 'scheduled',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditEventModal = (event) => {
    setSelectedEvent(event);
    const formatForInput = (iso) => (iso ? iso.slice(0, 16) : '');
    setFormData({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'meeting',
      start_time: formatForInput(event.start_time),
      end_time: formatForInput(event.end_time),
      location: event.location || '',
      meeting_link: event.meeting_link || '',
      color: event.color || '#0F8B7A',
      status: event.status || 'scheduled',
    });
    setIsModalOpen(true);
  };

  // Save event
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await calendarService.updateEvent(selectedEvent.id, formData);
      } else {
        await calendarService.createEvent(formData);
      }
      setIsModalOpen(false);
      loadEvents();
    } catch (err) {
      console.error('Failed to save event', err);
    }
  };

  // Delete event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this calendar event?')) return;
    try {
      await calendarService.deleteEvent(id);
      setIsModalOpen(false);
      loadEvents();
    } catch (err) {
      console.error('Failed to delete event', err);
    }
  };

  // Filter events by category
  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    return true;
  });

  // Calculate days for month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = [];

  // Padding days from previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysArray.push({ day: prevMonthTotalDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthTotalDays - i) });
  }
  // Days of current month
  for (let i = 1; i <= totalDaysInMonth; i++) {
    daysArray.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
  }
  // Remaining days to fill 35 or 42 cells
  const remaining = (7 - (daysArray.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    daysArray.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
  }

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & View Switchers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Calendar</h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule meetings, track workflow approvals, and organize employee milestones
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {['month', 'agenda'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors cursor-pointer ${
                  currentView === view
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          <button
            onClick={() => openNewEventModal()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & Category Filter Pills */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Date Month & Navigation Controls */}
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 mr-2 min-w-[150px]">
            {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={handlePrev}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar View: Month Grid or Agenda */}
      {currentView === 'month' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {daysArray.map((cell, idx) => {
              const cellDateStr = cell.date.toISOString().slice(0, 10);
              const dayEvents = filteredEvents.filter((e) => e.start_time?.startsWith(cellDateStr));
              const todayFlag = isToday(cell.date);

              return (
                <div
                  key={idx}
                  onClick={() => openNewEventModal(cellDateStr)}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                        todayFlag ? 'bg-teal-600 text-white font-bold' : cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {cell.day}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewEventModal(cellDateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-teal-600 rounded transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Events list */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px]">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditEventModal(ev);
                        }}
                        style={{ borderLeftColor: ev.color || '#0F8B7A' }}
                        className="px-1.5 py-1 text-[11px] rounded bg-slate-50 hover:bg-slate-100 border-l-3 text-slate-800 truncate font-medium transition-colors shadow-2xs"
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-teal-600 font-semibold block px-1">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
          <div className="p-4 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-500">
            Upcoming ERP Agenda
          </div>
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No events scheduled in this category
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => openEditEventModal(ev)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    style={{ backgroundColor: ev.color || '#0F8B7A' }}
                    className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{ev.title}</h4>
                    {ev.description && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{ev.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-teal-600" />
                        {new Date(ev.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {ev.location}
                        </span>
                      )}
                      {ev.meeting_link && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Video className="w-3 h-3" />
                          Virtual Link
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      ev.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : ev.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-teal-50 text-teal-700'
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {selectedEvent ? 'Edit Calendar Event' : 'Schedule New Event'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Weekly Strategic Operations Sync"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="task">Task / Sprint</option>
                    <option value="approval">Workflow Approval</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Location / Room</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Conference Room 4B"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Virtual Meeting Link</label>
                <input
                  type="url"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  placeholder="https://meet.falconerp.com/xyz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Agenda items and preparatory notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {selectedEvent ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Save Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
