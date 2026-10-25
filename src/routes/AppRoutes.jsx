import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';

import LoginPage from '../pages/auth/LoginPage';
import AuthPageViewer from '../pages/auth/AuthPageViewer';
import SpecialPage from '../pages/system/SpecialPages';
import AccessDeniedPage from '../pages/system/AccessDeniedPage';
import MainDashboard from '../pages/dashboard/MainDashboard';
import HrmDashboard from '../pages/hrm/HrmDashboard';
import InventoryDashboard from '../pages/inventory/InventoryDashboard';
import CrmDashboard from '../pages/crm/CrmDashboard';
import PosDashboard from '../pages/pos/PosDashboard';
import FinanceDashboard from '../pages/finance/FinanceDashboard';
import ProjectDashboard from '../pages/projects/ProjectDashboard';
import SupportDashboard from '../pages/support/SupportDashboard';

// Enterprise Role-Specific Dashboards
import ServiceEngineerDashboard from '../pages/dashboards/ServiceEngineerDashboard';
import StoreExecutiveDashboard from '../pages/dashboards/StoreExecutiveDashboard';
import QualityControlDashboard from '../pages/dashboards/QualityControlDashboard';
import ProjectEngineerDashboard from '../pages/dashboards/ProjectEngineerDashboard';

// Enterprise Support Management Module Pages
import ContactMessages from '../pages/support/ContactMessages';
import Tickets from '../pages/support/Tickets';
import TicketDetails from '../pages/support/TicketDetails';
import KnowledgeBase from '../pages/support/KnowledgeBase';
import KnowledgeBaseArticle from '../pages/support/KnowledgeBaseArticle';
import SlaManagement from '../pages/support/SlaManagement';

// Enterprise Membership Management Module Pages
import MembershipDashboard from '../pages/membership/MembershipDashboard';
import MembershipPlans from '../pages/membership/MembershipPlans';
import MembershipAddons from '../pages/membership/MembershipAddons';
import MembershipMembers from '../pages/membership/MembershipMembers';
import MembershipTransactions from '../pages/membership/MembershipTransactions';

// Enterprise System Management Module Pages
import UsersManagement from '../pages/system/Users';
import UserDetails from '../pages/system/UserDetails';
import RolesManagement from '../pages/system/Roles';
import Permissions from '../pages/system/Permissions';
import DeleteRequests from '../pages/system/DeleteRequests';

// Enterprise Settings Module Pages
import Settings from '../pages/system/Settings';
import GeneralSettings from '../pages/system/GeneralSettings';
import SecuritySettings from '../pages/system/SecuritySettings';
import NotificationSettings from '../pages/system/NotificationSettings';
import IntegrationSettings from '../pages/system/IntegrationSettings';

// Enterprise POS Module Pages
import POSScreen from '../pages/pos/POSScreen';
import POSOrders from '../pages/pos/POSOrders';
import POSOrderDetails from '../pages/pos/POSOrderDetails';
import BarcodePrint from '../pages/pos/BarcodePrint';
import QRCodePrint from '../pages/pos/QRCodePrint';
import PrintSettings from '../pages/pos/PrintSettings';

// Enterprise Assets Module Pages
import AssetDashboard from '../pages/assets/AssetDashboard';
import AssetRegister from '../pages/assets/AssetRegister';
import AssetDetails from '../pages/assets/AssetDetails';
import Assignments from '../pages/assets/Assignments';
import Depreciation from '../pages/assets/Depreciation';
import Maintenance from '../pages/assets/Maintenance';
import Disposal from '../pages/assets/Disposal';
import AssetAnalytics from '../pages/assets/AssetAnalytics';

// Enterprise Documents Module Pages
import DocumentDashboard from '../pages/documents/DocumentDashboard';
import DocumentRepository from '../pages/documents/DocumentRepository';
import DocumentDetails from '../pages/documents/DocumentDetails';
import Policies from '../pages/documents/Policies';
import ComplianceDocs from '../pages/documents/ComplianceDocs';
import DocumentWorkflows from '../pages/documents/DocumentWorkflows';

// Applications Module Pages
import ChatPage from '../pages/applications/Chat/ChatPage';
import CallsPage from '../pages/applications/Calls/CallsPage';
import CalendarPage from '../pages/applications/Calendar/CalendarPage';
import EmailPage from '../pages/applications/Email/EmailPage';
import FileManagerPage from '../pages/applications/FileManager/FileManagerPage';
import NotesPage from '../pages/applications/Notes/NotesPage';
import TodoPage from '../pages/applications/Todo/TodoPage';
import WorkflowsPage from '../pages/applications/Workflows/WorkflowsPage';

