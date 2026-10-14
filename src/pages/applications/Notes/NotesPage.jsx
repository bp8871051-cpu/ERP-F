import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Star,
  Archive,
  Trash2,
  Tag,
  Grid,
  List,
  Edit2,
  CheckSquare,
  Clock,
  Palette,
  Share2,
  X,
} from 'lucide-react';
import { noteService } from '../../../services/noteService';
import { useAuth } from '../../../context/AuthContext';

export const NotesPage = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pinned', 'favorites', 'archive'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: '#FFFFFF',
    tags: '',
    is_pinned: false,
    is_favorite: false,
  });

  const availableColors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Teal Light', hex: '#F0FDFA' },
    { name: 'Amber Light', hex: '#FFFBEB' },
    { name: 'Blue Light', hex: '#EFF6FF' },
    { name: 'Rose Light', hex: '#FFF1F2' },
    { name: 'Purple Light', hex: '#FAF5FF' },
  ];

  // Load notes
  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await noteService.getNotes();
      if (res && res.data) {
        setNotes(res.data.notes || []);
      }
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Open Create Modal
  const openCreateModal = () => {
    setSelectedNote(null);
    setFormData({
      title: '',
      content: '',
      color: '#FFFFFF',
      tags: '',
      is_pinned: false,
      is_favorite: false,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (note) => {
    setSelectedNote(note);
    setFormData({
      title: note.title || '',
      content: note.content || '',
      color: note.color || '#FFFFFF',
      tags: note.tags?.map((t) => t.name).join(', ') || '',
      is_pinned: !!note.isPinned,
      is_favorite: !!note.isFavorite,
    });
    setIsModalOpen(true);
  };

  // Save Note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        color: formData.color,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
        is_pinned: formData.is_pinned,
        is_favorite: formData.is_favorite,
      };

      if (selectedNote) {
        await noteService.updateNote(selectedNote.id, payload);
      } else {
        await noteService.createNote(payload);
      }

      setIsModalOpen(false);
      loadNotes();
    } catch (err) {
      console.error('Failed to save note', err);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (id, e) => {
    e.stopPropagation();
    try {
      await noteService.togglePin(id);
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      await noteService.toggleFavorite(id);
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Archive
  const handleToggleArchive = async (id, e) => {
    e.stopPropagation();
    try {
      await noteService.toggleArchive(id);
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Note
  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete this note?')) return;
    try {
      await noteService.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNote?.id === id) setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Collect unique tags
  const allTags = Array.from(
    new Set(notes.flatMap((n) => (n.tags || []).map((t) => t.name)))
  );

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      n.title?.toLowerCase().includes(query) ||
      n.content?.toLowerCase().includes(query) ||
      n.tags?.some((t) => t.name.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (activeTab === 'pinned') return n.isPinned;
    if (activeTab === 'favorites') return n.isFavorite;
    if (activeTab === 'archive') return n.isArchived;
    if (activeTab === 'all' && n.isArchived) return false; // don't show archived in 'all'

    if (selectedTag !== 'all') {
      return n.tags?.some((t) => t.name === selectedTag);
    }

    return true;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned && activeTab === 'all');
  const otherNotes = filteredNotes.filter((n) => !n.isPinned || activeTab !== 'all');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Knowledge & Notes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture operational memos, meeting agendas, checklists, and executive documentation
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Tabs, Search, Tag Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium overflow-x-auto">
          {[
            { id: 'all', name: 'All Notes' },
            { id: 'pinned', name: 'Pinned' },
            { id: 'favorites', name: 'Favorites' },
            { id: 'archive', name: 'Archive' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Search & Layout Toggles */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
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

      {/* Tags Filter Row */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading knowledge base notes...</span>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No notes found</p>
          <p className="text-xs text-slate-400 mt-0.5">Click "New Note" to create your first documentation</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Pinned</h3>
              </div>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-3'
                }
              >
                {pinnedNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}

          {/* Other Notes Section */}
          <div>
            {pinnedNotes.length > 0 && (
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Other Notes</h3>
            )}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-3'
              }
            >
              {otherNotes.map((note) => renderNoteCard(note))}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            style={{ backgroundColor: formData.color }}
            className="rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 transition-colors"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-4">
              <input
                type="text"
                placeholder="Note Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-base font-bold text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none w-full"
                required
              />
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer ml-3"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <textarea
                  rows={8}
                  placeholder="Capture thoughts, checklist, or procedural documentation..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="engineering, ops, quarterly-review"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full bg-white/70 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Color picker */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Note Accent Color</label>
                <div className="flex items-center gap-2">
                  {availableColors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c.hex })}
                      style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded-full border border-slate-300 ring-2 transition-transform cursor-pointer ${
                        formData.color === c.hex ? 'ring-teal-600 scale-110' : 'ring-transparent'
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Pin to top</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_favorite}
                      onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Favorite</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 bg-white/80 hover:bg-white rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Helper to render individual note card
  function renderNoteCard(note) {
    return (
      <div
        key={note.id}
        onClick={() => openEditModal(note)}
        style={{ backgroundColor: note.color || '#FFFFFF' }}
        className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group relative"
      >
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{note.title}</h4>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => handleTogglePin(note.id, e)}
                title={note.isPinned ? 'Unpin' : 'Pin'}
                className={`p-1 rounded cursor-pointer ${
                  note.isPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-slate-500'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => handleToggleFavorite(note.id, e)}
                title={note.isFavorite ? 'Unfavorite' : 'Favorite'}
                className={`p-1 rounded cursor-pointer ${
                  note.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-slate-500'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed whitespace-pre-wrap">
            {note.content}
          </p>

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {note.tags.map((t) => (
                <span
                  key={t.id || t.name}
                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200/60 text-slate-700"
                >
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer info & action buttons */}
        <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {note.createdAt || note.updatedAt || 'Unknown'}
          </span>

          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button
              onClick={(e) => handleToggleArchive(note.id, e)}
              title="Archive Note"
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => handleDeleteNote(note.id, e)}
              title="Delete Note"
              className="p-1 text-slate-400 hover:text-rose-600 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default NotesPage;
