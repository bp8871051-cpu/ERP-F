import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import AuthenticationNavItem from './AuthenticationNavItem';

export const AuthenticationSection = ({ showText = true }) => {
  const location = useLocation();

  // Authentication main parent state (default expanded as required)
  const [isAuthenticationOpen, setIsAuthenticationOpen] = useState(true);

  // Independent expand/collapse state for all 5 Authentication pages
  const [authExpanded, setAuthExpanded] = useState({
    login: false,
    register: false,
    forgotPassword: false,
    resetPassword: false,
    emailVerification: false,
  });

  // Separate sibling accordion states
  const [isErrorPagesOpen, setIsErrorPagesOpen] = useState(false);
  const [isUtilitiesOpen, setIsUtilitiesOpen] = useState(false);

  // Active route detection
  const isAuthActive = location.pathname.startsWith('/authentication');
  const isLoginActive = location.pathname.startsWith('/authentication/login');
  const isRegisterActive = location.pathname.startsWith('/authentication/register');
  const isForgotPasswordActive = location.pathname.startsWith('/authentication/forgot-password');
  const isResetPasswordActive = location.pathname.startsWith('/authentication/reset-password');
  const isEmailVerificationActive = location.pathname.startsWith('/authentication/email-verification');

  const isErrorPagesActive = location.pathname.startsWith('/pages/error');
  const isUtilitiesActive =
    location.pathname.startsWith('/pages/maintenance') ||
    location.pathname.startsWith('/pages/coming-soon');

  // Auto-expansion from active route without closing any already-expanded siblings
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes('/authentication/login')) {
      setAuthExpanded((prev) => ({ ...prev, login: true }));
    } else if (currentPath.includes('/authentication/register')) {
      setAuthExpanded((prev) => ({ ...prev, register: true }));
    } else if (currentPath.includes('/authentication/forgot-password')) {
      setAuthExpanded((prev) => ({ ...prev, forgotPassword: true }));
    } else if (currentPath.includes('/authentication/reset-password')) {
      setAuthExpanded((prev) => ({ ...prev, resetPassword: true }));
    } else if (currentPath.includes('/authentication/email-verification')) {
      setAuthExpanded((prev) => ({ ...prev, emailVerification: true }));
    }
  }, [location.pathname]);

  const toggleAuthItem = (key) => {
    setAuthExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const authItems = [
    {
      key: 'login',
      label: 'Login',
      active: isLoginActive,
      children: [
        { name: 'Cover', path: '/authentication/login/cover' },
        { name: 'Illustration', path: '/authentication/login/illustration' },
        { name: 'Basic', path: '/authentication/login/basic' },
      ],
    },
    {
      key: 'register',
      label: 'Register',
      active: isRegisterActive,
      children: [
        { name: 'Cover', path: '/authentication/register/cover' },
        { name: 'Illustration', path: '/authentication/register/illustration' },
        { name: 'Basic', path: '/authentication/register/basic' },
      ],
    },
    {
      key: 'forgotPassword',
      label: 'Forgot Password',
      active: isForgotPasswordActive,
      children: [
        { name: 'Cover', path: '/authentication/forgot-password/cover' },
        { name: 'Illustration', path: '/authentication/forgot-password/illustration' },
        { name: 'Basic', path: '/authentication/forgot-password/basic' },
      ],
    },
    {
      key: 'resetPassword',
      label: 'Reset Password',
      active: isResetPasswordActive,
      children: [
        { name: 'Cover', path: '/authentication/reset-password/cover' },
        { name: 'Illustration', path: '/authentication/reset-password/illustration' },
        { name: 'Basic', path: '/authentication/reset-password/basic' },
      ],
    },
    {
      key: 'emailVerification',
      label: 'Email Verification',
      active: isEmailVerificationActive,
      children: [
        { name: 'Cover', path: '/authentication/email-verification/cover' },
        { name: 'Illustration', path: '/authentication/email-verification/illustration' },
        { name: 'Basic', path: '/authentication/email-verification/basic' },
      ],
    },
  ];

  return (
    <div>
      {/* PAGES SECTION HEADER */}
      {showText && (
        <p className="px-2.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 mt-3">
          Pages
        </p>
      )}

      <div className="space-y-0.5">
        {/* 1. AUTHENTICATION MAIN PARENT */}
        <div>
          <button
            type="button"
            aria-expanded={isAuthenticationOpen}
            onClick={() => setIsAuthenticationOpen((prev) => !prev)}
            title={!showText ? 'Authentication' : ''}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isAuthActive || isAuthenticationOpen
                ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            } ${!showText ? 'justify-center' : ''}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <UserCheck
                className={`w-4 h-4 shrink-0 ${
                  isAuthActive ? 'text-teal-400' : 'text-slate-400'
                }`}
              />
              {showText && <span className="truncate">Authentication</span>}
            </div>
            {showText && (
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isAuthenticationOpen ? 'transform rotate-180 text-teal-400' : ''
                }`}
              />
            )}
          </button>

          {/* Authentication Child Pages */}
          <AnimatePresence initial={false}>
            {isAuthenticationOpen && showText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-3 pr-1 py-1 space-y-0.5 overflow-hidden"
              >
                {authItems.map((item) => (
                  <AuthenticationNavItem
                    key={item.key}
                    label={item.label}
                    active={item.active}
                    expanded={authExpanded[item.key]}
                    onToggle={() => toggleAuthItem(item.key)}
                    showText={showText}
                    children={item.children}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. ERROR PAGES (SEPARATE SIBLING MODULE) */}
        <div>
          <button
            type="button"
            aria-expanded={isErrorPagesOpen}
            onClick={() => setIsErrorPagesOpen((prev) => !prev)}
            title={!showText ? 'Error Pages' : ''}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isErrorPagesActive
                ? 'text-white bg-slate-800/90 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            } ${!showText ? 'justify-center' : ''}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle
                className={`w-4 h-4 shrink-0 ${
                  isErrorPagesActive ? 'text-teal-400' : 'text-slate-400'
                }`}
              />
              {showText && <span className="truncate">Error Pages</span>}
            </div>
            {showText && (
              isErrorPagesOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )
            )}
          </button>

          <AnimatePresence initial={false}>
            {isErrorPagesOpen && showText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-4 pr-1 py-1 space-y-0.5 overflow-hidden"
              >
                <NavLink
                  to="/pages/error-404"
                  className={({ isActive }) =>
                    `flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      isActive
                        ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`
                  }
                >
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span>404 Error</span>
                </NavLink>
                <NavLink
                  to="/pages/error-500"
                  className={({ isActive }) =>
                    `flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      isActive
                        ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`
                  }
                >
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span>500 Error</span>
                </NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. UTILITIES (SEPARATE SIBLING MODULE) */}
        <div>
          <button
            type="button"
            aria-expanded={isUtilitiesOpen}
            onClick={() => setIsUtilitiesOpen((prev) => !prev)}
            title={!showText ? 'Utilities' : ''}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isUtilitiesActive
                ? 'text-white bg-slate-800/90 font-semibold'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            } ${!showText ? 'justify-center' : ''}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Wrench
                className={`w-4 h-4 shrink-0 ${
                  isUtilitiesActive ? 'text-teal-400' : 'text-slate-400'
                }`}
              />
              {showText && <span className="truncate">Utilities</span>}
            </div>
            {showText && (
              isUtilitiesOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )
            )}
          </button>

          <AnimatePresence initial={false}>
            {isUtilitiesOpen && showText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-4 pr-1 py-1 space-y-0.5 overflow-hidden"
              >
                <NavLink
                  to="/pages/maintenance"
                  className={({ isActive }) =>
                    `flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      isActive
                        ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`
                  }
                >
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span>Under Maintenance</span>
                </NavLink>
                <NavLink
                  to="/pages/coming-soon"
                  className={({ isActive }) =>
                    `flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      isActive
                        ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`
                  }
                >
                  <span className="w-1 h-1 rounded-full bg-slate-500" />
                  <span>Coming Soon</span>
                </NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationSection;
