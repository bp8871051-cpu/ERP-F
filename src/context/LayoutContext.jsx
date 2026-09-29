import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { layoutService } from '../services/layoutService';
import { useAuth } from './AuthContext';

const LayoutContext = createContext(null);

const DEFAULT_PREFERENCES = {
  sidebar_mode: 'default',       // 'default', 'mini', 'hover', 'hidden'
  menu_behavior: 'click',        // 'click', 'hover'
  content_width: 'default',      // 'default', 'full'
  direction: 'ltr',              // 'ltr', 'rtl'
  sidebar_visibility: 'visible', // 'visible', 'hidden'
  sidebar_state: 'expanded',     // 'expanded', 'collapsed'
};

export const LayoutProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // 1. Initial State from localStorage Cache (Instant load without flickering)
  const [preferences, setPreferences] = useState(() => {
    try {
      const cached = localStorage.getItem('erp_layout_preferences');
      if (cached) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(cached) };
      }
    } catch (e) {
      console.warn('Failed to parse cached layout preferences', e);
    }
    return DEFAULT_PREFERENCES;
  });

  const [loading, setLoading] = useState(false);
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const [isHiddenMenuOpen, setIsHiddenMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const saveTimerRef = useRef(null);

  // Sync DOM attributes with layout state (Direction, Sidebar Mode, Content Width)
  useEffect(() => {
    document.documentElement.dir = preferences.direction || 'ltr';
    document.documentElement.setAttribute('data-direction', preferences.direction || 'ltr');
    document.documentElement.setAttribute('data-sidebar-mode', preferences.sidebar_mode || 'default');
    document.documentElement.setAttribute('data-content-width', preferences.content_width || 'default');

    if (preferences.direction === 'rtl') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [preferences.direction, preferences.sidebar_mode, preferences.content_width]);

  // Fetch preferences from MySQL via Laravel API when authenticated
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await layoutService.getLayoutPreferences();
      if (res && res.data) {
        const fresh = {
          sidebar_mode: res.data.sidebar_mode || 'default',
          menu_behavior: res.data.menu_behavior || 'click',
          content_width: res.data.content_width || 'default',
          direction: res.data.direction || 'ltr',
          sidebar_visibility: res.data.sidebar_visibility || 'visible',
          sidebar_state: res.data.sidebar_state || 'expanded',
        };
        setPreferences(fresh);
        localStorage.setItem('erp_layout_preferences', JSON.stringify(fresh));
      }
    } catch (err) {
      console.warn('Layout preferences fetch fallback to cache/defaults:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Debounced save to Laravel REST API and MySQL database
  const persistPreferences = useCallback((newPrefs) => {
    localStorage.setItem('erp_layout_preferences', JSON.stringify(newPrefs));

    if (!isAuthenticated) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        await layoutService.saveLayoutPreferences(newPrefs);
      } catch (err) {
        console.error('Failed to persist layout preferences to database:', err);
      }
    }, 400);
  }, [isAuthenticated]);

  // Core Mutators
  const updatePreference = useCallback((key, value) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      persistPreferences(next);
      return next;
    });
  }, [persistPreferences]);

  const setSidebarMode = useCallback((mode) => {
    updatePreference('sidebar_mode', mode);
  }, [updatePreference]);

  const setMenuBehavior = useCallback((behavior) => {
    updatePreference('menu_behavior', behavior);
  }, [updatePreference]);

  const setContentWidth = useCallback((width) => {
    updatePreference('content_width', width);
  }, [updatePreference]);

  const setDirection = useCallback((dir) => {
    updatePreference('direction', dir);
  }, [updatePreference]);

  const toggleDirection = useCallback(() => {
    setPreferences((prev) => {
      const nextDir = prev.direction === 'rtl' ? 'ltr' : 'rtl';
      const next = { ...prev, direction: nextDir };
      persistPreferences(next);
      return next;
    });
  }, [persistPreferences]);

  // Quick Preset Activator (for cards or route triggers)
  const applyPreset = useCallback((presetKey) => {
    setPreferences((prev) => {
      let next = { ...prev };
      switch (presetKey) {
        case 'mini':
        case 'mini-sidebar':
          next = {
            ...next,
            sidebar_mode: 'mini',
            sidebar_state: 'collapsed',
            sidebar_visibility: 'visible',
          };
          break;
        case 'hover':
        case 'hover-view':
          next = {
            ...next,
            sidebar_mode: 'hover',
            menu_behavior: 'hover',
            sidebar_state: 'collapsed',
            sidebar_visibility: 'visible',
          };
          break;
        case 'hidden':
        case 'hidden-menu':
          next = {
            ...next,
            sidebar_mode: 'hidden',
            sidebar_visibility: 'hidden',
          };
          break;
        case 'full-width':
          next = {
            ...next,
            content_width: 'full',
          };
          break;
        case 'rtl':
          next = {
            ...next,
            direction: 'rtl',
          };
          break;
        case 'default':
        default:
          next = { ...DEFAULT_PREFERENCES };
          break;
      }
      persistPreferences(next);
      return next;
    });
  }, [persistPreferences]);

  // Reset to corporate defaults
  const resetLayout = useCallback(async () => {
    try {
      const res = await layoutService.resetLayoutPreferences();
      if (res && res.data) {
        const fresh = {
          sidebar_mode: res.data.sidebar_mode || 'default',
          menu_behavior: res.data.menu_behavior || 'click',
          content_width: res.data.content_width || 'default',
          direction: res.data.direction || 'ltr',
          sidebar_visibility: res.data.sidebar_visibility || 'visible',
          sidebar_state: res.data.sidebar_state || 'expanded',
        };
        setPreferences(fresh);
        localStorage.setItem('erp_layout_preferences', JSON.stringify(fresh));
      }
    } catch (e) {
      setPreferences(DEFAULT_PREFERENCES);
      localStorage.setItem('erp_layout_preferences', JSON.stringify(DEFAULT_PREFERENCES));
    }
  }, []);

  // Keyboard shortcut listener: ESC closes hidden menu drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsHiddenMenuOpen(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = {
    preferences,
    sidebarMode: preferences.sidebar_mode,
    menuBehavior: preferences.menu_behavior,
    contentWidth: preferences.content_width,
    direction: preferences.direction,
    sidebarVisibility: preferences.sidebar_visibility,
    sidebarState: preferences.sidebar_state,
    isHoverExpanded,
    setIsHoverExpanded,
    isHiddenMenuOpen,
    setIsHiddenMenuOpen,
    isMobileOpen,
    setIsMobileOpen,
    loading,
    setSidebarMode,
    setMenuBehavior,
    setContentWidth,
    setDirection,
    toggleDirection,
    applyPreset,
    resetLayout,
    refreshPreferences: fetchPreferences,
  };

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    return {
      sidebarMode: 'default',
      menuBehavior: 'click',
      contentWidth: 'default',
      direction: 'ltr',
      sidebarVisibility: 'visible',
      sidebarState: 'expanded',
      isHoverExpanded: false,
      setIsHoverExpanded: () => {},
      isHiddenMenuOpen: false,
      setIsHiddenMenuOpen: () => {},
      isMobileOpen: false,
      setIsMobileOpen: () => {},
      setSidebarMode: () => {},
      setContentWidth: () => {},
      setDirection: () => {},
      toggleDirection: () => {},
      applyPreset: () => {},
      resetLayout: () => {},
      refreshPreferences: () => {},
    };
  }
  return context;
};

export default LayoutContext;
