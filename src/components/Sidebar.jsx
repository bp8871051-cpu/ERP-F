import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Boxes,
  Briefcase,
  Store,
  DollarSign,
  TrendingUp,
  Truck,
  FolderKanban,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building2,
  X,
  ExternalLink,
  Layers,
  MessageSquare,
  PhoneCall,
  Calendar as CalendarIcon,
  Mail,
  FolderClosed,
  FileText,
  CheckSquare,
  GitPullRequest,
  Sliders,
  Minimize2,
  Maximize2,
  MousePointer,
  EyeOff,
  MoveLeft,
  Check,
  Award,
  Scale,
  Package,
  ArrowRightLeft,
  Warehouse as WarehouseIcon,
  Tag,
  ShoppingCart,
  ShoppingBag,
  RefreshCw,
  Receipt,
  FileSpreadsheet,
  Banknote,
  RotateCcw,
  Undo2,
  BarChart3,
  PieChart,
  ClipboardList,
  LayoutTemplate,
  Wallet,
  Percent,
  GraduationCap,
  UserCheck,
  UserPlus,
  Gift,
  CreditCard,
  Barcode,
  QrCode,
  Printer,
  TrendingDown,
  Wrench,
  Trash2,
  BookOpen,
  Ticket,
  Puzzle,
  Lock,
  Bell,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import AuthenticationSection from './sidebar/AuthenticationSection';
