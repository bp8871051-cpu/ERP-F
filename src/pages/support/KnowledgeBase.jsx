import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, Filter, Plus, ThumbsUp, ThumbsDown, Eye, Clock, 
  Tag, Folder, CheckCircle, HelpCircle, ChevronRight, X, Sparkles,
  ExternalLink, FileText, ArrowRight, Bookmark, AlertCircle
} from 'lucide-react';
import supportService from '../../services/supportService';
import { useNavigate } from 'react-router-dom';
import SearchableSelect from '../../components/ui/SearchableSelect';

const defaultCategories = [
  'Getting Started', 'Account', 'Billing', 'Products', 
  'Technical Support', 'Inventory', 'Sales', 'HR', 'General'
];

export default function KnowledgeBase() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);

  // New Article Form state
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    category_name: 'General',
    description: '',
    content: '',
    visibility: 'all',
    status: 'published',
    tags: 'getting-started, guide'
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchKbData = async () => {
    try {
      setLoading(true);
      const data = await supportService.getKnowledgeBase({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery || undefined
      });
      if (data) {
        setCategories(Array.isArray(data.categories) ? data.categories : []);
        const rawArticles = data.articles;
        const list = Array.isArray(rawArticles) 
          ? rawArticles 
          : (Array.isArray(rawArticles?.data) ? rawArticles.data : []);
        setArticles(list);
      }
    } catch (err) {
      console.error('Error fetching knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKbData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchKbData();
  };

  const handleVote = async (articleId, isHelpful) => {
    try {
      setVoteLoading(true);
      await supportService.voteKbArticle(articleId, isHelpful);
      // update state locally
      setArticles(prev => prev.map(a => {
        if (a.id === articleId) {
          return {
            ...a,
            helpful_count: isHelpful ? (a.helpful_count || 0) + 1 : a.helpful_count,
            not_helpful_count: !isHelpful ? (a.not_helpful_count || 0) + 1 : a.not_helpful_count
          };
        }
        return a;
      }));
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(prev => ({
          ...prev,
          helpful_count: isHelpful ? (prev.helpful_count || 0) + 1 : prev.helpful_count,
          not_helpful_count: !isHelpful ? (prev.not_helpful_count || 0) + 1 : prev.not_helpful_count
        }));
      }
      setNotification({ type: 'success', message: 'Thank you for your feedback!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to record vote' });
    } finally {
      setVoteLoading(false);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await supportService.createKbArticle(form);
      setShowCreateModal(false);
      setForm({
        title: '',
        category_id: '',
        category_name: 'General',
        description: '',
        content: '',
        visibility: 'all',
        status: 'published',
        tags: ''
      });
      setNotification({ type: 'success', message: 'Article created successfully!' });
      setTimeout(() => setNotification(null), 3000);
      fetchKbData();
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to create article' });
    } finally {
      setSubmitting(false);
    }
  };

  const safeArticles = Array.isArray(articles) ? articles : [];

  const filteredArticles = safeArticles.filter(art => {
    const matchesSearch = !searchQuery || 
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-8 overflow-hidden shadow-xl border border-slate-700/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Self-Service & Help Documentation
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Knowledge Base</h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Search our comprehensive documentation, troubleshooting guides, setup instructions, and best practice SOPs across departments.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative mt-4 flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search articles, keywords, error codes, SOPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
            />
            <button 
              type="submit"
              className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        <div className="absolute right-8 bottom-8 hidden lg:flex items-center gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Article
          </button>
        </div>
      </div>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </motion.div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Categories */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Categories</span>
              <Folder className="w-4 h-4 text-slate-400" />
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  selectedCategory === 'All' 
                    ? 'bg-slate-900 text-white font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[11px] opacity-75">{safeArticles.length}</span>
              </button>
              {defaultCategories.map(cat => {
                const count = safeArticles.filter(a => a.category?.name === cat || a.category_name === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 text-white font-semibold' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[11px] opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs space-y-3">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-500" /> Help Desk Status
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Published Guides</span>
              <span className="font-bold text-slate-800">{safeArticles.length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Total Helpful Votes</span>
              <span className="font-bold text-emerald-600">
                {safeArticles.reduce((acc, a) => acc + (a.helpful_count || 0), 0)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total Views</span>
              <span className="font-bold text-indigo-600">
                {safeArticles.reduce((acc, a) => acc + (a.view_count || 0), 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Articles Grid & Reader */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>{selectedCategory === 'All' ? 'All Knowledge Base Articles' : `${selectedCategory} Articles`}</span>
              <span className="text-xs font-normal text-slate-500">({filteredArticles.length} found)</span>
            </h2>

            <button 
              onClick={() => setShowCreateModal(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium"
            >
              <Plus className="w-4 h-4" /> New Article
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-44 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">No articles found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No articles match your current category or search criteria. Try a different search or create a new article.
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                Create First Article
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map(art => (
                <motion.div
                  key={art.id}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                  onClick={() => setSelectedArticle(art)}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {art.category?.name || art.category_name || 'General'}
                      </span>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {art.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> {art.helpful_count || 0}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-indigo-600 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {art.description || art.content?.substring(0, 120)}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5" /> {new Date(art.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-indigo-600 font-medium flex items-center gap-1 group">
                      Read article <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article Detail View Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {selectedArticle.category?.name || selectedArticle.category_name || 'General'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Updated {new Date(selectedArticle.updated_at || selectedArticle.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedArticle.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
                {selectedArticle.description && (
                  <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-indigo-900 font-medium text-xs">
                    {selectedArticle.description}
                  </div>
                )}

                <div className="prose prose-sm max-w-none whitespace-pre-line text-slate-700 font-normal">
                  {selectedArticle.content}
                </div>

                {selectedArticle.tags && (
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-slate-400" />
                    {selectedArticle.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer: Helpful Voting */}
              <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-slate-600">Was this article helpful?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(selectedArticle.id, true)}
                      disabled={voteLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Yes ({selectedArticle.helpful_count || 0})
                    </button>
                    <button
                      onClick={() => handleVote(selectedArticle.id, false)}
                      disabled={voteLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold transition"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" /> No ({selectedArticle.not_helpful_count || 0})
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Article Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full flex flex-col my-8 !overflow-visible shadow-2xl border border-slate-200"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" /> Create Knowledge Base Article
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateArticle} className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., How to Configure Multi-Currency in Invoices"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="z-20">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                    <SearchableSelect
                      options={defaultCategories.map(cat => ({ value: cat, label: cat }))}
                      value={form.category_name}
                      onChange={(val) => setForm({ ...form, category_name: val })}
                      searchable={false}
                    />
                  </div>
                  <div className="z-10">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility</label>
                    <SearchableSelect
                      options={[
                        { value: 'all', label: 'Public / All Users' },
                        { value: 'internal', label: 'Internal Staff Only' },
                        { value: 'customers', label: 'Customers Only' }
                      ]}
                      value={form.visibility}
                      onChange={(val) => setForm({ ...form, visibility: val })}
                      searchable={false}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Brief summary shown in search cards..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Article Content (Markdown supported) *</label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Write detailed guide, steps, troubleshooting recommendations..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. invoice, settings, currency, troubleshooting"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {submitting ? 'Publishing...' : 'Publish Article'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