// CRM Module Pages
import ContactList from '../pages/crm/Contacts/ContactList';
import ContactDetails from '../pages/crm/Contacts/ContactDetails';
import LeadList from '../pages/crm/Leads/LeadList';
import LeadDetails from '../pages/crm/Leads/LeadDetails';
import DealList from '../pages/crm/Deals/DealList';
import DealDetails from '../pages/crm/Deals/DealDetails';
import PipelineBoard from '../pages/crm/Pipeline/PipelineBoard';
import CampaignList from '../pages/crm/Campaigns/CampaignList';
import CampaignDetails from '../pages/crm/Campaigns/CampaignDetails';
import FeedbackList from '../pages/crm/Feedback/FeedbackList';
import CustomerAnalytics from '../pages/crm/Analytics/CustomerAnalytics';

// Layouts Module Page
import LayoutSettingsPage from '../pages/layouts/LayoutSettingsPage';
import { LayoutProvider } from '../context/LayoutContext';

// Inventory Module Pages
import ProductList from '../pages/inventory/Products/ProductList';
import ProductDetail from '../pages/inventory/Products/ProductDetail';
import ProductStockHistory from '../pages/inventory/Products/ProductStockHistory';
import CategoryList from '../pages/inventory/Categories/CategoryList';
import BrandList from '../pages/inventory/Brands/BrandList';
import UnitList from '../pages/inventory/Units/UnitList';
import ManageStock from '../pages/inventory/Stock/ManageStock';
import StockAdjustment from '../pages/inventory/Stock/StockAdjustment';
import StockTransfer from '../pages/inventory/Stock/StockTransfer';
import SupplierList from '../pages/inventory/Suppliers/SupplierList';
import SupplierDetail from '../pages/inventory/Suppliers/SupplierDetail';
import WarehouseList from '../pages/inventory/Warehouses/WarehouseList';
import WarehouseDetail from '../pages/inventory/Warehouses/WarehouseDetail';

// Sales Module Pages
import SalesDashboard from '../pages/sales/SalesDashboard';
import CustomerList from '../pages/sales/Customers/CustomerList';
import CustomerDetails from '../pages/sales/Customers/CustomerDetails';
import SalesOrderList from '../pages/sales/Orders/SalesOrderList';
import SalesOrderCreate from '../pages/sales/Orders/SalesOrderCreate';
import SalesOrderDetails from '../pages/sales/Orders/SalesOrderDetails';
import InvoiceList from '../pages/sales/Invoices/InvoiceList';
import InvoiceCreate from '../pages/sales/Invoices/InvoiceCreate';
import InvoiceDetails from '../pages/sales/Invoices/InvoiceDetails';
import RecurringInvoiceList from '../pages/sales/RecurringInvoices/RecurringInvoiceList';
import InvoiceTemplateList from '../pages/sales/InvoiceTemplates/InvoiceTemplateList';
import CreditNoteList from '../pages/sales/CreditNotes/CreditNoteList';
import QuoteList from '../pages/sales/Quotes/QuoteList';
import QuoteCreate from '../pages/sales/Quotes/QuoteCreate';
import QuoteDetails from '../pages/sales/Quotes/QuoteDetails';
import CashSale from '../pages/sales/CashSales/CashSale';
import RefundList from '../pages/sales/Refunds/RefundList';
import DeliveryNoteList from '../pages/sales/DeliveryNotes/DeliveryNoteList';
import SalesAnalytics from '../pages/sales/Analytics/SalesAnalytics';

// Purchase Module Pages
import PurchaseDashboard from '../pages/purchase/PurchaseDashboard';
import VendorList from '../pages/purchase/Vendors/VendorList';
import VendorDetails from '../pages/purchase/Vendors/VendorDetails';
import PurchaseOrderList from '../pages/purchase/Orders/PurchaseOrderList';
import PurchaseOrderCreate from '../pages/purchase/Orders/PurchaseOrderCreate';
import PurchaseOrderDetails from '../pages/purchase/Orders/PurchaseOrderDetails';
import PurchaseList from '../pages/purchase/Purchases/PurchaseList';
import PurchaseCreate from '../pages/purchase/Purchases/PurchaseCreate';
import PurchaseDetails from '../pages/purchase/Purchases/PurchaseDetails';
import PurchaseReturnList from '../pages/purchase/Returns/PurchaseReturnList';
import ProcurementAnalytics from '../pages/purchase/Analytics/ProcurementAnalytics';

// Finance Module Pages
import ExpenseList from '../pages/finance/Expenses/ExpenseList';
import ExpenseCreate from '../pages/finance/Expenses/ExpenseCreate';
import ExpenseDetails from '../pages/finance/Expenses/ExpenseDetails';
import ExpenseCategoryList from '../pages/finance/ExpenseCategories/ExpenseCategoryList';
import PaymentList from '../pages/finance/Payments/PaymentList';
import CashflowDashboard from '../pages/finance/Cashflow/CashflowDashboard';
import BudgetList from '../pages/finance/Budgeting/BudgetList';
import TaxList from '../pages/finance/Taxes/TaxList';
import FinanceReports from '../pages/finance/Reports/FinanceReports';

