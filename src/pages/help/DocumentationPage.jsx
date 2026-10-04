import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Search, BookOpen, ChevronRight, Menu, X, ArrowLeft, ArrowRight,
  ThumbsUp, ThumbsDown, Copy, Check, ExternalLink, HelpCircle,
  FileText, Shield, Code, Server, Boxes, Compass, Sparkles, RefreshCw
} from 'lucide-react';
import UIPageHeader from '../../components/ui/interface/UIPageHeader';

export const DocumentationPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [activeDoc, setActiveDoc] = useState(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(null);

  // Fetch documentation from API
  useEffect(() => {
    fetchDocs();
  }, [searchTerm, selectedCategorySlug]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategorySlug !== 'all') params.category = selectedCategorySlug;

      const res = await axios.get('http://127.0.0.1:8000/api/v1/help/documentation', { params });
      if (res.data?.status === 'success') {
        const fetchedCats = res.data.data.categories || [];
        setCategories(fetchedCats);

        // Auto select first document if none active
        if (!activeDoc && fetchedCats.length > 0) {
          for (const cat of fetchedCats) {
            if (cat.documents && cat.documents.length > 0) {
              setActiveDoc(cat.documents[0]);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch documentation from API, fallback to default', err);
    } finally {
      setLoading(false);
    }
  };

  const selectDoc = (doc) => {
    setActiveDoc(doc);
    setIsMobileDrawerOpen(false);
    setFeedbackGiven(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find next and previous documents across all categories
  const allDocsFlat = useMemo(() => {
    const list = [];
    categories.forEach((cat) => {
      if (cat.documents) {
        cat.documents.forEach((d) => list.push({ ...d, categoryName: cat.name }));
      }
    });
    return list;
  }, [categories]);

  const currentIndex = allDocsFlat.findIndex((d) => d.id === activeDoc?.id);
  const prevDoc = currentIndex > 0 ? allDocsFlat[currentIndex - 1] : null;
  const nextDoc = currentIndex !== -1 && currentIndex < allDocsFlat.length - 1 ? allDocsFlat[currentIndex + 1] : null;

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'getting-started': return Compass;
      case 'installation-setup': return Server;
      case 'modules-overview': return Boxes;
      case 'api-reference': return Code;
      case 'faq-troubleshooting': return HelpCircle;
      default: return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        title="Enterprise Documentation"
        description="Comprehensive technical manuals, setup guides, API architecture, and FAQs for the Falcon & Dreams ERP platform."
        breadcrumbs={[
          { label: 'Help', path: '/help/documentation' },
          { label: 'Documentation' }
        ]}
      />

      {/* Main Documentation Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
        {/* ========================================================
            LEFT NAVIGATION (Desktop & Mobile Drawer)
            ======================================================== */}
        <div
          className={`lg:w-80 border-r border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-850 p-4 shrink-0 flex flex-col ${
            isMobileDrawerOpen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 w-full' : 'hidden lg:flex'
          }`}
        >
          {/* Drawer Header (Mobile Only) */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-700 lg:hidden">
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookOpen size={16} className="text-teal-600" />
              Documentation Index
            </span>
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategorySlug('all')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedCategorySlug === 'all'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategorySlug === cat.slug
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Categories & Articles List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {categories.map((cat) => {
              const IconComp = getCategoryIcon(cat.slug);
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <IconComp size={13} className="text-teal-600 dark:text-teal-400" />
                    <span>{cat.name}</span>
                  </div>

                  <div className="space-y-0.5">
                    {cat.documents?.map((doc) => {
                      const isDocCurrent = activeDoc?.id === doc.id;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => selectDoc(doc)}
                          className={`w-full text-left flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                            isDocCurrent
                              ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold border-l-2 border-teal-600 pl-2.5'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{doc.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{doc.read_time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && !loading && (
              <div className="p-6 text-center text-slate-400 text-xs">
                No documentation found matching "{searchTerm}".
              </div>
            )}
          </div>

          {/* Left Footer Info */}
          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>ERP Version 2.4.0</span>
            <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
              <Sparkles size={12} /> Enterprise Suite
            </span>
          </div>
        </div>

        {/* ========================================================
            RIGHT MAIN CONTENT
            ======================================================== */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col">
          {/* Mobile Drawer Toggle Banner */}
          <div className="lg:hidden mb-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              <BookOpen size={15} className="text-teal-600" />
              <span className="truncate">{activeDoc?.title || 'Documentation Index'}</span>
            </div>
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium shrink-0"
            >
              <Menu size={14} /> Browse Articles
            </button>
          </div>

          {activeDoc ? (
            <div className="flex-1 flex flex-col">
              {/* Article Header */}
              <div className="border-b border-slate-100 dark:border-slate-700/80 pb-6 mb-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {activeDoc.category?.name || 'User Guide'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Estimated read: {activeDoc.read_time}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Last updated: Oct 2026</span>
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {activeDoc.title}
                </h1>

                {activeDoc.excerpt && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {activeDoc.excerpt}
                  </p>
                )}
              </div>

              {/* Article Body Content */}
              <div className="flex-1 prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-4">
                <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/80 rounded-xl flex items-start gap-3 my-4">
                  <Sparkles className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-semibold text-xs text-teal-900 dark:text-teal-200 mb-0.5">Enterprise Pro Tip</h4>
                    <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
                      All settings and configuration changes made in this module propagate across company branches instantly. Super Administrators can audit changes in the Activity Timeline.
                    </p>
                  </div>
                </div>

                {/* Formatted Content Output */}
                <div className="whitespace-pre-line text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                  {activeDoc.content}
                </div>

                {/* Example Interactive Quick Command Copy Block */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 my-6 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span className="font-mono flex items-center gap-1.5 text-teal-400">
                      <Code size={13} /> artisan / shell command
                    </span>
                    <button
                      onClick={() => copyCode('php artisan route:list --path=help')}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {copiedSnippet ? <Check size={12} className="text-teal-400" /> : <Copy size={12} />}
                      {copiedSnippet ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="pt-3 font-mono text-xs overflow-x-auto text-emerald-400">
                    <code>php artisan route:list --path=help</code>
                  </pre>
                </div>
              </div>

              {/* Feedback Rating Box */}
              <div className="my-8 p-4 bg-slate-50 dark:bg-slate-750/70 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">Was this article helpful?</h4>
                  <p className="text-[11px] text-slate-500">Your feedback helps us continuously refine the enterprise ERP manuals.</p>
                </div>

                {feedbackGiven ? (
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                    <Check size={14} /> Thank you for your feedback!
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFeedbackGiven('yes')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-teal-50 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <ThumbsUp size={13} className="text-teal-600" /> Yes
                    </button>
                    <button
                      onClick={() => setFeedbackGiven('no')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <ThumbsDown size={13} className="text-slate-500" /> No
                    </button>
                  </div>
                )}
              </div>

              {/* Previous / Next Article Navigation */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevDoc ? (
                  <button
                    onClick={() => selectDoc(prevDoc)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:bg-slate-50 dark:hover:bg-slate-750 text-left transition-all group"
                  >
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" /> Previous Article
                    </span>
                    <span className="block mt-1 font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                      {prevDoc.title}
                    </span>
                  </button>
                ) : <div />}

                {nextDoc ? (
                  <button
                    onClick={() => selectDoc(nextDoc)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:bg-slate-50 dark:hover:bg-slate-750 text-right transition-all group"
                  >
                    <span className="text-[11px] font-medium text-slate-400 flex items-center justify-end gap-1">
                      Next Article <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="block mt-1 font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                      {nextDoc.title}
                    </span>
                  </button>
                ) : <div />}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <BookOpen className="text-slate-300 dark:text-slate-600 mb-3" size={48} />
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">No article selected</h3>
              <p className="text-xs text-slate-500 mt-1">Please select an article from the left navigation index to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
