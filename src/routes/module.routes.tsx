import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import HRDashboard from "@/pages/dashboard/hr/HRDashboard";
import Employees from "@/pages/dashboard/hr/Employees";
import Attendance from "@/pages/dashboard/hr/Attendance";
import Leave from "@/pages/dashboard/hr/Leave";
import POSDashboard from "@/pages/dashboard/pos/POSDashboard";
import Products from "@/pages/dashboard/pos/Products";
import POSTransactions from "@/pages/dashboard/pos/Transactions";
import ClaimDashboard from "@/pages/dashboard/claim/ClaimDashboard";
import ClaimSettings from "@/pages/dashboard/claim/ClaimSettings";
import AssetDashboard from "@/pages/dashboard/asset/AssetDashboard";
import AssetSettings from "@/pages/dashboard/asset/AssetSettings";
import FinanceDashboard from "@/pages/dashboard/finance/FinanceDashboard";
import FinanceSettings from "@/pages/dashboard/finance/FinanceSettings";
import ProgrammesDashboard from "@/pages/dashboard/programmes/ProgrammesDashboard";
import ProgrammeSettings from "@/pages/dashboard/programmes/ProgrammeSettings";
import ServiceInfo from "@/pages/dashboard/services/ServiceInfo";
import ServiceTransactions from "@/pages/dashboard/services/Transactions";
import CommunityDashboard from "@/pages/dashboard/community/CommunityDashboard";
import CommunityModeration from "@/pages/dashboard/community/CommunityModeration";
import Wallet from "@/pages/dashboard/financial/Wallet";
import FinancialTransactions from "@/pages/dashboard/financial/Transactions";
import AuditLogs from "@/pages/dashboard/compliance/AuditLogs";
import ComplianceReports from "@/pages/dashboard/compliance/ComplianceReports";
import WorkflowDashboard from "@/pages/dashboard/workflow/WorkflowDashboard";
import UserProfile from "@/pages/dashboard/profile/UserProfile";
import SiteManagement from "@/pages/dashboard/SiteManagement";

export const moduleRoutes: RouteObject[] = [
  // HR Routes
  {
    path: "/hr",
    element: (
      <ProtectedRoute requiredPermission="view_hr_dashboard">
        <HRDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hr/employees",
    element: (
      <ProtectedRoute requiredPermission="manage_employees">
        <Employees />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hr/attendance",
    element: (
      <ProtectedRoute requiredPermission="manage_attendance">
        <Attendance />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hr/leave",
    element: (
      <ProtectedRoute requiredPermission="manage_leave">
        <Leave />
      </ProtectedRoute>
    ),
  },
  // POS Routes
  {
    path: "/pos",
    element: (
      <ProtectedRoute requiredPermission="view_pos_dashboard">
        <POSDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pos/products",
    element: (
      <ProtectedRoute requiredPermission="manage_products">
        <Products />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pos/transactions",
    element: (
      <ProtectedRoute requiredPermission="view_pos_transactions">
        <POSTransactions />
      </ProtectedRoute>
    ),
  },
  // Claim Routes
  {
    path: "/claim",
    element: (
      <ProtectedRoute requiredPermission="view_claims">
        <ClaimDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/claim/settings",
    element: (
      <ProtectedRoute requiredPermission="manage_claim_settings">
        <ClaimSettings />
      </ProtectedRoute>
    ),
  },
  // Asset Routes
  {
    path: "/asset",
    element: (
      <ProtectedRoute requiredPermission="view_assets">
        <AssetDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/asset/settings",
    element: (
      <ProtectedRoute requiredPermission="manage_asset_settings">
        <AssetSettings />
      </ProtectedRoute>
    ),
  },
  // Finance Routes
  {
    path: "/finance",
    element: (
      <ProtectedRoute requiredPermission="view_finance">
        <FinanceDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/finance/settings",
    element: (
      <ProtectedRoute requiredPermission="manage_finance_settings">
        <FinanceSettings />
      </ProtectedRoute>
    ),
  },
  // Programmes Routes
  {
    path: "/programmes",
    element: (
      <ProtectedRoute requiredPermission="view_programmes">
        <ProgrammesDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/programmes/settings",
    element: (
      <ProtectedRoute requiredPermission="manage_programme_settings">
        <ProgrammeSettings />
      </ProtectedRoute>
    ),
  },
  // Service Routes
  {
    path: "/services/info",
    element: (
      <ProtectedRoute requiredPermission="view_services">
        <ServiceInfo />
      </ProtectedRoute>
    ),
  },
  {
    path: "/services/transactions",
    element: (
      <ProtectedRoute requiredPermission="view_service_transactions">
        <ServiceTransactions />
      </ProtectedRoute>
    ),
  },
  // Community Routes
  {
    path: "/community",
    element: (
      <ProtectedRoute requiredPermission="view_community">
        <CommunityDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/community/moderation",
    element: (
      <ProtectedRoute requiredPermission="moderate_community">
        <CommunityModeration />
      </ProtectedRoute>
    ),
  },
  // Financial Routes
  {
    path: "/financial/wallet",
    element: (
      <ProtectedRoute requiredPermission="view_wallet">
        <Wallet />
      </ProtectedRoute>
    ),
  },
  {
    path: "/financial/transactions",
    element: (
      <ProtectedRoute requiredPermission="view_financial_transactions">
        <FinancialTransactions />
      </ProtectedRoute>
    ),
  },
  // Compliance Routes
  {
    path: "/compliance/audit",
    element: (
      <ProtectedRoute requiredPermission="view_audit_logs">
        <AuditLogs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/compliance/reports",
    element: (
      <ProtectedRoute requiredPermission="view_compliance_reports">
        <ComplianceReports />
      </ProtectedRoute>
    ),
  },
  // Workflow Routes
  {
    path: "/workflow",
    element: (
      <ProtectedRoute requiredPermission="manage_workflows">
        <WorkflowDashboard />
      </ProtectedRoute>
    ),
  },

  // Site Management Routes
  {
    path: "/site-management/main",
    element: (
      <ProtectedRoute requiredPermission="site_management">
        <SiteManagement />
      </ProtectedRoute>
    ),
  },
  // Profile Routes
  // {
  //   path: "/dashboard/profile",
  //   element:<UserProfile />,
  // },
];
