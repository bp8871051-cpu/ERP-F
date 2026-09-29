import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';
import { useLayout } from '../context/LayoutContext';

export const AppLayout = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { direction, contentWidth, sidebarMode } = useLayout();

  return (
    <div
      dir={direction}
      className={`h-screen w-full bg-[#F7F8FA] flex ${
        direction === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row text-left'
      } font-sans text-slate-800 antialiased overflow-hidden`}
    >
      {/* Reusable Enterprise Sidebar (Static / Fixed on Left) */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Column (Independent Scrollable Container) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        <Topbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <Breadcrumb />

        <main
          className={`flex-1 p-3 sm:p-4 lg:p-6 transition-all duration-200 ${
            contentWidth === 'full' ? 'w-full max-w-none' : 'w-full max-w-7xl mx-auto'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
