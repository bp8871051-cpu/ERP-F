import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';

export const AuthenticationNavItem = ({
  label,
  expanded,
  active,
  onToggle,
  showText = true,
  children = [],
}) => {
  return (
    <div className="w-full">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        title={!showText ? label : ''}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
          active
            ? 'text-teal-400 font-semibold'
            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
        } ${!showText ? 'justify-center' : ''}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
              active ? 'bg-teal-400' : 'bg-slate-400'
            }`}
          />
          {showText && <span className="truncate">{label}</span>}
        </div>
        {showText && (
          expanded ? (
            <ChevronDown
              className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-teal-400' : 'text-slate-400'}`}
            />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && showText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="pl-4 pr-1 py-0.5 space-y-0.5 overflow-hidden"
          >
            {children.map((sub) => (
              <NavLink
                key={sub.path}
                to={sub.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-3 pr-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isActive
                      ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`w-1 h-1 rounded-full shrink-0 ${
                        isActive ? 'bg-teal-400' : 'bg-slate-500'
                      }`}
                    />
                    <span className="truncate">{sub.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthenticationNavItem;
