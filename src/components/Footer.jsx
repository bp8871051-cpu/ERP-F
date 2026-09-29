import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-4 px-4 lg:px-8 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-700">Falcon ERP Enterprise</span>
        <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
      </div>
      <div className="flex items-center gap-4 text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-medium">All Systems Operational</span>
        </span>
        <span>•</span>
        <span>Version 2.4.0-enterprise</span>
      </div>
    </footer>
  );
};

export default Footer;
