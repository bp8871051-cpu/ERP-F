import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';

import LoginPage from '../pages/auth/LoginPage';
import MainDashboard from '../pages/dashboard/MainDashboard';
import HrmDashboard from '../pages/hrm/HrmDashboard';
import InventoryDashboard from '../pages/inventory/InventoryDashboard';
import CrmDashboard from '../pages/crm/CrmDashboard';
import PosDashboard from '../pages/pos/PosDashboard';
import FinanceDashboard from '../pages/finance/FinanceDashboard';
import ProjectDashboard from '../pages/projects/ProjectDashboard';
import SupportDashboard from '../pages/support/SupportDashboard';

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

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect to app dashboard */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

      {/* Authentication routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
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
        <Route path="dashboard" element={<MainDashboard />} />
        {/* =========================================
            HRM / HUMAN RESOURCE MANAGEMENT ROUTES
            ========================================= */}
        <Route path="hrm" element={<HrmDashboard />} />
        <Route path="hrm/employees" element={<EmployeeList />} />
        <Route path="hrm/employees/create" element={<EmployeeCreate />} />
        <Route path="hrm/employees/:id" element={<EmployeeDetails />} />
        <Route path="hrm/employees/:id/edit" element={<EmployeeCreate />} />
        <Route path="hrm/departments" element={<DepartmentList />} />
        <Route path="hrm/designations" element={<DesignationList />} />
        <Route path="hrm/attendance" element={<AttendanceDashboard />} />
        <Route path="hrm/leave" element={<LeaveList />} />
        <Route path="hrm/holidays" element={<HolidayList />} />
        <Route path="hrm/payroll" element={<PayrollDashboard />} />
        <Route path="hrm/recruitment" element={<RecruitmentDashboard />} />
        <Route path="hrm/performance" element={<PerformanceDashboard />} />
        <Route path="hrm/training" element={<TrainingList />} />
        <Route path="hrm/analytics" element={<HRAnalytics />} />

        {/* =========================================
            CRM / ENTERPRISE MODULE ROUTES
            ========================================= */}
        <Route path="crm" element={<CrmDashboard />} />
        <Route path="crm/contacts" element={<ContactList />} />
        <Route path="crm/contacts/:id" element={<ContactDetails />} />
        <Route path="crm/leads" element={<LeadList />} />
        <Route path="crm/leads/:id" element={<LeadDetails />} />
        <Route path="crm/deals" element={<DealList />} />
        <Route path="crm/deals/:id" element={<DealDetails />} />
        <Route path="crm/pipeline" element={<PipelineBoard />} />
        <Route path="crm/campaigns" element={<CampaignList />} />
        <Route path="crm/campaigns/:id" element={<CampaignDetails />} />
        <Route path="crm/customer-feedback" element={<FeedbackList />} />
        <Route path="crm/customer-analytics" element={<CustomerAnalytics />} />

        {/* Inventory Module Routes */}
        <Route path="inventory" element={<InventoryDashboard />} />
        <Route path="inventory/dashboard" element={<InventoryDashboard />} />
        <Route path="inventory/low-stock" element={<ManageStock />} />
        <Route path="inventory/products" element={<ProductList />} />
        <Route path="inventory/products/create" element={<ProductList />} />
        <Route path="inventory/products/:id" element={<ProductDetail />} />
        <Route path="inventory/products/:id/edit" element={<ProductDetail />} />
        <Route path="inventory/products/:id/stock-history" element={<ProductStockHistory />} />
        <Route path="inventory/categories" element={<CategoryList />} />
        <Route path="inventory/brands" element={<BrandList />} />
        <Route path="inventory/units" element={<UnitList />} />
        <Route path="inventory/stock" element={<ManageStock />} />
        <Route path="inventory/stock/manage" element={<ManageStock />} />
        <Route path="inventory/stock/adjustment" element={<StockAdjustment />} />
        <Route path="inventory/stock/transfer" element={<StockTransfer />} />
        <Route path="inventory/suppliers" element={<SupplierList />} />
        <Route path="inventory/suppliers/:id" element={<SupplierDetail />} />
        <Route path="inventory/warehouses" element={<WarehouseList />} />
        <Route path="inventory/warehouses/:id" element={<WarehouseDetail />} />
        <Route path="pos" element={<PosDashboard />} />
        {/* =========================================
            FINANCE MODULE ROUTES
            ========================================= */}
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="finance/expenses" element={<ExpenseList />} />
        <Route path="finance/expenses/create" element={<ExpenseCreate />} />
        <Route path="finance/expenses/:id" element={<ExpenseDetails />} />
        <Route path="finance/expenses/:id/edit" element={<ExpenseCreate />} />
        <Route path="finance/expense-categories" element={<ExpenseCategoryList />} />
        <Route path="finance/payments" element={<PaymentList />} />
        <Route path="finance/cashflow" element={<CashflowDashboard />} />
        <Route path="finance/budgeting" element={<BudgetList />} />
        <Route path="finance/taxes" element={<TaxList />} />
        <Route path="finance/reports" element={<FinanceReports />} />

        {/* =========================================
            SALES MODULE ROUTES
            ========================================= */}
        <Route path="sales" element={<SalesDashboard />} />
        <Route path="sales/customers" element={<CustomerList />} />
        <Route path="sales/customers/:id" element={<CustomerDetails />} />
        <Route path="sales/orders" element={<SalesOrderList />} />
        <Route path="sales/orders/create" element={<SalesOrderCreate />} />
        <Route path="sales/orders/:id" element={<SalesOrderDetails />} />
        <Route path="sales/invoices" element={<InvoiceList />} />
        <Route path="sales/invoices/create" element={<InvoiceCreate />} />
        <Route path="sales/invoices/:id" element={<InvoiceDetails />} />
        <Route path="sales/recurring-invoices" element={<RecurringInvoiceList />} />
        <Route path="sales/invoice-templates" element={<InvoiceTemplateList />} />
        <Route path="sales/credit-notes" element={<CreditNoteList />} />
        <Route path="sales/quotes" element={<QuoteList />} />
        <Route path="sales/quotes/create" element={<QuoteCreate />} />
        <Route path="sales/quotes/:id" element={<QuoteDetails />} />
        <Route path="sales/cash-sales" element={<CashSale />} />
        <Route path="sales/refunds" element={<RefundList />} />
        <Route path="sales/delivery-notes" element={<DeliveryNoteList />} />
        <Route path="sales/analytics" element={<SalesAnalytics />} />

        {/* =========================================
            PURCHASE MODULE ROUTES
            ========================================= */}
        <Route path="purchase" element={<PurchaseDashboard />} />
        <Route path="purchase/vendors" element={<VendorList />} />
        <Route path="purchase/vendors/:id" element={<VendorDetails />} />
        <Route path="purchase/orders" element={<PurchaseOrderList />} />
        <Route path="purchase/orders/create" element={<PurchaseOrderCreate />} />
        <Route path="purchase/orders/:id" element={<PurchaseOrderDetails />} />
        <Route path="purchase/purchases" element={<PurchaseList />} />
        <Route path="purchase/purchases/create" element={<PurchaseCreate />} />
        <Route path="purchase/purchases/:id" element={<PurchaseDetails />} />
        <Route path="purchase/returns" element={<PurchaseReturnList />} />
        <Route path="purchase/analytics" element={<ProcurementAnalytics />} />
        
        {/* Legacy redirect for procurement to purchase */}
        <Route path="procurement" element={<Navigate to="/app/purchase" replace />} />

        {/* =========================================
            FINANCE MODULE ROUTES
            ========================================= */}
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="finance/expenses" element={<ExpenseList />} />
        <Route path="finance/expenses/create" element={<ExpenseCreate />} />
        <Route path="finance/expenses/:id" element={<ExpenseDetails />} />
        <Route path="finance/expense-categories" element={<ExpenseCategoryList />} />
        <Route path="finance/payments" element={<PaymentList />} />
        <Route path="finance/cashflow" element={<CashflowDashboard />} />
        <Route path="finance/budgeting" element={<BudgetList />} />
        <Route path="finance/taxes" element={<TaxList />} />
        <Route path="finance/reports" element={<FinanceReports />} />

        {/* =========================================
            HRM MODULE ROUTES
            ========================================= */}
        <Route path="hrm" element={<HrmDashboard />} />
        <Route path="hrm/employees" element={<EmployeeList />} />
        <Route path="hrm/employees/create" element={<EmployeeCreate />} />
        <Route path="hrm/employees/:id" element={<EmployeeDetails />} />
        <Route path="hrm/departments" element={<DepartmentList />} />
        <Route path="hrm/designations" element={<DesignationList />} />
        <Route path="hrm/attendance" element={<AttendanceDashboard />} />
        <Route path="hrm/leave" element={<LeaveList />} />
        <Route path="hrm/holidays" element={<HolidayList />} />
        <Route path="hrm/payroll" element={<PayrollDashboard />} />
        <Route path="hrm/recruitment" element={<RecruitmentDashboard />} />
        <Route path="hrm/performance" element={<PerformanceDashboard />} />
        <Route path="hrm/training" element={<TrainingList />} />
        <Route path="hrm/analytics" element={<HRAnalytics />} />

        <Route path="projects" element={<ProjectDashboard />} />
        <Route path="support" element={<SupportDashboard />} />

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
