import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Phone,
  Video,
  Info,
  Pin,
  SmilePlus,
  Trash2,
  Edit2,
  Reply,
  Check,
  CheckCheck,
  Download,
  FileText,
  Image as ImageIcon,
  Users,
  User,
  Plus,
  X,
  Play,
  Pause,
} from 'lucide-react';
import { chatService } from '../../../services/chatService';
import { useAuth } from '../../../context/AuthContext';

export const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, direct, group
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showInfoSidebar, setShowInfoSidebar] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common emoji list for quick reactions and typing
  const quickEmojis = ['👍', '❤️', '🔥', '🎉', '👏', '🚀', '👀', '💯'];

  // Fetch conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await chatService.getConversations();
      if (res && res.data) {
        setConversations(res.data);
        if (res.data.length > 0 && !activeConversation) {
          setActiveConversation(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation?.id) return;

    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        const res = await chatService.getMessages(activeConversation.id);
        if (res && res.data) {
          setMessages(res.data);
          // Mark conversation as read
          chatService.markRead(activeConversation.id).catch(() => {});
          // Update unread count in conversations state
          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversation.id ? { ...c, unread_count: 0 } : c))
          );
        }
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadMessages();
  }, [activeConversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice recording timer simulation
  useEffect(() => {
    let interval;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Send message handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !replyingTo) return;

    const messageText = newMessage;
    setNewMessage('');

    if (editingMessage) {
      try {
        const res = await chatService.editMessage(editingMessage.id, messageText);
        setMessages((prev) =>
          prev.map((m) => (m.id === editingMessage.id ? { ...m, message: messageText, is_edited: true } : m))
        );
        setEditingMessage(null);
      } catch (err) {
        console.error('Failed to edit message', err);
      }
      return;
    }

    try {
      const payload = {
        message: messageText,
        type: 'text',
        reply_to_id: replyingTo?.id || null,
      };
      setReplyingTo(null);

      const res = await chatService.sendMessage(activeConversation.id, payload);
      if (res && res.data) {
        setMessages((prev) => [...prev, res.data]);
        // Update conversation last message in list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  last_message: {
                    message: messageText,
                    created_at: new Date().toISOString(),
                    user: { name: user?.name || 'You' },
                  },
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Quick reaction handler
  const handleReaction = async (messageId, emoji) => {
    try {
      const res = await chatService.addReaction(messageId, emoji);
      if (res && res.data) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions || [];
            const hasReacted = existing.some((r) => r.user_id === user?.id && r.emoji === emoji);
            let updated;
            if (hasReacted) {
              updated = existing.filter((r) => !(r.user_id === user?.id && r.emoji === emoji));
            } else {
              updated = [...existing, { emoji, user_id: user?.id, user: { name: user?.name } }];
            }
            return { ...m, reactions: updated };
          })
        );
      }
    } catch (err) {
      console.error('Failed to add reaction', err);
    }
  };

  // Pin message handler
  const handlePin = async (messageId) => {
    try {
      const res = await chatService.pinMessage(messageId);
      if (res && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, is_pinned: res.data.is_pinned } : m))
        );
      }
    } catch (err) {
      console.error('Failed to pin message', err);
    }
  };

  // Delete message handler
  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await chatService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  // Send voice note simulation
  const handleSendVoice = async () => {
    setIsRecordingVoice(false);
    try {
      const payload = {
        message: `Voice Note (${recordingSeconds}s)`,
        type: 'voice',
      };
      const res = await chatService.sendMessage(activeConversation.id, payload);
      if (res && res.data) {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to send voice', err);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participants?.some((p) => p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterType === 'direct') return c.type === 'direct';
    if (filterType === 'group') return c.type === 'group';
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-4.25rem)] bg-[#F7F8FA] overflow-hidden">
      {/* 1. LEFT COLUMN: Conversation List */}
      <div className="w-80 sm:w-88 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-slate-800">Messages</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
              {conversations.length} chats
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 py-1 rounded-md transition-colors ${
                filterType === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('direct')}
              className={`flex-1 py-1 rounded-md transition-colors ${
                filterType === 'direct' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Direct
            </button>
            <button
              onClick={() => setFilterType('group')}
              className={`flex-1 py-1 rounded-md transition-colors ${
                filterType === 'group' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading conversations...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isActive = activeConversation?.id === c.id;
              const isGroup = c.type === 'group';

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversation(c)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                    isActive ? 'bg-teal-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Left active line indicator */}
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600" />}

                  {/* Avatar with online status */}
                  <div className="relative shrink-0">
                    <img
                      src={
                        c.avatar ||
                        (isGroup
                          ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120'
                          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120')
                      }
                      alt={c.title}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        c.is_online ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">{c.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {c.last_message?.created_at
                          ? new Date(c.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-slate-500 truncate">
                        {c.last_message?.message || 'Started a conversation'}
                      </p>
                      {c.unread_count > 0 && (
                        <span className="min-w-[18px] h-4 px-1 rounded-full bg-teal-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CENTER COLUMN: Chat Conversation View */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {activeConversation ? (
          <>
            {/* Conversation Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img
                    src={
                      activeConversation.avatar ||
                      (activeConversation.type === 'group'
                        ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120'
                        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120')
                    }
                    alt={activeConversation.title}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      activeConversation.is_online ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{activeConversation.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    {activeConversation.type === 'group'
                      ? `${activeConversation.participants?.length || 4} members`
                      : activeConversation.is_online
                      ? 'Active now'
                      : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 sm:gap-2 text-slate-600">
                <button
                  title="Voice Call"
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  title="Video Call"
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowInfoSidebar(!showInfoSidebar)}
                  title="Conversation Info"
                  className={`p-2 rounded-lg transition-colors ${
                    showInfoSidebar ? 'bg-teal-50 text-teal-700' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pinned Messages Banner (if any) */}
            {messages.some((m) => m.is_pinned) && (
              <div className="bg-amber-50/80 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold text-amber-800 shrink-0">Pinned:</span>
                  <span className="truncate">
                    {messages.find((m) => m.is_pinned)?.message}
                  </span>
                </div>
                <button
                  onClick={() => handlePin(messages.find((m) => m.is_pinned)?.id)}
                  className="text-[10px] text-amber-700 hover:underline shrink-0 ml-2"
                >
                  Unpin
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
              {messagesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <Smile className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.user_id === user?.id;
                  const isVoice = m.type === 'voice';

                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2.5 group ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar on other's messages */}
                      {!isMe && (
                        <img
                          src={
                            m.user?.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={m.user?.name || 'User'}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mt-1 ring-1 ring-slate-200"
                        />
                      )}

                      {/* Message Bubble + Actions */}
                      <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Sender name for groups */}
                        {!isMe && activeConversation.type === 'group' && (
                          <span className="text-[10px] font-semibold text-slate-500 mb-1 ml-1">
                            {m.user?.name || 'Participant'}
                          </span>
                        )}

                        {/* Reply reference bubble if message replies to another */}
                        {m.reply_to && (
                          <div
                            className={`text-[11px] p-2 rounded-lg mb-1 border-l-3 border-teal-500 bg-slate-200/60 text-slate-600 truncate max-w-full`}
                          >
                            <span className="font-semibold block text-[10px] text-teal-800">
                              {m.reply_to.user?.name || 'User'}
                            </span>
                            {m.reply_to.message}
                          </div>
                        )}

                        <div className="relative group/bubble flex items-center gap-1.5">
                          {/* Hover action menu for Me (left side of bubble) */}
                          {isMe && (
                            <div className="opacity-0 group-hover/bubble:opacity-100 flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-lg p-0.5 transition-opacity text-slate-500">
                              <button
                                onClick={() => setReplyingTo(m)}
                                title="Reply"
                                className="p-1 hover:text-teal-600 rounded"
                              >
                                <Reply className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handlePin(m.id)}
                                title={m.is_pinned ? 'Unpin' : 'Pin'}
                                className="p-1 hover:text-amber-600 rounded"
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMessage(m);
                                  setNewMessage(m.message);
                                }}
                                title="Edit"
                                className="p-1 hover:text-blue-600 rounded"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(m.id)}
                                title="Delete"
                                className="p-1 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* The Bubble */}
                          <div
                            className={`p-3 rounded-2xl text-xs relative ${
                              isMe
                                ? 'bg-teal-600 text-white rounded-br-xs shadow-sm'
                                : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-2xs'
                            }`}
                          >
                            {/* Voice player UI */}
                            {isVoice ? (
                              <div className="flex items-center gap-3 py-1">
                                <button
                                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    isMe ? 'bg-teal-700 text-white' : 'bg-teal-50 text-teal-600'
                                  }`}
                                >
                                  <Play className="w-3.5 h-3.5 ml-0.5" />
                                </button>
                                <div className="space-y-1">
                                  <div className="w-28 sm:w-40 h-1.5 bg-slate-300/60 rounded-full overflow-hidden">
                                    <div className="w-1/3 h-full bg-teal-400 rounded-full" />
                                  </div>
                                  <span className={`text-[10px] block ${isMe ? 'text-teal-100' : 'text-slate-400'}`}>
                                    {m.message}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap break-words leading-relaxed">{m.message}</p>
                            )}

                            {/* Attachments preview */}
                            {m.attachments?.length > 0 && (
                              <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-200/40">
                                {m.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] ${
                                      isMe ? 'bg-teal-700/60 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <FileText className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{att.file_name}</span>
                                    </div>
                                    <a
                                      href={att.file_path}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1 hover:opacity-80"
                                    >
                                      <Download className="w-3 h-3" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Footer info: time, edited badge, read receipts */}
                            <div
                              className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                                isMe ? 'text-teal-100' : 'text-slate-400'
                              }`}
                            >
                              {m.is_edited && <span>(edited)</span>}
                              <span>
                                {new Date(m.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isMe && (
                                <span>
                                  {m.reads?.length > 0 ? (
                                    <CheckCheck className="w-3 h-3 text-teal-200" />
                                  ) : (
                                    <Check className="w-3 h-3 text-teal-200" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Hover action menu for Other (right side of bubble) */}
                          {!isMe && (
                            <div className="opacity-0 group-hover/bubble:opacity-100 flex items-center gap-1 bg-white border border-slate-200 shadow-sm rounded-lg p-0.5 transition-opacity text-slate-500">
                              <button
                                onClick={() => setReplyingTo(m)}
                                title="Reply"
                                className="p-1 hover:text-teal-600 rounded"
                              >
                                <Reply className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handlePin(m.id)}
                                title={m.is_pinned ? 'Unpin' : 'Pin'}
                                className="p-1 hover:text-amber-600 rounded"
                              >
                                <Pin className="w-3.5 h-3.5" />
                              </button>
                              <div className="flex items-center gap-0.5 px-1">
                                {['👍', '❤️', '🎉'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(m.id, emoji)}
                                    className="hover:scale-125 transition-transform text-xs"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Reactions row */}
                        {m.reactions?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(
                              m.reactions.reduce((acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(m.id, emoji)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] text-slate-600 shadow-2xs hover:bg-slate-50"
                              >
                                <span>{emoji}</span>
                                <span>{count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Replying banner */}
            {replyingTo && (
              <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2 truncate">
                  <Reply className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    Replying to <strong className="text-teal-700">{replyingTo.user?.name || 'User'}</strong>:
                  </span>
                  <span className="truncate italic text-slate-500">{replyingTo.message}</span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Editing banner */}
            {editingMessage && (
              <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Editing message</span>
                </div>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setNewMessage('');
                  }}
                  className="text-blue-500 hover:text-blue-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
              {isRecordingVoice ? (
                <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-rose-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                    <span className="text-xs font-semibold">Recording voice message... ({recordingSeconds}s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRecordingVoice(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendVoice}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
                    >
                      Send Audio
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  {/* Attach file button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach File"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" />

                  {/* Quick Emoji Picker Toggle */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      title="Insert Emoji"
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 flex gap-1 z-50">
                        {quickEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setNewMessage((prev) => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="p-1 text-sm hover:scale-125 transition-transform cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input field */}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message or press Ctrl+Enter to send..."
                    className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-lg px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />

                  {/* Voice recording button */}
                  <button
                    type="button"
                    onClick={() => setIsRecordingVoice(true)}
                    title="Record Voice Note"
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Send button */}
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`p-2 rounded-lg text-white transition-all cursor-pointer ${
                      newMessage.trim()
                        ? 'bg-teal-600 hover:bg-teal-700 shadow-xs'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>

      {/* 3. RIGHT COLUMN: Conversation Information Panel */}
      {showInfoSidebar && activeConversation && (
        <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          {/* Header Profile */}
          <div className="p-6 text-center border-b border-slate-200">
            <img
              src={
                activeConversation.avatar ||
                (activeConversation.type === 'group'
                  ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=160'
                  : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160')
              }
              alt={activeConversation.title}
              className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-teal-500/20 shadow-xs mb-3"
            />
            <h3 className="text-sm font-bold text-slate-800">{activeConversation.title}</h3>
            <span className="text-[11px] text-slate-400 capitalize block mt-0.5">
              {activeConversation.type} Chat
            </span>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-slate-200 grid grid-cols-2 gap-2 text-center text-xs">
            <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 flex flex-col items-center gap-1">
              <Phone className="w-4 h-4 text-teal-600" />
              <span>Voice</span>
            </button>
            <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700 flex flex-col items-center gap-1">
              <Video className="w-4 h-4 text-teal-600" />
              <span>Video</span>
            </button>
          </div>

          {/* Participants List (for group or direct) */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Participants ({activeConversation.participants?.length || 2})
              </span>
            </div>
            <div className="space-y-2.5">
              {(activeConversation.participants || []).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={p.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={p.user?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-slate-700 font-medium">{p.user?.name || 'User'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 capitalize">{p.role || 'Member'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Attachments */}
          <div className="p-4">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
              Shared Media & Files
            </span>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-100">
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="truncate flex-1">Q3_Financial_Review.pdf</span>
                <span className="text-[10px] text-slate-400">2.4MB</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-100">
                <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate flex-1">Sprint_Board_Mockup.png</span>
                <span className="text-[10px] text-slate-400">1.1MB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
