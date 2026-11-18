import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Maximize2,
  Users,
  ChevronLeft,
  Circle,
  Hash,
  Sparkles,
  Building,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

// Distinct color styling for each department badge
const getDepartmentBadgeStyle = (dept) => {
  const d = String(dept || '').toLowerCase();
  if (d.includes('sales')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (d.includes('finance')) return 'bg-amber-50 text-amber-800 border-amber-200';
  if (d.includes('hr') || d.includes('human')) return 'bg-purple-50 text-purple-800 border-purple-200';
  if (d.includes('eng') || d.includes('tech') || d.includes('dev')) return 'bg-blue-50 text-blue-800 border-blue-200';
  if (d.includes('operat') || d.includes('store')) return 'bg-cyan-50 text-cyan-800 border-cyan-200';
  if (d.includes('admin') || d.includes('super')) return 'bg-indigo-50 text-indigo-800 border-indigo-200';
  return 'bg-teal-50 text-teal-800 border-teal-200';
};

const ERP_DEPARTMENTS = [
  'General',
  'Sales',
  'Marketing',
  'Finance',
  'Human Resources',
  'Operations',
  'Engineering',
  'IT Support',
  'Procurement',
  'Administration',
];

export const FloatingChatWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'users'
  const [colleagues, setColleagues] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);

  // Department state for posting messages
  const userDept = typeof user?.department === 'string'
    ? user.department
    : (user?.department?.name || user?.department_name || user?.role || 'General');
  const [selectedDepartment, setSelectedDepartment] = useState(userDept);

  // Sync default user department when user loads
  useEffect(() => {
    if (userDept) {
      setSelectedDepartment(userDept);
    }
  }, [userDept]);

  const messagesEndRef = useRef(null);

  // Listen for external trigger from topbar or actions
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('toggle-floating-chat', handleToggle);
    window.addEventListener('open-floating-chat', handleOpen);
    return () => {
      window.removeEventListener('toggle-floating-chat', handleToggle);
      window.removeEventListener('open-floating-chat', handleOpen);
    };
  }, []);

  // Hide widget if already on the dedicated full-screen chat page
  const isFullChatPage = location.pathname.startsWith('/app/applications/chat');

  // Load conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await chatService.getConversations();
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setConversations(list);

      const unread = list.reduce((acc, c) => acc + (c.unread_count || 0), 0);
      setTotalUnread(unread);

      // Auto-select General Chat if none selected, or pick the first
      setActiveConversation((prev) => {
        if (prev && list.some((c) => c.id === prev.id)) {
          return prev;
        }
        const general = list.find((c) =>
          c.title?.toLowerCase().includes('general')
        ) || list[0] || null;
        return general;
      });
    } catch (err) {
      console.error('Failed to load floating chat conversations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load colleagues for direct chat
  const fetchColleagues = useCallback(async () => {
    try {
      const res = await chatService.getUsers();
      const userList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setColleagues(userList);
    } catch (err) {
      console.error('Failed to load colleagues', err);
    }
  }, []);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      setMessagesLoading(true);
      const res = await chatService.getMessages(convId);
      const msgList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setMessages(msgList);
    } catch (err) {
      console.error('Failed to fetch messages for conversation', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Fetch immediately whenever widget opens or user updates
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      fetchColleagues();
    }
  }, [isOpen, fetchConversations, fetchColleagues]);

  // Load messages when active conversation changes or widget opens
  useEffect(() => {
    if (isOpen && activeConversation?.id) {
      fetchMessages(activeConversation.id);
    }
  }, [isOpen, activeConversation?.id, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Periodic polling for active chat when widget is open (every 12 seconds)
  useEffect(() => {
    if (!isOpen || !activeConversation?.id) return;
    const interval = setInterval(() => {
      chatService.getMessages(activeConversation.id).then((res) => {
        const msgList = Array.isArray(res?.data) ? res.data : [];
        if (msgList.length !== messages.length) {
          setMessages(msgList);
        }
      }).catch(() => {});
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen, activeConversation?.id, messages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let targetConv = activeConversation;

    // If no active conversation, find or fallback to general chat
    if (!targetConv?.id) {
      targetConv = conversations.find((c) =>
        c.title?.toLowerCase().includes('general')
      ) || conversations[0];
    }

    if (!targetConv?.id) return;

    const body = newMessage.trim();
    setNewMessage('');

    // Sender's chosen department badge
    const deptToPost = selectedDepartment || userDept || 'Staff';

    // Optimistic message
    const tempMsg = {
      id: Date.now(),
      conversation_id: targetConv.id,
      user_id: user?.id,
      user: {
        id: user?.id,
        name: user?.name,
        department: deptToPost,
        role: user?.role,
      },
      message: body,
      type: 'text',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await chatService.sendMessage(targetConv.id, {
        message: body,
        department: deptToPost,
      });
      if (res && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? res.data : m))
        );
      }
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const startDirectChat = async (targetUser) => {
    try {
      setLoading(true);
      const res = await chatService.createConversation({
        type: 'direct',
        participant_ids: [targetUser.id],
      });
      if (res && res.data) {
        await fetchConversations();
        setActiveConversation(res.data);
        setActiveTab('chats');
      }
    } catch (err) {
      console.error('Failed to create direct chat', err);
    } finally {
      setLoading(false);
    }
  };

  const selectGeneralChat = async () => {
    setActiveTab('chats');
    let general = conversations.find((c) =>
      c.title?.toLowerCase().includes('general')
    );
    if (!general && conversations.length > 0) {
      general = conversations[0];
    }
    if (general) {
      setActiveConversation(general);
    } else {
      await fetchConversations();
    }
  };

  if (isFullChatPage) {
    return null;
  }

  // Conversation to display or fallback
  const currentChat = activeConversation || conversations.find((c) =>
    c.title?.toLowerCase().includes('general')
  ) || conversations[0];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Popup Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-96 max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-5rem)] mb-3 bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden ring-1 ring-black/5"
          >
            {/* Widget Header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 px-4 py-3 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-white tracking-wide truncate">Falcon Team Chat</h3>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-medium">All Roles</span>
                  </div>
                  <p className="text-[10.5px] text-teal-100/90 truncate">
                    {currentChat ? currentChat.title : 'Enterprise Discussion'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    navigate('/app/applications/chat');
                    setIsOpen(false);
                  }}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                  title="Open Full Screen Chat"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                  title="Close Quick Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Navigation Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs font-medium shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={selectGeneralChat}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    currentChat?.title?.toLowerCase().includes('general') && activeTab === 'chats'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                  title="Company-wide General Chat"
                >
                  <Hash className="w-3 h-3" />
                  <span>General Chat</span>
                </button>

                <button
                  onClick={() => setActiveTab('chats')}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    activeTab === 'chats'
                      ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Conversations
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Colleagues ({colleagues.length})
                </button>
              </div>

              {activeConversation && activeTab === 'chats' && (
                <button
                  onClick={() => setActiveConversation(null)}
                  className="text-[10.5px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>All</span>
                </button>
              )}
            </div>

            {/* Body Content */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#F9FAFB]">
              {/* Tab: Colleagues Directory */}
              {activeTab === 'users' ? (
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 mb-2 px-1">
                    Direct Message by Team Member & Department
                  </div>
                  {colleagues.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">Loading colleagues...</div>
                  ) : (
                    colleagues.map((colleague) => {
                      const colleagueDept = colleague.department || colleague.role || 'Staff';
                      return (
                        <div
                          key={colleague.id}
                          onClick={() => startDirectChat(colleague)}
                          className="p-2.5 bg-white border border-slate-200/80 rounded-xl hover:border-teal-400 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={colleague.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                              alt={colleague.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-slate-800 group-hover:text-teal-700 truncate">
                                {colleague.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold border ${getDepartmentBadgeStyle(colleagueDept)}`}>
                                  {colleagueDept}
                                </span>
                              </div>
                            </div>
                          </div>
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
                        </div>
                      );
                    })
                  )}
                </div>
              ) : !activeConversation && conversations.length > 0 ? (
                /* Tab: Conversation List (Only when explicitly browsing all conversations) */
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setActiveConversation(c)}
                      className="p-3 hover:bg-slate-50 flex items-start gap-2.5 cursor-pointer transition-colors"
                    >
                      <img
                        src={c.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100'}
                        alt={c.title}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-slate-800 truncate">{c.title}</h4>
                          {c.title?.toLowerCase().includes('general') && (
                            <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shrink-0">
                              All Roles
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {c.last_message?.message || 'Start messaging...'}
                        </p>
                      </div>
                      {c.unread_count > 0 && (
                        <span className="min-w-[16px] h-4 px-1 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Active Conversation Messages Feed + Persistent Message Input */
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messagesLoading ? (
                      <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                        <span>Loading messages...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-slate-300" />
                        <p className="font-medium text-slate-600">No messages in this channel yet.</p>
                        <p className="text-[11px] text-slate-400">
                          Type your message below to start the conversation!
                        </p>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isMe = m.user_id === user?.id;
                        const msgDept = m.user?.department || m.user?.role || 'General';

                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          >
                            {/* Sender Name and Department Badge on every message */}
                            <div className={`flex items-center gap-1.5 mb-1 ${isMe ? 'mr-1 flex-row-reverse' : 'ml-1'}`}>
                              <span className="text-[10.5px] font-bold text-slate-700">
                                {isMe ? 'You' : (m.user?.name || 'Member')}
                              </span>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold border shadow-2xs ${getDepartmentBadgeStyle(
                                  msgDept
                                )}`}
                              >
                                {msgDept}
                              </span>
                            </div>

                            {/* Message Bubble */}
                            <div
                              className={`p-2.5 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                                isMe
                                  ? 'bg-teal-600 text-white rounded-br-xs shadow-2xs'
                                  : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-2xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{m.message}</p>
                              <div
                                className={`text-[9px] mt-1 text-right ${
                                  isMe ? 'text-teal-100' : 'text-slate-400'
                                }`}
                              >
                                {m.created_at
                                  ? new Date(m.created_at).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* DEPARTMENT SENDER IDENTITY BAR */}
                  <div className="px-3 py-1.5 bg-slate-100/90 border-t border-slate-200/90 flex items-center justify-between text-[11px] shrink-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-500 font-medium">Posting as:</span>
                      <span className="font-bold text-slate-800 truncate">{user?.name || 'Member'}</span>
                      <span className="text-slate-400">•</span>

                      {/* Interactive Department Badge / Switcher */}
                      <div className="relative group flex items-center">
                        <span
                          className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-all ${getDepartmentBadgeStyle(
                            selectedDepartment
                          )}`}
                          title="Click to change your posting department"
                        >
                          <Building className="w-2.5 h-2.5 shrink-0" />
                          <span>{selectedDepartment}</span>
                          <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                        </span>

                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer text-xs"
                          title="Select Department"
                        >
                          <option value={userDept}>{userDept} (My Department)</option>
                          {ERP_DEPARTMENTS.filter((d) => d !== userDept).map((dept) => (
                            <option key={dept} value={dept}>
                              {dept} Department
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <span className="text-[10px] text-teal-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                      #{currentChat?.title || 'General Chat'}
                    </span>
                  </div>

                  {/* QUICK MESSAGE INPUT FORM */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder={`Write message as ${user?.name || 'Member'} (${selectedDepartment})...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                      title="Send message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-xl shadow-teal-700/25 border-2 border-white cursor-pointer relative hover:brightness-105 transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/30"
        title="Falcon Enterprise Chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default FloatingChatWidget;