// HRM Module Pages
import EmployeeList from '../pages/hrm/Employees/EmployeeList';
import EmployeeCreate from '../pages/hrm/Employees/EmployeeCreate';
import EmployeeDetails from '../pages/hrm/Employees/EmployeeDetails';
import DepartmentList from '../pages/hrm/Departments/DepartmentList';
import DesignationList from '../pages/hrm/Designations/DesignationList';
import AttendanceDashboard from '../pages/hrm/Attendance/AttendanceDashboard';
import LeaveList from '../pages/hrm/Leave/LeaveList';
import HolidayList from '../pages/hrm/Holidays/HolidayList';
import PayrollDashboard from '../pages/hrm/Payroll/PayrollDashboard';
import RecruitmentDashboard from '../pages/hrm/Recruitment/RecruitmentDashboard';
import PerformanceDashboard from '../pages/hrm/Performance/PerformanceDashboard';
import TrainingList from '../pages/hrm/Training/TrainingList';
import HRAnalytics from '../pages/hrm/Analytics/HRAnalytics';

// UI Interface Module Pages
import {
  AlertsPage, AccordionPage, AvatarPage, BadgesPage, ButtonsPage,
  ButtonGroupPage, BreadcrumbPage, CardPage, ColorsPage, CollapsePage,
  DropdownsPage, GridPage, ImagesPage, ModalsPage, OffcanvasPage,
  PaginationPage, PopoversPage, ProgressPage, TabsPage, TypographyPage
} from '../pages/ui/base/BaseUIPages';

import {
  DragulaPage, ClipboardPage, RangeSliderPage, LightboxPage
} from '../pages/ui/advanced/AdvancedUIPages';

import {
  FormElementsPage, Select2Page, FormEditorPage, FormPickerPage
} from '../pages/ui/forms/FormsUIPages';

import {
  BasicTablesPage, DataTablePage
} from '../pages/ui/tables/TablesUIPages';

import {
  ApexChartsPage, ChartJsPage
} from '../pages/ui/charts/ChartsUIPages';

import {
  FontawesomeIconsPage, TablerIconsPage, LucideIconsPage, PhosphorIconsPage
} from '../pages/ui/icons/IconsUIPages';

// Help Module Pages
import DocumentationPage from '../pages/help/DocumentationPage';
import ChangelogPage from '../pages/help/ChangelogPage';
import {
  MultiLevel1Page,
  MultiLevel21Page,
  MultiLevel221Page,
  MultiLevel222Page,
  MultiLevel3Page
} from '../pages/help/MultiLevelPages';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-600 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Falcon ERP...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Permission Guarded Route Component
const PermissionRoute = ({ permission, children }) => {
  const { user, hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <AccessDeniedPage requiredPermission={permission} userRole={user?.role || 'Guest'} />;
  }

  return children;
};

