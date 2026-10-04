import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ThumbsUp, ThumbsDown, Eye, Clock, Tag, Folder, 
  Share2, Bookmark, CheckCircle, AlertCircle, Sparkles, BookOpen 
} from 'lucide-react';
import supportService from '../../services/supportService';

export default function KnowledgeBaseArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const data = await supportService.getKbArticle(id);
        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchArticle();
  }, [id]);

  const handleVote = async (isHelpful) => {
    try {
      setVoteLoading(true);
      await supportService.voteKbArticle(id, isHelpful);
      setArticle(prev => ({
        ...prev,
        helpful_count: isHelpful ? (prev.helpful_count || 0) + 1 : prev.helpful_count,
        not_helpful_count: !isHelpful ? (prev.not_helpful_count || 0) + 1 : prev.not_helpful_count
      }));
      setNotification({ type: 'success', message: 'Thank you for your feedback!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to record vote' });
    } finally {
      setVoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-3/4 bg-slate-200 rounded animate-pulse" />
        <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-12 max-w-lg mx-auto text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Article not found</h2>
        <p className="text-sm text-slate-500">The knowledge base article you requested could not be located.</p>
        <Link to="/app/support/knowledge-base" className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link 
        to="/app/support/knowledge-base" 
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
      </Link>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Article Header */}
        <div className="p-8 border-b border-slate-100 space-y-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
              {article.category?.name || article.category_name || 'General'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Published {new Date(article.published_at || article.created_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {article.view_count || 0} views
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-sm text-slate-600 font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80">
              {article.description}
            </p>
          )}
        </div>

        {/* Article Body */}
        <div className="p-8 space-y-6 text-slate-700 leading-relaxed text-sm">
          <div className="whitespace-pre-line font-normal text-slate-800">
            {article.content}
          </div>

          {article.tags && (
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-slate-400" />
              {article.tags.split(',').map((t, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                  #{t.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Voting & Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-700">Was this article helpful?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(true)}
                disabled={voteLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold transition"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Yes ({article.helpful_count || 0})
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={voteLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold transition"
              >
                <ThumbsDown className="w-3.5 h-3.5" /> No ({article.not_helpful_count || 0})
              </button>
            </div>
          </div>

          <Link
            to="/app/support/tickets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Still need help? Open a Ticket →
          </Link>
        </div>
      </div>
    </div>
  );
}
