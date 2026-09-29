import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Building,
  Check,
  ExternalLink,
  PhoneCall,
  Calendar,
  Mail,
  FolderClosed,
  FileText,
  CheckSquare,
  GitPullRequest,
  CheckCheck,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { notificationService } from '../services/notificationService';
import { searchService } from '../services/searchService';

export const Topbar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout, companies, currentCompany, switchCompany } = useAuth();
  const {
    sidebarMode,
    direction,
    toggleDirection,
    setIsHiddenMenuOpen,
    setIsMobileOpen,
  } = useLayout();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English (US)');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Live notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const companyRef = useRef(null);
  const profileRef = useRef(null);
  const notifyRef = useRef(null);
  const langRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch real notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unread_count ?? res.data.filter((n) => !n.is_read).length);
      }
    } catch (e) {
      // Fallback fallback if endpoint empty
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchService.search(searchQuery);
        if (res && res.results) {
          setSearchResults(res.results);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (companyRef.current && !companyRef.current.contains(e.target)) setIsCompanyDropdownOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileDropdownOpen(false);
      if (notifyRef.current && !notifyRef.current.contains(e.target)) setIsNotificationsOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setIsLangOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = ['English (US)', 'Spanish (ES)', 'French (FR)', 'German (DE)', 'Arabic (AR)'];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left controls: Toggle & Company selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Menu button for Mobile OR when Sidebar is in Hidden Menu mode */}
        <button
          onClick={() => {
            if (sidebarMode === 'hidden') {
              setIsHiddenMenuOpen(true);
            } else {
              setIsMobileOpen(true);
            }
          }}
          className={`${
            sidebarMode === 'hidden' ? 'flex' : 'lg:hidden flex'
          } p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors`}
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        {/* Desktop collapse toggle (when NOT hidden) */}
        {sidebarMode !== 'hidden' && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Company Selector Dropdown */}
        <div className="relative" ref={companyRef}>
          <button
            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-teal-600" />
            <span>{currentCompany?.name || 'Falcon LLP'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isCompanyDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Select Active Organization
              </div>
              <div className="mt-1 space-y-0.5">
                {(companies.length > 0 ? companies : [{ id: 1, name: 'Falcon LLP' }, { id: 2, name: 'Apex Global Technologies' }]).map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      switchCompany(comp);
                      setIsCompanyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      currentCompany?.id === comp.id ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{comp.name}</span>
                    {currentCompany?.id === comp.id && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Bar with keyboard shortcut badge & live results */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative" ref={searchRef}>
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              if (searchResults.length > 0) setIsSearchOpen(true);
            }}
            placeholder="Search messages, emails, files, tasks, events..."
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-14 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
            Ctrl K
          </kbd>
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchOpen && (searchQuery.trim().length >= 2 || isSearching) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>Search Results</span>
              {isSearching && <span className="text-teal-600 animate-pulse text-[10px]">Searching...</span>}
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching results found for "{searchQuery}"
              </div>
            ) : (
              <div className="divide-y divide-slate-50 mt-1">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate(item.url);
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-50 rounded-lg flex items-start gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      {item.type === 'chat' && <MessageSquare className="w-3.5 h-3.5" />}
                      {item.type === 'task' && <CheckSquare className="w-3.5 h-3.5" />}
                      {item.type === 'email' && <Mail className="w-3.5 h-3.5" />}
                      {item.type === 'file' && <FolderClosed className="w-3.5 h-3.5" />}
                      {item.type === 'note' && <FileText className="w-3.5 h-3.5" />}
                      {item.type === 'calendar' && <Calendar className="w-3.5 h-3.5" />}
                      {item.type === 'workflow' && <GitPullRequest className="w-3.5 h-3.5" />}
                      {!['chat','task','email','file','note','calendar','workflow'].includes(item.type) && (
                        <Search className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-600 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-100 shrink-0">
                          {item.type}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Language"
          >
            <Globe className="w-4 h-4" />
          </button>
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setCurrentLang(lang);
                    setIsLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
                    currentLang === lang ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Layout Settings Shortcut */}
        <button
          onClick={() => navigate('/app/layouts')}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          title="Layout Settings"
        >
          <Sliders className="w-4 h-4 text-slate-500" />
        </button>

        {/* Centralized Notifications Dropdown */}
        <div className="relative" ref={notifyRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-88 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">ERP Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="mt-2 divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isRead = !!n.is_read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.action_url) {
                            setIsNotificationsOpen(false);
                            navigate(n.action_url);
                          }
                        }}
                        className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors flex items-start justify-between gap-2.5 ${
                          !isRead ? 'bg-teal-50/40 hover:bg-teal-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />}
                            <p className={`text-xs truncate ${!isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                              {n.title}
                            </p>
                          </div>
                          {n.message && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 pl-3">
                              {n.message}
                            </p>
                          )}
                          <span className="text-[10px] text-slate-400 mt-1 block pl-3">
                            {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                        {!isRead && (
                          <button
                            onClick={(e) => handleMarkRead(n.id, e)}
                            title="Mark as read"
                            className="p-1 text-slate-400 hover:text-teal-600 rounded cursor-pointer shrink-0"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filament Admin Portal shortcut button */}
        <a
          href="http://localhost:8000/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100 text-xs font-medium transition-colors"
          title="Open Filament Admin Panel"
        >
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span>Admin</span>
        </a>

        {/* User Profile Menu */}
        <div className="relative pl-1" ref={profileRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Administrator'}</span>
              <span className="text-[10px] text-slate-500">{user?.role || 'Super Admin'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name || 'Alexander Wright'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@falconerp.com'}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                  {user?.role || 'Super Admin'}
                </span>
              </div>

              <div className="py-1">
                <a
                  href="http://localhost:8000/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Filament Admin Panel</span>
                </a>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
