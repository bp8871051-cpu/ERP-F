import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  History, Search, Calendar, Tag, CheckCircle2, Zap, AlertTriangle,
  Flame, Sparkles, Filter, ChevronRight, Download, RefreshCw
} from 'lucide-react';
import UIPageHeader from '../../components/ui/interface/UIPageHeader';

export const ChangelogPage = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  useEffect(() => {
    fetchChangelog();
  }, [searchTerm, selectedTag]);

  const fetchChangelog = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedTag !== 'all') params.tag = selectedTag;

      const res = await axios.get('http://127.0.0.1:8000/api/v1/help/changelog', { params });
      if (res.data?.status === 'success') {
        setReleases(res.data.data.releases || []);
      }
    } catch (err) {
      console.error('Failed to fetch changelog from API', err);
    } finally {
      setLoading(false);
    }
  };

  const tagFilters = [
    { label: 'All Releases', value: 'all' },
    { label: 'Latest Release', value: 'Latest Release' },
    { label: 'Stable', value: 'Stable' },
    { label: 'Major Release', value: 'Major Release' },
    { label: 'Foundational', value: 'Foundational' }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        title="Release Changelog"
        description="Comprehensive release notes, feature highlights, enterprise system improvements, and bug fixes across all versions."
        breadcrumbs={[
          { label: 'Help', path: '/help/changelog' },
          { label: 'Changelog' }
        ]}
      />

      {/* Toolbar: Search and Filter Pills */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search versions, features, or fixes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {tagFilters.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setSelectedTag(tf.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === tf.value
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Changelog Timeline */}
      <div className="relative pl-6 md:pl-8 space-y-8 before:absolute before:left-3 md:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
        {releases.map((rel, index) => {
          const isLatest = index === 0;

          return (
            <div key={rel.id} className="relative group">
              {/* Timeline Pin Indicator */}
              <div
                className={`absolute -left-[27px] md:-left-[35px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 transition-all ${
                  isLatest
                    ? 'bg-teal-600 text-white ring-teal-100 dark:ring-teal-950/60 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-2 border-slate-300 dark:border-slate-600 ring-slate-100 dark:ring-slate-900'
                }`}
              >
                <History size={12} />
              </div>

              {/* Version Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:border-teal-500/40">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                      {rel.version}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isLatest
                          ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                          : 'bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {rel.tag || 'Release'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar size={13} />
                    <span>{formatDate(rel.release_date)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Title & Description */}
                  <div>
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">
                      {rel.title}
                    </h3>
                    {rel.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rel.description}
                      </p>
                    )}
                  </div>

                  {/* Grouped Changes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* 1. New Features */}
                    {rel.changes?.features && rel.changes.features.length > 0 && (
                      <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                          <span>New Features</span>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {rel.changes.features.map((item, i) => (
                            <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 2. Improvements */}
                    {rel.changes?.improvements && rel.changes.improvements.length > 0 && (
                      <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/70 dark:border-teal-900/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300">
                          <Zap size={14} className="text-teal-600 dark:text-teal-400" />
                          <span>Enhancements & Performance</span>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {rel.changes.improvements.map((item, i) => (
                            <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 3. Bug Fixes */}
                    {rel.changes?.bug_fixes && rel.changes.bug_fixes.length > 0 && (
                      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                          <CheckCircle2 size={14} className="text-amber-600 dark:text-amber-400" />
                          <span>Bug Fixes & Stability</span>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {rel.changes.bug_fixes.map((item, i) => (
                            <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 4. Breaking Changes */}
                    {rel.changes?.breaking_changes && rel.changes.breaking_changes.length > 0 && (
                      <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300">
                          <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />
                          <span>Breaking Changes</span>
                        </div>
                        <ul className="space-y-1.5 pl-1">
                          {rel.changes.breaking_changes.map((item, i) => (
                            <li key={i} className="text-xs text-rose-900 dark:text-rose-300 font-medium flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {releases.length === 0 && !loading && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <History className="mx-auto text-slate-400 mb-2" size={32} />
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">No releases found</h4>
            <p className="text-xs text-slate-500 mt-1">Try modifying your search query or removing the tag filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangelogPage;
