import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Send,
  FileEdit,
  Star,
  AlertOctagon,
  Trash2,
  ShieldAlert,
  Search,
  Plus,
  Paperclip,
  Reply,
  Forward,
  MoreVertical,
  Check,
  Download,
  Mail,
  ArrowLeft,
  X,
  FileText,
  CornerUpLeft,
  CornerUpRight,
} from 'lucide-react';
import { emailService } from '../../../services/emailService';
import { useAuth } from '../../../context/AuthContext';

export const EmailPage = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [folderCounts, setFolderCounts] = useState({ inbox: 0, sent: 0, drafts: 0, starred: 0, important: 0, trash: 0, spam: 0 });
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
  });
  const [showCc, setShowCc] = useState(false);

  // Reply / Forward quick bar state
  const [replyText, setReplyText] = useState('');

  // Folders list definition
  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox },
    { id: 'sent', name: 'Sent', icon: Send },
    { id: 'drafts', name: 'Drafts', icon: FileEdit },
    { id: 'starred', name: 'Starred', icon: Star },
    { id: 'important', name: 'Important', icon: AlertOctagon },
    { id: 'spam', name: 'Spam', icon: ShieldAlert },
    { id: 'trash', name: 'Trash', icon: Trash2 },
  ];

  // Load emails
  const loadEmails = async (folder = activeFolder) => {
    try {
      setLoading(true);
      const res = await emailService.getEmails({ folder });
      if (res && res.data) {
        setEmails(res.data);
        if (res.data.length > 0 && !selectedEmail) {
          setSelectedEmail(res.data[0]);
        } else if (res.data.length === 0) {
          setSelectedEmail(null);
        }
      }
      if (res && res.counts) {
        setFolderCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load emails', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails(activeFolder);
  }, [activeFolder]);

  // Select email & toggle read
  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      try {
        await emailService.toggleRead(email.id);
        setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, is_read: true } : e)));
        setFolderCounts((prev) => ({ ...prev, inbox: Math.max(0, prev.inbox - 1) }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Toggle star
  const handleToggleStar = async (emailId, e) => {
    e.stopPropagation();
    try {
      const res = await emailService.toggleStar(emailId);
      setEmails((prev) =>
        prev.map((item) => (item.id === emailId ? { ...item, is_starred: !item.is_starred } : item))
      );
      if (selectedEmail?.id === emailId) {
        setSelectedEmail((prev) => ({ ...prev, is_starred: !prev.is_starred }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete email
  const handleDelete = async (emailId) => {
    try {
      await emailService.deleteEmail(emailId);
      setEmails((prev) => prev.filter((item) => item.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      await emailService.sendEmail({
        to: composeData.to.split(',').map((s) => s.trim()),
        cc: composeData.cc ? composeData.cc.split(',').map((s) => s.trim()) : [],
        subject: composeData.subject,
        body: composeData.body,
      });
      setIsComposeOpen(false);
      setComposeData({ to: '', cc: '', bcc: '', subject: '', body: '' });
      loadEmails('sent');
      setActiveFolder('sent');
    } catch (err) {
      console.error('Failed to send email', err);
    }
  };

  // Quick reply
  const handleQuickReply = async () => {
    if (!replyText.trim() || !selectedEmail) return;
    try {
      await emailService.replyEmail(selectedEmail.id, { body: replyText });
      setReplyText('');
      alert('Reply transmitted successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  // Search filter
  const filteredEmails = emails.filter((em) => {
    const query = searchQuery.toLowerCase();
    return (
      em.subject?.toLowerCase().includes(query) ||
      em.sender_name?.toLowerCase().includes(query) ||
      em.sender_email?.toLowerCase().includes(query) ||
      em.body?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-[calc(100vh-4.25rem)] bg-[#F7F8FA] overflow-hidden">
      {/* 1. LEFT SIDEBAR: Email Folders & Compose */}
      <div className="w-56 sm:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 p-3 sm:p-4">
        {/* Compose Button */}
        <button
          onClick={() => setIsComposeOpen(true)}
          className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mb-5"
        >
          <Plus className="w-4 h-4" />
          <span>Compose Email</span>
        </button>

        {/* Folders navigation */}
        <div className="space-y-1">
          {folders.map((f) => {
            const Icon = f.icon;
            const isActive = activeFolder === f.id;
            const count = folderCounts[f.id] || 0;

            return (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFolder(f.id);
                  setSelectedEmail(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{f.name}</span>
                </div>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Storage status footer */}
        <div className="mt-auto pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="flex justify-between mb-1">
            <span>Mailbox quota</span>
            <span className="font-semibold text-slate-600">4.2 GB / 25 GB</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-[17%] h-full bg-teal-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* 2. CENTER: Email List */}
      <div className="w-80 sm:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Search header */}
        <div className="p-3 sm:p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
          <div className="flex items-center justify-between mt-2.5 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {activeFolder} ({filteredEmails.length})
            </span>
          </div>
        </div>

        {/* Email list items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading emails...</span>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No emails found in this folder
            </div>
          ) : (
            filteredEmails.map((item) => {
              const isSelected = selectedEmail?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectEmail(item)}
                  className={`p-3.5 cursor-pointer transition-colors relative ${
                    isSelected ? 'bg-teal-50/60' : 'hover:bg-slate-50'
                  } ${!item.is_read ? 'bg-slate-50/70 font-semibold' : ''}`}
                >
                  {/* Selected left indicator bar */}
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600" />}

                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs text-slate-800 truncate">
                      {item.sender_name || item.sender_email}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={(e) => handleToggleStar(item.id, e)}
                        className={`p-0.5 cursor-pointer ${
                          item.is_starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-slate-500'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs text-slate-900 truncate mb-0.5">{item.subject}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 font-normal">{item.body}</p>

                  {/* Attachment badge */}
                  {item.attachments?.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400 font-normal">
                      <Paperclip className="w-3 h-3" />
                      <span>{item.attachments.length} attachment(s)</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. RIGHT / MAIN: Email Detail View */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {selectedEmail ? (
          <>
            {/* Action Bar */}
            <div className="h-14 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStar(selectedEmail.id, { stopPropagation: () => {} })}
                  className={`p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer ${
                    selectedEmail.is_starred ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(selectedEmail.id)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setComposeData({
                      to: selectedEmail.sender_email,
                      cc: '',
                      bcc: '',
                      subject: `Re: ${selectedEmail.subject}`,
                      body: `\n\n--- Original Message ---\n${selectedEmail.body}`,
                    });
                    setIsComposeOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => {
                    setComposeData({
                      to: '',
                      cc: '',
                      bcc: '',
                      subject: `Fwd: ${selectedEmail.subject}`,
                      body: `\n\n--- Forwarded Message ---\nFrom: ${selectedEmail.sender_name} <${selectedEmail.sender_email}>\nDate: ${selectedEmail.created_at}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`,
                    });
                    setIsComposeOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <CornerUpRight className="w-3.5 h-3.5" />
                  <span>Forward</span>
                </button>
              </div>
            </div>

            {/* Email Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Title */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedEmail.subject}</h2>
              </div>

              {/* Sender Details */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center">
                    {selectedEmail.sender_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{selectedEmail.sender_name}</span>
                      <span className="text-[11px] text-slate-400">&lt;{selectedEmail.sender_email}&gt;</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      To: {selectedEmail.recipients?.map((r) => r.email).join(', ') || 'me'}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(selectedEmail.created_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Email Body */}
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedEmail.body}
              </div>

              {/* Attachments Section (if any) */}
              {selectedEmail.attachments?.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                    Attached Files ({selectedEmail.attachments.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedEmail.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-xs font-semibold text-slate-800 block truncate">
                              {att.file_name}
                            </span>
                            <span className="text-[10px] text-slate-400">{(att.file_size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                        <a
                          href={att.file_path}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Reply Box */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Quick Response</h4>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 focus-within:bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                  <textarea
                    rows={3}
                    placeholder={`Reply to ${selectedEmail.sender_name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleQuickReply}
                      disabled={!replyText.trim()}
                      className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Mail className="w-12 h-12 text-slate-300 mb-2" />
            <p className="text-sm font-medium">Select an email to view details</p>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">New Message</h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-3 flex-1 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">To</label>
                  <button
                    type="button"
                    onClick={() => setShowCc(!showCc)}
                    className="text-[11px] text-teal-600 font-semibold hover:underline"
                  >
                    {showCc ? 'Hide CC' : 'Add CC'}
                  </button>
                </div>
                <input
                  type="email"
                  required
                  placeholder="recipient@falconerp.com"
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {showCc && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">CC</label>
                  <input
                    type="text"
                    placeholder="finance@falconerp.com, admin@falconerp.com"
                    value={composeData.cc}
                    onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Budget Approvals and Forecast"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Message Body</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Compose your enterprise correspondence..."
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>Attach Document</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Send Message
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

export default EmailPage;
