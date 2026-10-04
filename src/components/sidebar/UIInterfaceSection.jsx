import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  Sparkles,
  FileSpreadsheet,
  Table as TableIcon,
  PieChart,
  Smile,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const UIInterfaceSection = ({ showText = true }) => {
  const location = useLocation();

  // Independent expand/collapse state for all 6 UI sections
  const [uiExpanded, setUiExpanded] = useState({
    baseUI: false,
    advancedUI: false,
    forms: false,
    tables: false,
    charts: false,
    icons: false,
  });

  // Auto-expand active parent on navigation without closing open siblings
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/ui/base')) {
      setUiExpanded((prev) => ({ ...prev, baseUI: true }));
    }
    if (path.startsWith('/ui/advanced')) {
      setUiExpanded((prev) => ({ ...prev, advancedUI: true }));
    }
    if (path.startsWith('/ui/forms')) {
      setUiExpanded((prev) => ({ ...prev, forms: true }));
    }
    if (path.startsWith('/ui/tables')) {
      setUiExpanded((prev) => ({ ...prev, tables: true }));
    }
    if (path.startsWith('/ui/charts')) {
      setUiExpanded((prev) => ({ ...prev, charts: true }));
    }
    if (path.startsWith('/ui/icons')) {
      setUiExpanded((prev) => ({ ...prev, icons: true }));
    }
  }, [location.pathname]);

  const toggleSection = (key) => {
    setUiExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const sections = [
    {
      key: 'baseUI',
      label: 'Base UI',
      icon: Boxes,
      routePrefix: '/ui/base',
      items: [
        { name: 'Alerts', path: '/ui/base/alerts' },
        { name: 'Accordion', path: '/ui/base/accordion' },
        { name: 'Avatar', path: '/ui/base/avatar' },
        { name: 'Badges', path: '/ui/base/badges' },
        { name: 'Buttons', path: '/ui/base/buttons' },
        { name: 'Button Group', path: '/ui/base/button-group' },
        { name: 'Breadcrumb', path: '/ui/base/breadcrumb' },
        { name: 'Card', path: '/ui/base/card' },
        { name: 'Colors', path: '/ui/base/colors' },
        { name: 'Collapse', path: '/ui/base/collapse' },
        { name: 'Dropdowns', path: '/ui/base/dropdowns' },
        { name: 'Grid', path: '/ui/base/grid' },
        { name: 'Images', path: '/ui/base/images' },
        { name: 'Modals', path: '/ui/base/modals' },
        { name: 'Offcanvas', path: '/ui/base/offcanvas' },
        { name: 'Pagination', path: '/ui/base/pagination' },
        { name: 'Popovers', path: '/ui/base/popovers' },
        { name: 'Progress', path: '/ui/base/progress' },
        { name: 'Tabs', path: '/ui/base/tabs' },
        { name: 'Typography', path: '/ui/base/typography' },
      ],
    },
    {
      key: 'advancedUI',
      label: 'Advanced UI',
      icon: Sparkles,
      routePrefix: '/ui/advanced',
      items: [
        { name: 'Dragula', path: '/ui/advanced/dragula' },
        { name: 'Clipboard', path: '/ui/advanced/clipboard' },
        { name: 'Range Slider', path: '/ui/advanced/range-slider' },
        { name: 'Lightbox', path: '/ui/advanced/lightbox' },
      ],
    },
    {
      key: 'forms',
      label: 'Forms',
      icon: FileSpreadsheet,
      routePrefix: '/ui/forms',
      items: [
        { name: 'Form Elements', path: '/ui/forms/elements' },
        { name: 'Select2', path: '/ui/forms/select2' },
        { name: 'Form Editor', path: '/ui/forms/editor' },
        { name: 'Form Picker', path: '/ui/forms/picker' },
      ],
    },
    {
      key: 'tables',
      label: 'Tables',
      icon: TableIcon,
      routePrefix: '/ui/tables',
      items: [
        { name: 'Basic Tables', path: '/ui/tables/basic' },
        { name: 'Data Table', path: '/ui/tables/data' },
      ],
    },
    {
      key: 'charts',
      label: 'Charts',
      icon: PieChart,
      routePrefix: '/ui/charts',
      items: [
        { name: 'Apex Charts', path: '/ui/charts/apex' },
        { name: 'Chart Js', path: '/ui/charts/chart-js' },
      ],
    },
    {
      key: 'icons',
      label: 'Icons',
      icon: Smile,
      routePrefix: '/ui/icons',
      items: [
        { name: 'Fontawesome Icons', path: '/ui/icons/fontawesome' },
        { name: 'Tabler Icons', path: '/ui/icons/tabler' },
        { name: 'Lucide', path: '/ui/icons/lucide' },
        { name: 'Phosphor', path: '/ui/icons/phosphor' },
      ],
    },
  ];

  return (
    <div>
      {/* SECTION HEADER */}
      {showText && (
        <p className="px-2.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 mt-3">
          UI Interface
        </p>
      )}

      <div className="space-y-0.5">
        {sections.map((section) => {
          const Icon = section.icon;
          const isSectionActive = location.pathname.startsWith(section.routePrefix);
          const isExpanded = uiExpanded[section.key];

          return (
            <div key={section.key}>
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => toggleSection(section.key)}
                title={!showText ? section.label : ''}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSectionActive
                    ? 'text-white bg-slate-800/90 font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                } ${!showText ? 'justify-center' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSectionActive ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  {showText && <span className="truncate">{section.label}</span>}
                </div>
                {showText && (
                  isExpanded ? (
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSectionActive ? 'text-teal-400' : 'text-slate-400'
                      }`}
                    />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && showText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pl-4 pr-1 py-1 space-y-0.5 overflow-hidden"
                  >
                    {section.items.map((sub) => {
                      const isSubActive = location.pathname === sub.path;

                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                            isSubActive
                              ? 'text-teal-400 font-semibold bg-slate-800/80 shadow-xs'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                              isSubActive ? 'bg-teal-400' : 'bg-slate-500'
                            }`}
                          />
                          <span className="truncate">{sub.name}</span>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UIInterfaceSection;
