import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Check,
  Search,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  Save,
  RotateCcw,
} from 'lucide-react';
import UIPageHeader from '../../../components/ui/interface/UIPageHeader';
import UIDemoCard from '../../../components/ui/interface/UIDemoCard';

// 1. FORM ELEMENTS PAGE
export const FormElementsPage = () => {
  const [formData, setFormData] = useState({
    name: 'Alexander Wright',
    email: 'admin@falconerp.com',
    password: 'password123',
    number: 45,
    phone: '+1 (555) 234-5678',
    date: '2026-10-03',
    time: '14:30',
    color: '#0F8B7A',
    agree: true,
    notificationType: 'email',
    enable2FA: true,
    bio: 'Enterprise platform lead managing multi-company resource allocations.',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Forms"
        title="Form Elements"
        description="Comprehensive form controls featuring text, email, number, switch, color, phone, date, radio, and validated inputs."
      />

      {submitted && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Form submitted and verified successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Text & Contact Inputs" subtitle="Standard single-line text, email, password, and telephone.">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Specialized & Toggled Controls" subtitle="Color pickers, toggles, checkboxes, and radio buttons.">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Two-Factor Authentication</label>
                <span className="text-[11px] text-slate-500">Require OTP token on logins</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enable2FA}
                  onChange={(e) => setFormData({ ...formData, enable2FA: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Theme Brand Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                />
                <span className="text-xs font-mono text-slate-600">{formData.color}</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Notification Channel</label>
              <div className="flex gap-4 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="notif"
                    value="email"
                    checked={formData.notificationType === 'email'}
                    onChange={() => setFormData({ ...formData, notificationType: 'email' })}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="notif"
                    value="sms"
                    checked={formData.notificationType === 'sms'}
                    onChange={() => setFormData({ ...formData, notificationType: 'sms' })}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>SMS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="notif"
                    value="push"
                    checked={formData.notificationType === 'push'}
                    onChange={() => setFormData({ ...formData, notificationType: 'push' })}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span>Push Notification</span>
                </label>
              </div>
            </div>
          </div>
        </UIDemoCard>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
          >
            Submit Form Elements
          </button>
        </div>
      </form>
    </div>
  );
};

// 2. SELECT2 PAGE
export const Select2Page = () => {
  const departments = ['Engineering', 'UI/UX Design', 'Cloud Ops', 'Finance', 'Supply Chain', 'Sales & CRM', 'Human Resources'];
  const [selectedSingle, setSelectedSingle] = useState('Engineering');
  const [selectedMulti, setSelectedMulti] = useState(['UI/UX Design', 'Engineering']);
  const [searchFilter, setSearchFilter] = useState('');

  const toggleMulti = (item) => {
    setSelectedMulti((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Forms"
        title="Select2"
        description="Searchable, filterable single and multi-select dropdown components with badge removal."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UIDemoCard title="Searchable Single Select" subtitle="Instant filter-as-you-type list selection.">
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-slate-200 rounded-xl p-2 bg-slate-50">
              {departments
                .filter((d) => d.toLowerCase().includes(searchFilter.toLowerCase()))
                .map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedSingle(d)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      selectedSingle === d ? 'bg-teal-600 text-white' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{d}</span>
                    {selectedSingle === d && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
            </div>
            <p className="text-xs text-slate-500">Selected: <strong className="text-slate-900">{selectedSingle}</strong></p>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Multi-Select with Tags" subtitle="Add or remove multiple tags dynamically.">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 p-2 border border-slate-200 rounded-xl min-h-12 bg-white">
              {selectedMulti.map((m) => (
                <span key={m} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  <span>{m}</span>
                  <button type="button" onClick={() => toggleMulti(m)} className="hover:text-teal-900 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {departments.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleMulti(d)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                    selectedMulti.includes(d)
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {selectedMulti.includes(d) ? '✓ ' + d : '+ ' + d}
                </button>
              ))}
            </div>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};

// 3. FORM EDITOR PAGE
export const FormEditorPage = () => {
  const [content, setContent] = useState(
    '### Falcon ERP System Architecture\n\nFalcon ERP enables autonomous operations with:\n- Real-time stock movement audit\n- POS terminal offline resilience\n- Automated ledger reconciliation'
  );
  const [preview, setPreview] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const applyFormat = (prefix, suffix = '') => {
    setContent((prev) => `${prev}\n${prefix}Formatted Text${suffix}`);
  };

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Forms"
        title="Form Editor"
        description="Rich markdown and WYSIWYG editor with live toolbar formatting, code blocks, lists, and preview mode."
      />

      <UIDemoCard
        title="Enterprise Rich Document Editor"
        subtitle="Full formatting toolbar with real-time text transformation."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{preview ? 'Edit Mode' : 'Live Preview'}</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Document</span>
            </button>
          </div>
        }
      >
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Toolbar */}
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-1">
            <button type="button" onClick={() => applyFormat('**', '**')} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer" title="Bold">
              <Bold className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => applyFormat('*', '*')} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer" title="Italic">
              <Italic className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => applyFormat('<u>', '</u>')} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer" title="Underline">
              <Underline className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <button type="button" onClick={() => applyFormat('- ')} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer" title="Bullet List">
              <List className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => applyFormat('1. ')} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => applyFormat('```\n', '\n```')} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 cursor-pointer" title="Code Block">
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Editor Body */}
          {preview ? (
            <div className="p-5 min-h-[220px] bg-white text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-5 text-xs text-slate-800 font-mono leading-relaxed bg-white focus:outline-none resize-y"
            />
          )}
        </div>

        {savedNotice && (
          <div className="mt-3 p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600" />
            <span>Document version saved and indexed for global search.</span>
          </div>
        )}
      </UIDemoCard>
    </div>
  );
};

// 4. FORM PICKER PAGE
export const FormPickerPage = () => {
  const [date, setDate] = useState('2026-10-03');
  const [time, setTime] = useState('09:45');
  const [month, setMonth] = useState('2026-10');

  return (
    <div className="space-y-6">
      <UIPageHeader
        category="Forms"
        title="Form Pickers"
        description="Pickers for date, time, date range, month, and year selectors."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UIDemoCard title="Date Picker" subtitle="Standard ISO date selector.">
          <div className="space-y-2">
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400">Selected date: {date}</p>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Time Picker" subtitle="24-hour and AM/PM time selector.">
          <div className="space-y-2">
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400">Selected time: {time}</p>
          </div>
        </UIDemoCard>

        <UIDemoCard title="Month & Year Picker" subtitle="Fiscal period month selector.">
          <div className="space-y-2">
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400">Fiscal period: {month}</p>
          </div>
        </UIDemoCard>
      </div>
    </div>
  );
};