import UIInterfaceSection from './sidebar/UIInterfaceSection';
import HelpSection from './sidebar/HelpSection';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const {
    sidebarMode,
    contentWidth,
    direction,
    isHoverExpanded,
    setIsHoverExpanded,
    isHiddenMenuOpen,
    setIsHiddenMenuOpen,
    isMobileOpen,
    setIsMobileOpen,
    applyPreset,
  } = useLayout();

  // Accordion state
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isAppsOpen, setIsAppsOpen] = useState(() => {
    const saved = localStorage.getItem('erp_apps_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isLayoutsOpen, setIsLayoutsOpen] = useState(() => {
    const saved = localStorage.getItem('erp_layouts_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isStockOpen, setIsStockOpen] = useState(() => {
    const saved = localStorage.getItem('erp_stock_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSalesOpen, setIsSalesOpen] = useState(() => {
    const saved = localStorage.getItem('erp_sales_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(() => {
    const saved = localStorage.getItem('erp_purchase_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isFinanceOpen, setIsFinanceOpen] = useState(() => {
    const saved = localStorage.getItem('erp_finance_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isHrmOpen, setIsHrmOpen] = useState(() => {
    const saved = localStorage.getItem('erp_hrm_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isCrmOpen, setIsCrmOpen] = useState(() => {
    const saved = localStorage.getItem('erp_crm_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isPosOpen, setIsPosOpen] = useState(() => {
    const saved = localStorage.getItem('erp_pos_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isAssetsOpen, setIsAssetsOpen] = useState(() => {
    const saved = localStorage.getItem('erp_assets_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(() => {
    const saved = localStorage.getItem('erp_documents_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSupportOpen, setIsSupportOpen] = useState(() => {
    const saved = localStorage.getItem('erp_support_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isMembershipOpen, setIsMembershipOpen] = useState(() => {
    const saved = localStorage.getItem('erp_membership_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSystemOpen, setIsSystemOpen] = useState(() => {
    const saved = localStorage.getItem('erp_system_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(() => {
    const saved = localStorage.getItem('erp_settings_open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSupportOpen = () => {
    setIsSupportOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_support_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleMembershipOpen = () => {
    setIsMembershipOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_membership_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleSystemOpen = () => {
    setIsSystemOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_system_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleSettingsOpen = () => {
    setIsSettingsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_settings_open', JSON.stringify(next));
      return next;
    });
  };

  const togglePosOpen = () => {
    setIsPosOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_pos_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleAssetsOpen = () => {
    setIsAssetsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_assets_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleDocumentsOpen = () => {
    setIsDocumentsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_documents_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleCrmOpen = () => {
    setIsCrmOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_crm_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleAppsOpen = () => {
    setIsAppsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_apps_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleLayoutsOpen = () => {
    setIsLayoutsOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_layouts_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleStockOpen = () => {
    setIsStockOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_stock_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleSalesOpen = () => {
    setIsSalesOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_sales_open', JSON.stringify(next));
      return next;
    });
  };

  const togglePurchaseOpen = () => {
    setIsPurchaseOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_purchase_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleFinanceOpen = () => {
    setIsFinanceOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_finance_open', JSON.stringify(next));
      return next;
    });
  };

  const toggleHrmOpen = () => {
    setIsHrmOpen((prev) => {
      const next = !prev;
      localStorage.setItem('erp_hrm_open', JSON.stringify(next));
      return next;
    });
  };

  const rawDashboardItems = [
    { name: 'HRM Dashboard', path: '/app/hrm', icon: Users, perm: 'hrm.view' },
    { name: 'Inventory Dashboard', path: '/app/inventory', icon: Boxes, perm: 'inventory.view' },
    { name: 'CRM Dashboard', path: '/app/crm', icon: Briefcase, perm: 'crm.view' },
    { name: 'POS Dashboard', path: '/app/pos', icon: Store, perm: 'pos.view' },
    { name: 'Finance Dashboard', path: '/app/finance', icon: DollarSign, perm: 'finance.view' },
    { name: 'Sales Dashboard', path: '/app/sales', icon: TrendingUp, perm: 'sales.view' },
    { name: 'Procurement Dashboard', path: '/app/procurement', icon: Truck, perm: 'procurement.view' },
    { name: 'Project Dashboard', path: '/app/projects', icon: FolderKanban, perm: 'projects.view' },
    { name: 'Support Dashboard', path: '/app/support', icon: LifeBuoy, perm: 'support.view' },
  ];
  const dashboardItems = rawDashboardItems.filter(item => !item.perm || (hasPermission && hasPermission(item.perm)));

  const applicationItems = [
    { name: 'Chat', path: '/app/applications/chat', icon: MessageSquare },
    { name: 'Calls', path: '/app/applications/calls', icon: PhoneCall, hasSub: true },
    { name: 'Calendar', path: '/app/applications/calendar', icon: CalendarIcon },
    { name: 'Email', path: '/app/applications/email', icon: Mail },
    { name: 'File Manager', path: '/app/applications/files', icon: FolderClosed },
    { name: 'Notes', path: '/app/applications/notes', icon: FileText },
    { name: 'To Do', path: '/app/applications/todo', icon: CheckSquare },
    { name: 'Workflow & Approvals', path: '/app/applications/workflows', icon: GitPullRequest },
  ];

  const layoutItems = [
    { name: 'Mini Sidebar', path: '/app/layouts/mini-sidebar', icon: Minimize2, key: 'mini', activeCheck: sidebarMode === 'mini' },
    { name: 'Hover View', path: '/app/layouts/hover-view', icon: MousePointer, key: 'hover', activeCheck: sidebarMode === 'hover' },
    { name: 'Hidden Menu', path: '/app/layouts/hidden-menu', icon: EyeOff, key: 'hidden', activeCheck: sidebarMode === 'hidden' },
    { name: 'Full Width', path: '/app/layouts/full-width', icon: Maximize2, key: 'full-width', activeCheck: contentWidth === 'full' },
    { name: 'RTL', path: '/app/layouts/rtl', icon: MoveLeft, key: 'rtl', activeCheck: direction === 'rtl' },
  ];

  const inventoryItems = [
    { name: 'Products', path: '/app/inventory/products', icon: Package },
    { name: 'Categories', path: '/app/inventory/categories', icon: Layers },
    { name: 'Brands', path: '/app/inventory/brands', icon: Award },
    { name: 'Units', path: '/app/inventory/units', icon: Scale },
    { name: 'Inventory', path: '/app/inventory/stock', icon: Boxes },
    { name: 'Suppliers', path: '/app/inventory/suppliers', icon: Truck },
    { name: 'Warehouse', path: '/app/inventory/warehouses', icon: WarehouseIcon },
  ];

  const stockSubItems = [
    { name: 'Manage Stock', path: '/app/inventory/stock/manage', icon: Boxes },
    { name: 'Stock Adjustment', path: '/app/inventory/stock/adjustment', icon: Sliders },
    { name: 'Stock Transfer', path: '/app/inventory/stock/transfer', icon: ArrowRightLeft },
  ];

  const salesItems = [
    { name: 'Customers', path: '/app/sales/customers', icon: Users },
    { name: 'Sales Orders', path: '/app/sales/orders', icon: ShoppingCart },
    { name: 'Recurring Invoices', path: '/app/sales/recurring-invoices', icon: RefreshCw },
    { name: 'Invoice Templates', path: '/app/sales/invoice-templates', icon: LayoutTemplate },
    { name: 'Credit Notes', path: '/app/sales/credit-notes', icon: Receipt },
    { name: 'Sales Quotes', path: '/app/sales/quotes', icon: FileSpreadsheet },
    { name: 'Cash Sales', path: '/app/sales/cash-sales', icon: Banknote },
    { name: 'Refunds', path: '/app/sales/refunds', icon: RotateCcw },
    { name: 'Delivery Notes', path: '/app/sales/delivery-notes', icon: Truck },
    { name: 'Sales Analytics', path: '/app/sales/analytics', icon: BarChart3 },
  ];

  const crmItems = [
    { name: 'Contacts', path: '/app/crm/contacts', icon: Users },
    { name: 'Leads', path: '/app/crm/leads', icon: UserPlus },
    { name: 'Deals', path: '/app/crm/deals', icon: Briefcase },
    { name: 'Pipeline', path: '/app/crm/pipeline', icon: FolderKanban },
    { name: 'Campaigns', path: '/app/crm/campaigns', icon: Tag },
    { name: 'Customer Feedback', path: '/app/crm/customer-feedback', icon: MessageSquare },
    { name: 'Customer Analytics', path: '/app/crm/customer-analytics', icon: BarChart3 },
  ];

  const purchaseItems = [
    { name: 'Purchases', path: '/app/purchase/purchases', icon: ShoppingBag },
    { name: 'Purchase Orders', path: '/app/purchase/orders', icon: ClipboardList },
    { name: 'Purchase Return', path: '/app/purchase/returns', icon: Undo2 },
    { name: 'Vendors', path: '/app/purchase/vendors', icon: Building2 },
    { name: 'Procurement Analytics', path: '/app/purchase/analytics', icon: PieChart },
  ];

  const financeItems = [
    { name: 'Finance Dashboard', path: '/app/finance', icon: DollarSign, end: true },
    { name: 'Expenses', path: '/app/finance/expenses', icon: Receipt },
    { name: 'Expense Category', path: '/app/finance/expense-categories', icon: Layers },
    { name: 'Payments', path: '/app/finance/payments', icon: CreditCard },
    { name: 'Cashflow', path: '/app/finance/cashflow', icon: Wallet },
    { name: 'Budgeting', path: '/app/finance/budgeting', icon: PieChart },
    { name: 'Taxes', path: '/app/finance/taxes', icon: Percent },
    { name: 'Reports', path: '/app/finance/reports', icon: FileSpreadsheet },
  ];

  const hrmItems = [
    { name: 'HRM Dashboard', path: '/app/hrm', icon: Users, end: true },
    { name: 'Employees', path: '/app/hrm/employees', icon: Users },
    { name: 'Departments', path: '/app/hrm/departments', icon: Building2 },
    { name: 'Designations / Roles', path: '/app/hrm/designations', icon: Briefcase },
    { name: 'Attendance', path: '/app/hrm/attendance', icon: UserCheck },
    { name: 'Leave', path: '/app/hrm/leave', icon: CalendarIcon },
    { name: 'Holidays', path: '/app/hrm/holidays', icon: Gift },
    { name: 'Payroll', path: '/app/hrm/payroll', icon: Banknote },
    { name: 'Recruitment', path: '/app/hrm/recruitment', icon: UserPlus },
    { name: 'Performance & Appraisal', path: '/app/hrm/performance', icon: Award },
    { name: 'Training & Development', path: '/app/hrm/training', icon: GraduationCap },
    { name: 'HR Analytics', path: '/app/hrm/analytics', icon: BarChart3 },
  ];

  const posItems = [
    { name: 'POS', path: '/app/pos/terminal', icon: Store },
    { name: 'POS Orders', path: '/app/pos/orders', icon: Receipt },
  ];

  const assetItems = [
    { name: 'Asset Register', path: '/app/assets/register', icon: Boxes },
    { name: 'Assignments', path: '/app/assets/assignments', icon: UserCheck },
    { name: 'Depreciation', path: '/app/assets/depreciation', icon: TrendingDown },
    { name: 'Maintenance', path: '/app/assets/maintenance', icon: Wrench },
    { name: 'Disposal', path: '/app/assets/disposal', icon: Trash2 },
    { name: 'Asset Analytics', path: '/app/assets/analytics', icon: BarChart3 },
  ];

  const documentItems = [
    { name: 'Document Repository', path: '/app/documents/repository', icon: FolderClosed },
    { name: 'Policies & Manuals', path: '/app/documents/policies', icon: BookOpen },
    { name: 'Compliance Docs', path: '/app/documents/compliance', icon: Scale },
    { name: 'Document Workflows', path: '/app/documents/workflows', icon: GitPullRequest },
  ];

  const supportItems = [
    { name: 'Contact Messages', path: '/app/support/contact-messages', icon: MessageSquare },
    { name: 'Tickets', path: '/app/support/tickets', icon: Ticket },
    { name: 'Knowledge Base', path: '/app/support/knowledge-base', icon: BookOpen },
    { name: 'SLA Management', path: '/app/support/sla', icon: Clock },
  ];

  const membershipItems = [
    { name: 'Membership Plans', path: '/app/membership/plans', icon: Package },
    { name: 'Membership Addons', path: '/app/membership/addons', icon: Puzzle },
    { name: 'Transactions', path: '/app/membership/transactions', icon: Receipt },
  ];

  const systemItems = [
    { name: 'User Management', path: '/app/system/users', icon: Users },
    { name: 'Roles & Permissions', path: '/app/system/roles', icon: Shield },
    { name: 'Delete Requests', path: '/app/system/delete-requests', icon: Trash2 },
  ];

  const settingsSubItems = [
    { name: 'General', path: '/app/system/settings/general', icon: Building2 },
    { name: 'Security', path: '/app/system/settings/security', icon: Lock },
    { name: 'Notifications', path: '/app/system/settings/notifications', icon: Bell },
    { name: 'Integrations', path: '/app/system/settings/integrations', icon: Puzzle },
  ];

  const isAnyDashboardActive = dashboardItems.some((item) => location.pathname === item.path);
  const isAnyAppActive = applicationItems.some((item) => location.pathname.startsWith(item.path));
  const isAnyLayoutActive = location.pathname.startsWith('/app/layouts');
  const isAnyStockActive = [
    '/app/inventory/stock/manage',
    '/app/inventory/stock/adjustment',
    '/app/inventory/stock/transfer',
  ].some((p) => location.pathname.startsWith(p));
  const isAnySalesActive = location.pathname.startsWith('/app/sales');
  const isAnyCrmActive = location.pathname.startsWith('/app/crm') && location.pathname !== '/app/crm';
  const isAnyPurchaseActive = location.pathname.startsWith('/app/purchase');
  const isAnyFinanceActive = location.pathname.startsWith('/app/finance');
  const isAnyHrmActive = location.pathname.startsWith('/app/hrm');
  const isAnyPosActive = location.pathname.startsWith('/app/pos');
  const isAnyAssetsActive = location.pathname.startsWith('/app/assets');
  const isAnyDocumentsActive = location.pathname.startsWith('/app/documents');
  const isAnySupportActive = location.pathname.startsWith('/app/support');
  const isAnyMembershipActive = location.pathname.startsWith('/app/membership');
  const isAnySystemActive = location.pathname.startsWith('/app/system') && !location.pathname.startsWith('/app/system/settings');
  const isAnySettingsActive = location.pathname.startsWith('/app/system/settings');

  // Auto-expand submenus if user navigates to their routes
  useEffect(() => {
    if (isAnyAppActive && !isAppsOpen) {
      setIsAppsOpen(true);
    }
    if (isAnyLayoutActive && !isLayoutsOpen) {
      setIsLayoutsOpen(true);
    }
    if (isAnyStockActive && !isStockOpen) {
      setIsStockOpen(true);
    }
    if (isAnySalesActive && !isSalesOpen) {
      setIsSalesOpen(true);
    }
    if (isAnyCrmActive && !isCrmOpen) {
      setIsCrmOpen(true);
    }
    if (isAnyPurchaseActive && !isPurchaseOpen) {
      setIsPurchaseOpen(true);
    }
    if (isAnyFinanceActive && !isFinanceOpen) {
      setIsFinanceOpen(true);
    }
    if (isAnyHrmActive && !isHrmOpen) {
      setIsHrmOpen(true);
    }
    if (isAnyPosActive && !isPosOpen) {
      setIsPosOpen(true);
    }
    if (isAnyAssetsActive && !isAssetsOpen) {
      setIsAssetsOpen(true);
    }
    if (isAnyDocumentsActive && !isDocumentsOpen) {
      setIsDocumentsOpen(true);
    }
    if (isAnySupportActive && !isSupportOpen) {
      setIsSupportOpen(true);
    }
    if (isAnyMembershipActive && !isMembershipOpen) {
      setIsMembershipOpen(true);
    }
    if (isAnySystemActive && !isSystemOpen) {
      setIsSystemOpen(true);
    }
    if (isAnySettingsActive && !isSettingsOpen) {
      setIsSettingsOpen(true);
    }
  }, [
    location.pathname,
    isAnyAppActive,
    isAnyLayoutActive,
    isAnyStockActive,
    isAnySalesActive,
    isAnyCrmActive,
    isAnyPurchaseActive,
    isAnyFinanceActive,
    isAnyHrmActive,
    isAnyPosActive,
    isAnyAssetsActive,
    isAnyDocumentsActive,
    isAnySupportActive,
    isAnyMembershipActive,
    isAnySystemActive,
    isAnySettingsActive,
  ]);

  // Determine if sidebar is currently in compact/icon-only display
  const isMiniMode = sidebarMode === 'mini';
  const isHoverMode = sidebarMode === 'hover';
  const isEffectivelyCompact = (isMiniMode || (isHoverMode && !isHoverExpanded) || isCollapsed);

  // Render Inner Content of Sidebar
  const renderSidebarContent = (inDrawer = false) => {
    const showText = inDrawer || !isEffectivelyCompact;

    return (
      <div className="flex flex-col h-full bg-[#1E293B] text-slate-300 select-none overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-700/60 shrink-0">
          <NavLink to="/app/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
              F
            </div>
            {showText && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-wide text-white flex items-center gap-1.5 truncate">
                  Falcon ERP
                  <span className="text-[10px] font-semibold uppercase bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30">
                    PRO
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 truncate">Enterprise Suite</span>
              </div>
            )}
          </NavLink>

          {/* Close button inside Drawer */}
          {inDrawer && (
            <button
              onClick={() => {
                setIsMobileOpen(false);
                setIsHiddenMenuOpen(false);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Body */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
          {/* MAIN SECTION */}
          <div>
            {showText && (
              <p className="px-2.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5">
                Main
              </p>
            )}

            {/* ERP Overview Link */}
            <NavLink
              to="/app/dashboard"
              title={!showText ? 'ERP Overview' : ''}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${!showText ? 'justify-center' : ''}`
              }
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${!showText ? 'text-teal-400' : ''}`} />
              {showText && <span className="truncate">ERP Overview</span>}
            </NavLink>

            {/* 1. Dashboard Submenu Trigger */}
            <button
              onClick={() => setIsDashboardOpen(!isDashboardOpen)}
              title={!showText ? 'Dashboard' : ''}
              className={`w-full flex items-center justify-between px-2.5 py-2 mt-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isAnyDashboardActive
                  ? 'text-white bg-slate-800/80 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${!showText ? 'justify-center' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Building2 className={`w-4 h-4 shrink-0 ${isAnyDashboardActive ? 'text-teal-400' : 'text-slate-400'}`} />
                {showText && <span className="truncate">Dashboard</span>}
              </div>
              {showText && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isDashboardOpen ? 'transform rotate-180 text-teal-400' : ''
                  }`}
                />
              )}
            </button>

            {/* Dashboard Items */}
            <AnimatePresence initial={false}>
              {isDashboardOpen && showText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-3 pr-1 py-1 space-y-0.5 overflow-hidden"
                >
                  {dashboardItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                          isActive
                            ? 'bg-teal-600 text-white font-semibold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2. Applications Submenu Trigger */}
            <button
              onClick={toggleAppsOpen}
              title={!showText ? 'Applications' : ''}
              className={`w-full flex items-center justify-between px-2.5 py-2 mt-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isAnyAppActive
                  ? 'text-white bg-slate-800/80 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${!showText ? 'justify-center' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Layers className={`w-4 h-4 shrink-0 ${isAnyAppActive ? 'text-teal-400' : 'text-slate-400'}`} />
                {showText && <span className="truncate">Applications</span>}
              </div>
              {showText && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isAppsOpen ? 'transform rotate-180 text-teal-400' : ''
                  }`}
                />
              )}
            </button>

            {/* Applications Items */}
            <AnimatePresence initial={false}>
              {isAppsOpen && showText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-3 pr-1 py-1 space-y-0.5 overflow-hidden"
                >
                  {applicationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                          isActive
                            ? 'bg-teal-600 text-white font-semibold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.hasSub && (
                          <ChevronRight className={`w-3 h-3 shrink-0 ${isActive ? 'text-teal-100' : 'text-slate-500'}`} />
                        )}
                      </NavLink>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Layouts Submenu Trigger */}
            <button
              onClick={toggleLayoutsOpen}
              title={!showText ? 'Layouts' : ''}
              className={`w-full flex items-center justify-between px-2.5 py-2 mt-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isAnyLayoutActive
                  ? 'text-white bg-slate-800/80 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              } ${!showText ? 'justify-center' : ''}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Sliders className={`w-4 h-4 shrink-0 ${isAnyLayoutActive ? 'text-teal-400' : 'text-slate-400'}`} />
                {showText && <span className="truncate">Layouts</span>}
              </div>
              {showText && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isLayoutsOpen ? 'transform rotate-180 text-teal-400' : ''
                  }`}
                />
              )}
            </button>

            {/* Layouts Items */}
            <AnimatePresence initial={false}>
              {isLayoutsOpen && showText && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-3 pr-1 py-1 space-y-0.5 overflow-hidden"
                >
                  {/* Settings overview link */}
                  <NavLink
                    to="/app/layouts"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>Layout Overview</span>
                  </NavLink>

                  {/* 5 Preset Layouts */}
                  {layoutItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || item.activeCheck;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => applyPreset(item.key)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                          isActive
                            ? 'bg-teal-600/30 text-teal-300 font-semibold border border-teal-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                        )}
                      </NavLink>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* INVENTORY SECTION */}
          {(!hasPermission || hasPermission('inventory.view')) && (
            <div>
              {showText && (
                <p className="px-2.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 flex items-center justify-between">
                  <span>Inventory</span>
                </p>
              )}

              {/* Inventory Direct Links */}
              <div className="space-y-0.5">
                {inventoryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.end
                    ? location.pathname === item.path
                    : location.pathname === item.path || (item.path !== '/app/inventory' && location.pathname.startsWith(item.path));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={!showText ? item.name : ''}
                      className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      } ${!showText ? 'justify-center' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {showText && <span className="truncate">{item.name}</span>}
                    </NavLink>
                  );
                })}

                {/* Stock ▼ Submenu Trigger */}
                <button
                  onClick={toggleStockOpen}
                  title={!showText ? 'Stock' : ''}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isAnyStockActive
                      ? 'text-white bg-slate-800/80 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  } ${!showText ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ArrowRightLeft className={`w-4 h-4 shrink-0 ${isAnyStockActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    {showText && <span className="truncate">Stock</span>}
                  </div>
                  {showText && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isStockOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  )}
                </button>

                {/* Stock Submenu Items */}
                <AnimatePresence initial={false}>
                  {isStockOpen && showText && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-3 pr-1 py-1 space-y-0.5 overflow-hidden"
                    >
                      {stockSubItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);

                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                              isActive
                                ? 'bg-teal-600/30 text-teal-300 font-semibold border border-teal-500/30'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                              <span className="truncate">{item.name}</span>
                            </div>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                            )}
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* SALES SECTION */}
          {(!hasPermission || hasPermission('sales.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    Sales
                  </span>
                  <button
                    onClick={toggleSalesOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isSalesOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isSalesOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {salesItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* CRM SECTION */}
          {(!hasPermission || hasPermission('crm.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    CRM
                  </span>
                  <button
                    onClick={toggleCrmOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isCrmOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isCrmOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {crmItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* PURCHASE SECTION */}
          {(!hasPermission || hasPermission('procurement.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    Purchase
                  </span>
                  <button
                    onClick={togglePurchaseOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isPurchaseOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isPurchaseOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {purchaseItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* FINANCE SECTION */}
          {(!hasPermission || hasPermission('finance.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    Finance
                  </span>
                  <button
                    onClick={toggleFinanceOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isFinanceOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isFinanceOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {financeItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.end
                        ? location.pathname === item.path
                        : location.pathname === item.path || (item.path !== '/app/finance' && location.pathname.startsWith(item.path));

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* HRM SECTION */}
          {(!hasPermission || hasPermission('hrm.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    HRM
                  </span>
                  <button
                    onClick={toggleHrmOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isHrmOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isHrmOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {hrmItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.end
                        ? location.pathname === item.path
                        : location.pathname === item.path || (item.path !== '/app/hrm' && location.pathname.startsWith(item.path));

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* POS SECTION */}
          {(!hasPermission || hasPermission('pos.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    POS
                  </span>
                  <button
                    onClick={togglePosOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isPosOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isPosOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {posItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ASSETS SECTION */}
          {(!hasPermission || hasPermission('assets.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    Assets
                  </span>
                  <button
                    onClick={toggleAssetsOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isAssetsOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isAssetsOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {assetItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* DOCUMENTS SECTION */}
          {(!hasPermission || hasPermission('documents.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    Documents
                  </span>
                  <button
                    onClick={toggleDocumentsOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isDocumentsOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isDocumentsOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {documentItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-teal-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* SUPPORT SECTION */}
          {(!hasPermission || hasPermission('support.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5 mt-3">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    Support
                  </span>
                  <button
                    onClick={toggleSupportOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isSupportOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isSupportOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {supportItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-teal-400'
                              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* MEMBERSHIP SECTION */}
          {(!hasPermission || hasPermission('membership.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5 mt-3">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    Membership
                  </span>
                  <button
                    onClick={toggleMembershipOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isMembershipOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isMembershipOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {membershipItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-teal-400'
                              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* SYSTEM SECTION */}
          {(!hasPermission || hasPermission('users.view')) && (
            <div>
              {showText ? (
                <div className="flex items-center justify-between px-2.5 mb-1.5 mt-3">
                  <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                    System
                  </span>
                  <button
                    onClick={toggleSystemOpen}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isSystemOpen ? 'transform rotate-180 text-teal-400' : ''
                      }`}
                    />
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {(isSystemOpen || !showText) && (
                  <motion.div
                    initial={showText ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {systemItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          title={!showText ? item.name : ''}
                          className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-teal-400'
                              : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                          } ${!showText ? 'justify-center' : ''}`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}

                    {/* Nested Expandable Settings Menu */}
                    <div>
                      <button
                        onClick={toggleSettingsOpen}
                        title={!showText ? 'Settings' : ''}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isAnySettingsActive
                            ? 'text-white bg-slate-800/90 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        } ${!showText ? 'justify-center' : ''}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Sliders className={`w-4 h-4 shrink-0 ${isAnySettingsActive ? 'text-teal-400' : 'text-slate-400'}`} />
                          {showText && <span className="truncate">Settings</span>}
                        </div>
                        {showText && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                              isSettingsOpen ? 'transform rotate-180 text-teal-400' : ''
                            }`}
                          />
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {isSettingsOpen && showText && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-4 pr-1 py-1 space-y-0.5 overflow-hidden"
                          >
                            {settingsSubItems.map((sub) => {
                              const SubIcon = sub.icon;
                              const isSubActive = location.pathname === sub.path;

                              return (
                                <NavLink
                                  key={sub.path}
                                  to={sub.path}
                                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                    isSubActive
                                      ? 'bg-teal-600 text-white font-semibold shadow-xs'
                                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                  }`}
                                >
                                  <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                                  <span className="truncate">{sub.name}</span>
                                </NavLink>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* PAGES & AUTHENTICATION SECTION */}
          <AuthenticationSection showText={showText} />

          {/* UI INTERFACE SECTION */}
          <UIInterfaceSection showText={showText} />

          {/* HELP SECTION */}
          <HelpSection showText={showText} />
        </div>

        {/* User Footer Profile */}
        <div className="p-2.5 border-t border-slate-700/60 bg-slate-900/60 shrink-0">
          <div className={`flex items-center gap-2.5 px-1.5 py-1 ${!showText ? 'justify-center' : ''}`}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-500/50 shrink-0"
            />
            {showText && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</span>
                <span className="text-[10px] text-slate-400 truncate">{user?.role || 'Super Admin'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 1. HIDDEN MENU MODE: Desktop static sidebar is NOT rendered
  if (sidebarMode === 'hidden') {
    return (
      <AnimatePresence>
        {(isHiddenMenuOpen || isMobileOpen) && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsHiddenMenuOpen(false);
                setIsMobileOpen(false);
              }}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs cursor-pointer"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: direction === 'rtl' ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: direction === 'rtl' ? 280 : -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className={`relative w-72 max-w-[85vw] h-full shadow-2xl z-10 ${
                direction === 'rtl' ? 'mr-auto' : 'ml-0'
              }`}
            >
              {renderSidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // 2. HOVER VIEW MODE: Compact by default (72px), expands smoothly on hover (256px)
  if (sidebarMode === 'hover') {
    return (
      <>
        {/* Placeholder spacer so main content doesn't jump */}
        <div className="hidden lg:block w-[72px] shrink-0" />

        {/* Floating/Elevated Hover Sidebar */}
        <aside
          onMouseEnter={() => setIsHoverExpanded(true)}
          onMouseLeave={() => setIsHoverExpanded(false)}
          className={`hidden lg:block fixed top-0 bottom-0 z-40 transition-all duration-250 ease-in-out shadow-lg ${
            direction === 'rtl' ? 'right-0' : 'left-0'
          } ${isHoverExpanded ? 'w-64 shadow-2xl ring-1 ring-slate-700/50' : 'w-[72px]'}`}
        >
          {renderSidebarContent(false)}
        </aside>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs cursor-pointer"
              />
              <motion.div
                initial={{ x: direction === 'rtl' ? 280 : -280 }}
                animate={{ x: 0 }}
                exit={{ x: direction === 'rtl' ? 280 : -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                className={`relative w-72 max-w-[85vw] h-full shadow-2xl z-10 ${
                  direction === 'rtl' ? 'mr-auto' : 'ml-0'
                }`}
              >
                {renderSidebarContent(true)}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // 3. MINI SIDEBAR MODE or DEFAULT MODE
  const desktopWidth = isMiniMode ? 'w-[72px]' : isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-full transition-all duration-200 z-30 ${desktopWidth}`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ x: direction === 'rtl' ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: direction === 'rtl' ? 280 : -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className={`relative w-72 max-w-[85vw] h-full shadow-2xl z-10 ${
                direction === 'rtl' ? 'mr-auto' : 'ml-0'
              }`}
            >
              {renderSidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