// Role-Aware Dashboard Dispatcher
const DashboardDispatcher = () => {
  const { user } = useAuth();
  if (user?.role === 'Service Engineer') {
    return <Navigate to="/app/service-engineer/dashboard" replace />;
  }
  if (user?.role === 'Store Executive') {
    return <Navigate to="/app/store-executive/dashboard" replace />;
  }
  if (user?.role === 'Quality Control') {
    return <Navigate to="/app/quality-control/dashboard" replace />;
  }
  if (user?.role === 'Project Engineer') {
    return <Navigate to="/app/project-engineer/dashboard" replace />;
  }
  return <MainDashboard />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect to app dashboard */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

      {/* Authentication routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Enterprise Authentication Module (In-App Layout with Sidebar) */}
      <Route
        path="/authentication"
        element={
          <LayoutProvider>
            <AppLayout />
          </LayoutProvider>
        }
      >
        <Route index element={<Navigate to="/authentication/login/basic" replace />} />
        <Route path="login" element={<AuthPageViewer page="login" variant="basic" />} />
        <Route path="login/cover" element={<AuthPageViewer page="login" variant="cover" />} />
        <Route path="login/illustration" element={<AuthPageViewer page="login" variant="illustration" />} />
        <Route path="login/basic" element={<AuthPageViewer page="login" variant="basic" />} />

        <Route path="register" element={<AuthPageViewer page="register" variant="basic" />} />
        <Route path="register/cover" element={<AuthPageViewer page="register" variant="cover" />} />
        <Route path="register/illustration" element={<AuthPageViewer page="register" variant="illustration" />} />
        <Route path="register/basic" element={<AuthPageViewer page="register" variant="basic" />} />

        <Route path="forgot-password" element={<AuthPageViewer page="forgot-password" variant="basic" />} />
        <Route path="forgot-password/cover" element={<AuthPageViewer page="forgot-password" variant="cover" />} />
        <Route path="forgot-password/illustration" element={<AuthPageViewer page="forgot-password" variant="illustration" />} />
        <Route path="forgot-password/basic" element={<AuthPageViewer page="forgot-password" variant="basic" />} />

        <Route path="reset-password" element={<AuthPageViewer page="reset-password" variant="basic" />} />
        <Route path="reset-password/cover" element={<AuthPageViewer page="reset-password" variant="cover" />} />
        <Route path="reset-password/illustration" element={<AuthPageViewer page="reset-password" variant="illustration" />} />
        <Route path="reset-password/basic" element={<AuthPageViewer page="reset-password" variant="basic" />} />

        <Route path="email-verification" element={<AuthPageViewer page="email-verification" variant="basic" />} />
        <Route path="email-verification/cover" element={<AuthPageViewer page="email-verification" variant="cover" />} />
        <Route path="email-verification/illustration" element={<AuthPageViewer page="email-verification" variant="illustration" />} />
        <Route path="email-verification/basic" element={<AuthPageViewer page="email-verification" variant="basic" />} />
      </Route>

      {/* Pages: Error Pages & Utilities */}
      <Route
        path="/pages"
        element={
          <LayoutProvider>
            <AppLayout />
          </LayoutProvider>
        }
      >
        <Route path="error-404" element={<SpecialPage type="error-404" />} />
        <Route path="error-500" element={<SpecialPage type="error-500" />} />
        <Route path="maintenance" element={<SpecialPage type="maintenance" />} />
        <Route path="coming-soon" element={<SpecialPage type="coming-soon" />} />
      </Route>

      {/* =========================================
          UI INTERFACE MODULE ROUTES
          ========================================= */}
      <Route
        path="/ui"
        element={
          <LayoutProvider>
            <AppLayout />
          </LayoutProvider>
        }
      >
        <Route index element={<Navigate to="/ui/base/alerts" replace />} />

        {/* 1. Base UI */}
        <Route path="base/alerts" element={<AlertsPage />} />
        <Route path="base/accordion" element={<AccordionPage />} />
        <Route path="base/avatar" element={<AvatarPage />} />
        <Route path="base/badges" element={<BadgesPage />} />
        <Route path="base/buttons" element={<ButtonsPage />} />
        <Route path="base/button-group" element={<ButtonGroupPage />} />
        <Route path="base/breadcrumb" element={<BreadcrumbPage />} />
        <Route path="base/card" element={<CardPage />} />
        <Route path="base/colors" element={<ColorsPage />} />
        <Route path="base/collapse" element={<CollapsePage />} />
        <Route path="base/dropdowns" element={<DropdownsPage />} />
        <Route path="base/grid" element={<GridPage />} />
        <Route path="base/images" element={<ImagesPage />} />
        <Route path="base/modals" element={<ModalsPage />} />
        <Route path="base/offcanvas" element={<OffcanvasPage />} />
        <Route path="base/pagination" element={<PaginationPage />} />
        <Route path="base/popovers" element={<PopoversPage />} />
        <Route path="base/progress" element={<ProgressPage />} />
        <Route path="base/tabs" element={<TabsPage />} />
        <Route path="base/typography" element={<TypographyPage />} />

        {/* 2. Advanced UI */}
        <Route path="advanced/dragula" element={<DragulaPage />} />
        <Route path="advanced/clipboard" element={<ClipboardPage />} />
        <Route path="advanced/range-slider" element={<RangeSliderPage />} />
        <Route path="advanced/lightbox" element={<LightboxPage />} />

        {/* 3. Forms */}
        <Route path="forms/elements" element={<FormElementsPage />} />
        <Route path="forms/select2" element={<Select2Page />} />
        <Route path="forms/editor" element={<FormEditorPage />} />
        <Route path="forms/picker" element={<FormPickerPage />} />

        {/* 4. Tables */}
        <Route path="tables/basic" element={<BasicTablesPage />} />
        <Route path="tables/data" element={<DataTablePage />} />

        {/* 5. Charts */}
        <Route path="charts/apex" element={<ApexChartsPage />} />
        <Route path="charts/chart-js" element={<ChartJsPage />} />

        {/* 6. Icons */}
        <Route path="icons/fontawesome" element={<FontawesomeIconsPage />} />
        <Route path="icons/tabler" element={<TablerIconsPage />} />
        <Route path="icons/lucide" element={<LucideIconsPage />} />
        <Route path="icons/phosphor" element={<PhosphorIconsPage />} />
      </Route>

      {/* =========================================
          HELP MODULE ROUTES
          ========================================= */}
      <Route
        path="/help"
        element={
          <LayoutProvider>
            <AppLayout />
          </LayoutProvider>
        }
      >
        <Route index element={<Navigate to="/help/documentation" replace />} />
        <Route path="documentation" element={<DocumentationPage />} />
        <Route path="changelog" element={<ChangelogPage />} />

        {/* Multi Level Routes */}
        <Route path="multilevel/1" element={<MultiLevel1Page />} />
        <Route path="multilevel/2/1" element={<MultiLevel21Page />} />
        <Route path="multilevel/2/2/1" element={<MultiLevel221Page />} />
        <Route path="multilevel/2/2/2" element={<MultiLevel222Page />} />
        <Route path="multilevel/3" element={<MultiLevel3Page />} />
      </Route>

      {/* Main ERP Protected App routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <LayoutProvider>
              <AppLayout />
            </LayoutProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardDispatcher />} />
        <Route path="service-engineer/dashboard" element={<PermissionRoute permission="service.view"><ServiceEngineerDashboard /></PermissionRoute>} />
        <Route path="store-executive/dashboard" element={<PermissionRoute permission="store.view"><StoreExecutiveDashboard /></PermissionRoute>} />
        <Route path="quality-control/dashboard" element={<PermissionRoute permission="qc.view"><QualityControlDashboard /></PermissionRoute>} />
        <Route path="project-engineer/dashboard" element={<PermissionRoute permission="projects.view"><ProjectEngineerDashboard /></PermissionRoute>} />

        {/* =========================================
            HRM / HUMAN RESOURCE MANAGEMENT ROUTES
            ========================================= */}
        <Route path="hrm" element={<PermissionRoute permission="hrm.view"><HrmDashboard /></PermissionRoute>} />
        <Route path="hrm/employees" element={<PermissionRoute permission="hrm.view"><EmployeeList /></PermissionRoute>} />
        <Route path="hrm/employees/create" element={<PermissionRoute permission="hrm.create"><EmployeeCreate /></PermissionRoute>} />
        <Route path="hrm/employees/:id" element={<PermissionRoute permission="hrm.view"><EmployeeDetails /></PermissionRoute>} />
        <Route path="hrm/employees/:id/edit" element={<PermissionRoute permission="hrm.edit"><EmployeeCreate /></PermissionRoute>} />
        <Route path="hrm/departments" element={<PermissionRoute permission="hrm.view"><DepartmentList /></PermissionRoute>} />
        <Route path="hrm/designations" element={<PermissionRoute permission="hrm.view"><DesignationList /></PermissionRoute>} />
        <Route path="hrm/attendance" element={<PermissionRoute permission="hrm.view"><AttendanceDashboard /></PermissionRoute>} />
        <Route path="hrm/leave" element={<PermissionRoute permission="hrm.view"><LeaveList /></PermissionRoute>} />
        <Route path="hrm/holidays" element={<PermissionRoute permission="hrm.view"><HolidayList /></PermissionRoute>} />
        <Route path="hrm/payroll" element={<PermissionRoute permission="hrm.view"><PayrollDashboard /></PermissionRoute>} />
        <Route path="hrm/recruitment" element={<PermissionRoute permission="hrm.view"><RecruitmentDashboard /></PermissionRoute>} />
        <Route path="hrm/performance" element={<PermissionRoute permission="hrm.view"><PerformanceDashboard /></PermissionRoute>} />
        <Route path="hrm/training" element={<PermissionRoute permission="hrm.view"><TrainingList /></PermissionRoute>} />
        <Route path="hrm/analytics" element={<PermissionRoute permission="hrm.view"><HRAnalytics /></PermissionRoute>} />

        {/* =========================================
            CRM / ENTERPRISE MODULE ROUTES
            ========================================= */}
        <Route path="crm" element={<PermissionRoute permission="crm.view"><CrmDashboard /></PermissionRoute>} />
        <Route path="crm/contacts" element={<PermissionRoute permission="crm.view"><ContactList /></PermissionRoute>} />
        <Route path="crm/contacts/:id" element={<PermissionRoute permission="crm.view"><ContactDetails /></PermissionRoute>} />
        <Route path="crm/leads" element={<PermissionRoute permission="crm.view"><LeadList /></PermissionRoute>} />
        <Route path="crm/leads/:id" element={<PermissionRoute permission="crm.view"><LeadDetails /></PermissionRoute>} />
        <Route path="crm/deals" element={<PermissionRoute permission="crm.view"><DealList /></PermissionRoute>} />
        <Route path="crm/deals/:id" element={<PermissionRoute permission="crm.view"><DealDetails /></PermissionRoute>} />
        <Route path="crm/pipeline" element={<PermissionRoute permission="crm.view"><PipelineBoard /></PermissionRoute>} />
        <Route path="crm/campaigns" element={<PermissionRoute permission="crm.view"><CampaignList /></PermissionRoute>} />
        <Route path="crm/campaigns/:id" element={<PermissionRoute permission="crm.view"><CampaignDetails /></PermissionRoute>} />
        <Route path="crm/customer-feedback" element={<PermissionRoute permission="crm.view"><FeedbackList /></PermissionRoute>} />
        <Route path="crm/customer-analytics" element={<PermissionRoute permission="crm.view"><CustomerAnalytics /></PermissionRoute>} />

        {/* =========================================
            INVENTORY MODULE ROUTES
            ========================================= */}
        <Route path="inventory" element={<PermissionRoute permission="inventory.view"><InventoryDashboard /></PermissionRoute>} />
        <Route path="inventory/dashboard" element={<PermissionRoute permission="inventory.view"><InventoryDashboard /></PermissionRoute>} />
        <Route path="inventory/low-stock" element={<PermissionRoute permission="inventory.view"><ManageStock /></PermissionRoute>} />
        <Route path="inventory/products" element={<PermissionRoute permission="inventory.view"><ProductList /></PermissionRoute>} />
        <Route path="inventory/products/create" element={<PermissionRoute permission="inventory.create"><ProductList /></PermissionRoute>} />
        <Route path="inventory/products/:id" element={<PermissionRoute permission="inventory.view"><ProductDetail /></PermissionRoute>} />
        <Route path="inventory/products/:id/edit" element={<PermissionRoute permission="inventory.edit"><ProductDetail /></PermissionRoute>} />
        <Route path="inventory/products/:id/stock-history" element={<PermissionRoute permission="inventory.view"><ProductStockHistory /></PermissionRoute>} />
        <Route path="inventory/categories" element={<PermissionRoute permission="inventory.view"><CategoryList /></PermissionRoute>} />
        <Route path="inventory/brands" element={<PermissionRoute permission="inventory.view"><BrandList /></PermissionRoute>} />
        <Route path="inventory/units" element={<PermissionRoute permission="inventory.view"><UnitList /></PermissionRoute>} />
        <Route path="inventory/stock" element={<PermissionRoute permission="inventory.view"><ManageStock /></PermissionRoute>} />
        <Route path="inventory/stock/manage" element={<PermissionRoute permission="inventory.view"><ManageStock /></PermissionRoute>} />
        <Route path="inventory/stock/adjustment" element={<PermissionRoute permission="inventory.view"><StockAdjustment /></PermissionRoute>} />
        <Route path="inventory/stock/transfer" element={<PermissionRoute permission="inventory.view"><StockTransfer /></PermissionRoute>} />
        <Route path="inventory/suppliers" element={<PermissionRoute permission="inventory.view"><SupplierList /></PermissionRoute>} />
        <Route path="inventory/suppliers/:id" element={<PermissionRoute permission="inventory.view"><SupplierDetail /></PermissionRoute>} />
        <Route path="inventory/warehouses" element={<PermissionRoute permission="inventory.view"><WarehouseList /></PermissionRoute>} />
        <Route path="inventory/warehouses/:id" element={<PermissionRoute permission="inventory.view"><WarehouseDetail /></PermissionRoute>} />

        {/* =========================================
            POS / POINT OF SALE ROUTES
            ========================================= */}
        <Route path="pos" element={<PermissionRoute permission="pos.view"><PosDashboard /></PermissionRoute>} />
        <Route path="pos/terminal" element={<PermissionRoute permission="pos.view"><POSScreen /></PermissionRoute>} />
        <Route path="pos/screen" element={<PermissionRoute permission="pos.view"><POSScreen /></PermissionRoute>} />
        <Route path="pos/orders" element={<PermissionRoute permission="pos.view"><POSOrders /></PermissionRoute>} />
        <Route path="pos/orders/:id" element={<PermissionRoute permission="pos.view"><POSOrderDetails /></PermissionRoute>} />

        {/* =========================================
            FIXED ASSETS MODULE ROUTES
            ========================================= */}
        <Route path="assets" element={<PermissionRoute permission="assets.view"><AssetDashboard /></PermissionRoute>} />
        <Route path="assets/register" element={<PermissionRoute permission="assets.view"><AssetRegister /></PermissionRoute>} />
        <Route path="assets/:id" element={<PermissionRoute permission="assets.view"><AssetDetails /></PermissionRoute>} />
        <Route path="assets/assignments" element={<PermissionRoute permission="assets.view"><Assignments /></PermissionRoute>} />
        <Route path="assets/depreciation" element={<PermissionRoute permission="assets.view"><Depreciation /></PermissionRoute>} />
        <Route path="assets/maintenance" element={<PermissionRoute permission="assets.view"><Maintenance /></PermissionRoute>} />
        <Route path="assets/disposal" element={<PermissionRoute permission="assets.view"><Disposal /></PermissionRoute>} />
        <Route path="assets/analytics" element={<PermissionRoute permission="assets.view"><AssetAnalytics /></PermissionRoute>} />

        {/* =========================================
            DOCUMENTS MODULE ROUTES
            ========================================= */}
        <Route path="documents" element={<PermissionRoute permission="documents.view"><DocumentDashboard /></PermissionRoute>} />
        <Route path="documents/repository" element={<PermissionRoute permission="documents.view"><DocumentRepository /></PermissionRoute>} />
        <Route path="documents/:id" element={<PermissionRoute permission="documents.view"><DocumentDetails /></PermissionRoute>} />
        <Route path="documents/policies" element={<PermissionRoute permission="documents.view"><Policies /></PermissionRoute>} />
        <Route path="documents/compliance" element={<PermissionRoute permission="documents.view"><ComplianceDocs /></PermissionRoute>} />
        <Route path="documents/workflows" element={<PermissionRoute permission="documents.view"><DocumentWorkflows /></PermissionRoute>} />

        {/* =========================================
            FINANCE MODULE ROUTES
            ========================================= */}
        <Route path="finance" element={<PermissionRoute permission="finance.view"><FinanceDashboard /></PermissionRoute>} />
        <Route path="finance/expenses" element={<PermissionRoute permission="finance.view"><ExpenseList /></PermissionRoute>} />
        <Route path="finance/expenses/create" element={<PermissionRoute permission="finance.create"><ExpenseCreate /></PermissionRoute>} />
        <Route path="finance/expenses/:id" element={<PermissionRoute permission="finance.view"><ExpenseDetails /></PermissionRoute>} />
        <Route path="finance/expenses/:id/edit" element={<PermissionRoute permission="finance.edit"><ExpenseCreate /></PermissionRoute>} />
        <Route path="finance/expense-categories" element={<PermissionRoute permission="finance.view"><ExpenseCategoryList /></PermissionRoute>} />
        <Route path="finance/payments" element={<PermissionRoute permission="finance.view"><PaymentList /></PermissionRoute>} />
        <Route path="finance/cashflow" element={<PermissionRoute permission="finance.view"><CashflowDashboard /></PermissionRoute>} />
        <Route path="finance/budgeting" element={<PermissionRoute permission="finance.view"><BudgetList /></PermissionRoute>} />
        <Route path="finance/taxes" element={<PermissionRoute permission="finance.view"><TaxList /></PermissionRoute>} />
        <Route path="finance/reports" element={<PermissionRoute permission="finance.view"><FinanceReports /></PermissionRoute>} />

        {/* =========================================
            SALES MODULE ROUTES
            ========================================= */}
        <Route path="sales" element={<PermissionRoute permission="sales.view"><SalesDashboard /></PermissionRoute>} />
        <Route path="sales/customers" element={<PermissionRoute permission="sales.view"><CustomerList /></PermissionRoute>} />
        <Route path="sales/customers/:id" element={<PermissionRoute permission="sales.view"><CustomerDetails /></PermissionRoute>} />
        <Route path="sales/orders" element={<PermissionRoute permission="sales.view"><SalesOrderList /></PermissionRoute>} />
        <Route path="sales/orders/create" element={<PermissionRoute permission="sales.create"><SalesOrderCreate /></PermissionRoute>} />
        <Route path="sales/orders/:id" element={<PermissionRoute permission="sales.view"><SalesOrderDetails /></PermissionRoute>} />
        <Route path="sales/invoices" element={<PermissionRoute permission="sales.view"><InvoiceList /></PermissionRoute>} />
        <Route path="sales/invoices/create" element={<PermissionRoute permission="sales.create"><InvoiceCreate /></PermissionRoute>} />
        <Route path="sales/invoices/:id" element={<PermissionRoute permission="sales.view"><InvoiceDetails /></PermissionRoute>} />
        <Route path="sales/recurring-invoices" element={<PermissionRoute permission="sales.view"><RecurringInvoiceList /></PermissionRoute>} />
        <Route path="sales/invoice-templates" element={<PermissionRoute permission="sales.view"><InvoiceTemplateList /></PermissionRoute>} />
        <Route path="sales/credit-notes" element={<PermissionRoute permission="sales.view"><CreditNoteList /></PermissionRoute>} />
        <Route path="sales/quotes" element={<PermissionRoute permission="sales.view"><QuoteList /></PermissionRoute>} />
        <Route path="sales/quotes/create" element={<PermissionRoute permission="sales.create"><QuoteCreate /></PermissionRoute>} />
        <Route path="sales/quotes/:id" element={<PermissionRoute permission="sales.view"><QuoteDetails /></PermissionRoute>} />
        <Route path="sales/cash-sales" element={<PermissionRoute permission="sales.view"><CashSale /></PermissionRoute>} />
        <Route path="sales/refunds" element={<PermissionRoute permission="sales.view"><RefundList /></PermissionRoute>} />
        <Route path="sales/delivery-notes" element={<PermissionRoute permission="sales.view"><DeliveryNoteList /></PermissionRoute>} />
        <Route path="sales/analytics" element={<PermissionRoute permission="sales.view"><SalesAnalytics /></PermissionRoute>} />

        {/* =========================================
            PURCHASE / PROCUREMENT MODULE ROUTES
            ========================================= */}
        <Route path="purchase" element={<PermissionRoute permission="procurement.view"><PurchaseDashboard /></PermissionRoute>} />
        <Route path="purchase/vendors" element={<PermissionRoute permission="procurement.view"><VendorList /></PermissionRoute>} />
        <Route path="purchase/vendors/:id" element={<PermissionRoute permission="procurement.view"><VendorDetails /></PermissionRoute>} />
        <Route path="purchase/orders" element={<PermissionRoute permission="procurement.view"><PurchaseOrderList /></PermissionRoute>} />
        <Route path="purchase/orders/create" element={<PermissionRoute permission="procurement.view"><PurchaseOrderCreate /></PermissionRoute>} />
        <Route path="purchase/orders/:id" element={<PermissionRoute permission="procurement.view"><PurchaseOrderDetails /></PermissionRoute>} />
        <Route path="purchase/purchases" element={<PermissionRoute permission="procurement.view"><PurchaseList /></PermissionRoute>} />
        <Route path="purchase/purchases/create" element={<PermissionRoute permission="procurement.view"><PurchaseCreate /></PermissionRoute>} />
        <Route path="purchase/purchases/:id" element={<PermissionRoute permission="procurement.view"><PurchaseDetails /></PermissionRoute>} />
        <Route path="purchase/returns" element={<PermissionRoute permission="procurement.view"><PurchaseReturnList /></PermissionRoute>} />
        <Route path="purchase/analytics" element={<PermissionRoute permission="procurement.view"><ProcurementAnalytics /></PermissionRoute>} />
        
        {/* Legacy redirect for procurement to purchase */}
        <Route path="procurement" element={<Navigate to="/app/purchase" replace />} />

        {/* =========================================
            PROJECTS MODULE ROUTES
            ========================================= */}
        <Route path="projects" element={<PermissionRoute permission="projects.view"><ProjectDashboard /></PermissionRoute>} />

        {/* =========================================
            ENTERPRISE SUPPORT MANAGEMENT ROUTES
            ========================================= */}
        <Route path="support" element={<PermissionRoute permission="support.view"><SupportDashboard /></PermissionRoute>} />
        <Route path="support/contact-messages" element={<PermissionRoute permission="support.view"><ContactMessages /></PermissionRoute>} />
        <Route path="support/tickets" element={<PermissionRoute permission="support.view"><Tickets /></PermissionRoute>} />
        <Route path="support/tickets/:id" element={<PermissionRoute permission="support.view"><TicketDetails /></PermissionRoute>} />
        <Route path="support/knowledge-base" element={<PermissionRoute permission="support.view"><KnowledgeBase /></PermissionRoute>} />
        <Route path="support/knowledge-base/:id" element={<PermissionRoute permission="support.view"><KnowledgeBaseArticle /></PermissionRoute>} />
        <Route path="support/sla" element={<PermissionRoute permission="support.view"><SlaManagement /></PermissionRoute>} />

        {/* =========================================
            ENTERPRISE MEMBERSHIP MANAGEMENT ROUTES
            ========================================= */}
        <Route path="membership" element={<PermissionRoute permission="membership.view"><MembershipDashboard /></PermissionRoute>} />
        <Route path="membership/plans" element={<PermissionRoute permission="membership.view"><MembershipPlans /></PermissionRoute>} />
        <Route path="membership/addons" element={<PermissionRoute permission="membership.view"><MembershipAddons /></PermissionRoute>} />
        <Route path="membership/members" element={<PermissionRoute permission="membership.view"><MembershipMembers /></PermissionRoute>} />
        <Route path="membership/transactions" element={<PermissionRoute permission="membership.view"><MembershipTransactions /></PermissionRoute>} />

        {/* =========================================
            ENTERPRISE SYSTEM MANAGEMENT ROUTES
            ========================================= */}
        <Route path="system/users" element={<PermissionRoute permission="users.view"><UsersManagement /></PermissionRoute>} />
        <Route path="system/users/:id" element={<PermissionRoute permission="users.view"><UserDetails /></PermissionRoute>} />
        <Route path="system/roles" element={<PermissionRoute permission="roles.view"><RolesManagement /></PermissionRoute>} />
        <Route path="system/permissions" element={<PermissionRoute permission="permissions.view"><Permissions /></PermissionRoute>} />
        <Route path="system/delete-requests" element={<PermissionRoute permission="users.view"><DeleteRequests /></PermissionRoute>} />

        {/* =========================================
            ENTERPRISE SETTINGS MANAGEMENT ROUTES
            ========================================= */}
        <Route path="system/settings" element={<PermissionRoute permission="settings.view"><Settings /></PermissionRoute>} />
        <Route path="system/settings/general" element={<PermissionRoute permission="settings.view"><GeneralSettings /></PermissionRoute>} />
        <Route path="system/settings/security" element={<PermissionRoute permission="settings.view"><SecuritySettings /></PermissionRoute>} />
        <Route path="system/settings/notifications" element={<PermissionRoute permission="settings.view"><NotificationSettings /></PermissionRoute>} />
        <Route path="system/settings/integrations" element={<PermissionRoute permission="settings.view"><IntegrationSettings /></PermissionRoute>} />

        {/* Applications Module Routes */}
        <Route path="applications/chat" element={<ChatPage />} />
        <Route path="applications/calls" element={<CallsPage />} />
        <Route path="applications/calendar" element={<CalendarPage />} />
        <Route path="applications/email" element={<EmailPage />} />
        <Route path="applications/files" element={<FileManagerPage />} />
        <Route path="applications/notes" element={<NotesPage />} />
        <Route path="applications/todo" element={<TodoPage />} />
        <Route path="applications/workflows" element={<WorkflowsPage />} />

        {/* Layouts Module Routes */}
        <Route path="layouts" element={<LayoutSettingsPage />} />
        <Route path="layouts/:preset" element={<LayoutSettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
