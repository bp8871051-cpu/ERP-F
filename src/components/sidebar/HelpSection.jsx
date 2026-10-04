import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  History,
  Layers,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const HelpSection = ({ showText = true }) => {
  const location = useLocation();

  // Discrete independent state for all nested levels
  const [nestedExpanded, setNestedExpanded] = useState({
    multiLevel: false,
    multiLevel2: false,
    multiLevel22: false,
  });

  // Auto-expand parent levels on active child routes without collapsing any already open siblings
  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith('/help/multilevel/2/2')) {
      setNestedExpanded((prev) => ({
        ...prev,
        multiLevel: true,
        multiLevel2: true,
        multiLevel22: true,
      }));
    } else if (path.startsWith('/help/multilevel/2')) {
      setNestedExpanded((prev) => ({
        ...prev,
        multiLevel: true,
        multiLevel2: true,
      }));
    } else if (path.startsWith('/help/multilevel')) {
      setNestedExpanded((prev) => ({
        ...prev,
        multiLevel: true,
      }));
    }
  }, [location.pathname]);

  const toggleLevel = (key) => {
    setNestedExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Active route checks
  const isDocActive = location.pathname === '/help/documentation';
  const isChangelogActive = location.pathname === '/help/changelog';
  const isMultiLevel1Active = location.pathname === '/help/multilevel/1';
  const isMultiLevel21Active = location.pathname === '/help/multilevel/2/1';
  const isMultiLevel221Active = location.pathname === '/help/multilevel/2/2/1';
  const isMultiLevel222Active = location.pathname === '/help/multilevel/2/2/2';
  const isMultiLevel3Active = location.pathname === '/help/multilevel/3';

  // Parent active indicators
  const isMultiLevelRootActive = location.pathname.startsWith('/help/multilevel');
  const isMultiLevel2Active = location.pathname.startsWith('/help/multilevel/2');
  const isMultiLevel22Active = location.pathname.startsWith('/help/multilevel/2/2');

  return (
    <div>
      {/* SECTION HEADER */}
      {showText && (
        <p className="px-2.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 mt-3">
          HELP
        </p>
      )}

      <div className="space-y-0.5">
        {/* ========================================================
            1. DOCUMENTATION (Level 1 - Direct Page)
            ======================================================== */}
        <NavLink
          to="/help/documentation"
          title={!showText ? 'Documentation' : ''}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
            isDocActive
              ? 'text-teal-400 bg-slate-800/90 font-semibold shadow-xs'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          } ${!showText ? 'justify-center' : ''}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <BookOpen
              className={`w-4 h-4 shrink-0 ${
                isDocActive ? 'text-teal-400' : 'text-slate-400'
              }`}
            />
            {showText && <span className="truncate">Documentation</span>}
          </div>
          {showText && (
            <ChevronRight
              className={`w-3.5 h-3.5 shrink-0 ${
                isDocActive ? 'text-teal-400' : 'text-slate-400'
              }`}
            />
          )}
        </NavLink>

        {/* ========================================================
            2. CHANGELOG (Level 1 - Direct Page)
            ======================================================== */}
        <NavLink
          to="/help/changelog"
          title={!showText ? 'Changelog' : ''}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
            isChangelogActive
              ? 'text-teal-400 bg-slate-800/90 font-semibold shadow-xs'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
          } ${!showText ? 'justify-center' : ''}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <History
              className={`w-4 h-4 shrink-0 ${
                isChangelogActive ? 'text-teal-400' : 'text-slate-400'
              }`}
            />
            {showText && <span className="truncate">Changelog</span>}
          </div>
          {showText && (
            <ChevronRight
              className={`w-3.5 h-3.5 shrink-0 ${
                isChangelogActive ? 'text-teal-400' : 'text-slate-400'
              }`}
            />
          )}
        </NavLink>

        {/* ========================================================
            3. MULTI LEVEL (Level 1 - Expandable Root Parent)
            ======================================================== */}
        <div>
          <button
            type="button"
            aria-expanded={nestedExpanded.multiLevel}
            onClick={() => toggleLevel('multiLevel')}
            title={!showText ? 'Multi Level' : ''}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isMultiLevelRootActive
                ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            } ${!showText ? 'justify-center' : ''}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Layers
                className={`w-4 h-4 shrink-0 ${
                  isMultiLevelRootActive ? 'text-teal-400' : 'text-slate-400'
                }`}
              />
              {showText && <span className="truncate">Multi Level</span>}
            </div>
            {showText && (
              nestedExpanded.multiLevel ? (
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isMultiLevelRootActive ? 'text-teal-400' : 'text-slate-400'
                  }`}
                />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )
            )}
          </button>

          {/* LEVEL 2 SUBMENU */}
          <AnimatePresence initial={false}>
            {nestedExpanded.multiLevel && showText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="py-1 space-y-0.5 overflow-hidden"
              >
                {/* 3.1 Multilevel 1 (Level 2 - Child Link) */}
                <NavLink
                  to="/help/multilevel/1"
                  className={`flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                    isMultiLevel1Active
                      ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                      isMultiLevel1Active ? 'bg-teal-400' : 'bg-slate-500'
                    }`}
                  />
                  <span className="truncate">Multilevel 1</span>
                </NavLink>

                {/* 3.2 Multilevel 2 (Level 2 - Expandable Submenu) */}
                <div>
                  <button
                    type="button"
                    aria-expanded={nestedExpanded.multiLevel2}
                    onClick={() => toggleLevel('multiLevel2')}
                    className={`w-full flex items-center justify-between pl-6 pr-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      isMultiLevel2Active
                        ? 'text-white font-semibold bg-slate-800/70'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                          isMultiLevel2Active ? 'bg-teal-400' : 'bg-slate-500'
                        }`}
                      />
                      <span className="truncate">Multilevel 2</span>
                    </div>
                    {nestedExpanded.multiLevel2 ? (
                      <ChevronDown
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isMultiLevel2Active ? 'text-teal-400' : 'text-slate-400'
                        }`}
                      />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {/* LEVEL 3 SUBMENU (Under Multilevel 2) */}
                  <AnimatePresence initial={false}>
                    {nestedExpanded.multiLevel2 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="py-1 space-y-0.5 overflow-hidden"
                      >
                        {/* 3.2.1 Multilevel 2.1 (Level 3 - Child Link) */}
                        <NavLink
                          to="/help/multilevel/2/1"
                          className={`flex items-center gap-2 pl-9 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                            isMultiLevel21Active
                              ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                              isMultiLevel21Active ? 'bg-teal-400' : 'bg-slate-500'
                            }`}
                          />
                          <span className="truncate">Multilevel 2.1</span>
                        </NavLink>

                        {/* 3.2.2 Multilevel 2.2 (Level 3 - Expandable Submenu) */}
                        <div>
                          <button
                            type="button"
                            aria-expanded={nestedExpanded.multiLevel22}
                            onClick={() => toggleLevel('multiLevel22')}
                            className={`w-full flex items-center justify-between pl-9 pr-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                              isMultiLevel22Active
                                ? 'text-white font-semibold bg-slate-800/70'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                                  isMultiLevel22Active ? 'bg-teal-400' : 'bg-slate-500'
                                }`}
                              />
                              <span className="truncate">Multilevel 2.2</span>
                            </div>
                            {nestedExpanded.multiLevel22 ? (
                              <ChevronDown
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isMultiLevel22Active ? 'text-teal-400' : 'text-slate-400'
                                }`}
                              />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </button>

                          {/* LEVEL 4 SUBMENU (Under Multilevel 2.2) */}
                          <AnimatePresence initial={false}>
                            {nestedExpanded.multiLevel22 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.18 }}
                                className="py-1 space-y-0.5 overflow-hidden"
                              >
                                {/* 3.2.2.1 Multilevel 2.2.1 (Level 4 - Child Link) */}
                                <NavLink
                                  to="/help/multilevel/2/2/1"
                                  className={`flex items-center gap-2 pl-12 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                    isMultiLevel221Active
                                      ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                                      isMultiLevel221Active ? 'bg-teal-400' : 'bg-slate-500'
                                    }`}
                                  />
                                  <span className="truncate">Multilevel 2.2.1</span>
                                </NavLink>

                                {/* 3.2.2.2 Multilevel 2.2.2 (Level 4 - Child Link) */}
                                <NavLink
                                  to="/help/multilevel/2/2/2"
                                  className={`flex items-center gap-2 pl-12 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                    isMultiLevel222Active
                                      ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                                      isMultiLevel222Active ? 'bg-teal-400' : 'bg-slate-500'
                                    }`}
                                  />
                                  <span className="truncate">Multilevel 2.2.2</span>
                                </NavLink>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3.3 Multilevel 3 (Level 2 - Child Link) */}
                <NavLink
                  to="/help/multilevel/3"
                  className={`flex items-center gap-2 pl-6 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                    isMultiLevel3Active
                      ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                      isMultiLevel3Active ? 'bg-teal-400' : 'bg-slate-500'
                    }`}
                  />
                  <span className="truncate">Multilevel 3</span>
                </NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;
