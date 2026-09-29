import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames = {
  dashboard: 'ERP Overview',
  hrm: 'HRM Dashboard',
  inventory: 'Inventory Dashboard',
  crm: 'CRM Dashboard',
  pos: 'POS Dashboard',
  finance: 'Finance Dashboard',
  sales: 'Sales Dashboard',
  procurement: 'Procurement Dashboard',
  projects: 'Project Dashboard',
  support: 'Support Dashboard',
  applications: 'Applications',
  layouts: 'Layout Settings',
  'mini-sidebar': 'Mini Sidebar',
  'hover-view': 'Hover View',
  'hidden-menu': 'Hidden Menu',
  'full-width': 'Full Width',
  rtl: 'RTL Mode',
};

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center text-xs text-slate-500 py-3 px-4 lg:px-8 border-b border-slate-100 bg-white/60 backdrop-blur-xs select-none">
      <Link to="/app/dashboard" className="flex items-center hover:text-teal-600 transition-colors">
        <Home className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
        <span>ERP</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[value] || value.charAt(0).toUpperCase() + value.slice(1);

        if (value === 'app') return null;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 shrink-0 rtl:rotate-180" />
            {isLast ? (
              <span className="font-semibold text-slate-900">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-teal-600 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
