import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import HRDashboard from "@/pages/dashboard/hr/HRDashboard";
import Employees from "@/pages/dashboard/hr/Employees";
import SiteStaff from "@/pages/dashboard/hr/SiteStaff";
import AssetDashboard from "@/pages/dashboard/asset/AssetDashboard";
import AssetDetails from "@/pages/dashboard/asset/AssetDetails";
import AssetSettings from "@/pages/dashboard/asset/AssetSettings";
import ClaimDashboard from "@/pages/dashboard/claim/ClaimDashboard";
import ClaimSettings from "@/pages/dashboard/claim/ClaimSettings";
import CommunityDashboard from "@/pages/dashboard/community/CommunityDashboard";
import CommunityModeration from "@/pages/dashboard/community/CommunityModeration";
import AuditLogs from "@/pages/dashboard/compliance/AuditLogs";
import ComplianceReports from "@/pages/dashboard/compliance/ComplianceReports";
import FinanceDashboard from "@/pages/dashboard/finance/FinanceDashboard";
import FinanceSettings from "@/pages/dashboard/finance/FinanceSettings";
import FinancialTransactions from "@/pages/dashboard/financial/Transactions";
import Wallet from "@/pages/dashboard/financial/Wallet";
import Attendance from "@/pages/dashboard/hr/Attendance";
import Leave from "@/pages/dashboard/hr/Leave";
import Payroll from "@/pages/dashboard/hr/Payroll";
import StaffTraining from "@/pages/dashboard/hr/StaffTraining";
import HRSettings from "@/pages/dashboard/hr/HRSettings";
import InventoryDashboard from "@/pages/dashboard/inventory/InventoryDashboard";
import InventorySettings from "@/pages/dashboard/inventory/InventorySettings";
import POSDashboard from "@/pages/dashboard/pos/POSDashboard";
import Products from "@/pages/dashboard/pos/Products";
import POSTransactions from "@/pages/dashboard/pos/Transactions";
import ProgrammesDashboard from "@/pages/dashboard/programmes/ProgrammesDashboard";
import ProgrammeSettings from "@/pages/dashboard/programmes/ProgrammeSettings";
import ServiceInfo from "@/pages/dashboard/services/ServiceInfo";
import ServiceTransactions from "@/pages/dashboard/services/Transactions";
import Site from "@/pages/dashboard/site/Site";
import SiteDetails from "@/pages/dashboard/site/SiteDetail";
import SiteManagement from "@/pages/dashboard/site/SiteManagement";
import WorkflowConfiguration from "@/pages/dashboard/workflow/WorkflowConfiguration";
import WorkflowDashboard from "@/pages/workflow/Dashboard";
import DocketStatus from "@/pages/dashboard/dashboard/DocketStatus";
import Technician from "@/pages/dashboard/dashboard/Technician";
import Graph from "@/pages/dashboard/dashboard/Graph";
import Announcements from "@/pages/dashboard/announcements/Announcements";
import AnnouncementSettings from "@/pages/dashboard/announcements/AnnouncementSettings";
import CreateAnnouncement from "@/pages/dashboard/announcements/CreateAnnouncement";
import Takwim from "@/pages/dashboard/takwim/Takwim";
import DashboardPage from "@/pages/dashboard/Dashboard";
import NADIClosure from "@/pages/dashboard/site/NADIClosure";
import Usage from "@/pages/dashboard/site/Usage";
import KPI from "@/pages/dashboard/site/KPI";
import NMS from "@/pages/dashboard/site/NMS";
import SiteManagementDashboard from "@/pages/dashboard/main-dashboard/SiteManagementDashboard";
import Billing from "@/pages/dashboard/site/Billing";
import ReportDashboard from "@/pages/report/ReportDashboard";
import ReportNadiESystem from "@/pages/report/ReportNadiESystem";
import ReportInternetAccess from "@/pages/report/ReportInternetAccess";
import ReportSiteManagement from "@/pages/report/ReportSiteManagement";
import ReportHRSalary from "@/pages/report/ReportHRSalary";
import ReportTraining from "@/pages/report/ReportTraining";
import ReportCM from "@/pages/report/ReportCM";
import ReportSmartService from "@/pages/report/ReportSmartService";

export const moduleRoutes: RouteObject[] = [
  // HR Routes
  {
    path: "/hr",
    element: (
      // <ProtectedRoute requiredPermission="view_hr_dashboard">
      <HRDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/hr/settings",
    element: (
      // <ProtectedRoute requiredPermission="view_hr_dashboard">
      <HRSettings />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/hr/employees",
    element: (
      // <ProtectedRoute requiredPermission="manage_employees">
      <Employees />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/hr/site-staff",
    element: (
      // <ProtectedRoute requiredPermission="manage_site_staff">
      <SiteStaff />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/hr/attendance",
    element: (
      // <ProtectedRoute requiredPermission="manage_attendance">
      <Attendance />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/hr/leave",
    element: (
      // <ProtectedRoute requiredPermission="manage_leave">
      <Leave />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/hr/payroll",
    element: (
      // <ProtectedRoute requiredPermission="manage_leave">
      <Payroll />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/hr/staff-training",
    element: (
      // <ProtectedRoute requiredPermission="manage_leave">
      <StaffTraining />
      // </ProtectedRoute>
    ),
  },
  // POS Routes
  {
    path: "/pos",
    element: (
      // <ProtectedRoute requiredPermission="view_pos_dashboard">
      <POSDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/pos/products",
    element: (
      // <ProtectedRoute requiredPermission="manage_products">
      <Products />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/pos/transactions",
    element: (
      // <ProtectedRoute requiredPermission="view_pos_transactions">
      <POSTransactions />
      // </ProtectedRoute>
    ),
  },
  // Claim Routes
  {
    path: "/claim",
    element: (
      // <ProtectedRoute requiredPermission="view_claims">
      <ClaimDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/claim/settings",
    element: (
      // <ProtectedRoute requiredPermission="manage_claim_settings">
      <ClaimSettings />
      // </ProtectedRoute>
    ),
  },
  // Asset Routes
  {
    path: "/asset",
    element: (
      // <ProtectedRoute requiredPermission="view_assets">
      <AssetDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/asset/detail/:id",
    element: (
      // <ProtectedRoute requiredPermission="view_assets">
      <AssetDetails />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/asset/settings",
    element: (
      // <ProtectedRoute requiredPermission="manage_asset_settings">
      <AssetSettings />
      // </ProtectedRoute>
    ),
  },
  // Inventory Routes
  {
    path: "/inventory",
    element: (
      // <ProtectedRoute requiredPermission="view_assets">
      <InventoryDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/inventory/settings",
    element: (
      // <ProtectedRoute requiredPermission="manage_asset_settings">
      <InventorySettings />
      // </ProtectedRoute>
    ),
  },
  // Finance Routes
  {
    path: "/finance",
    element: (
      // <ProtectedRoute requiredPermission="view_finance">
      <FinanceDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/finance/settings",
    element: (
      // <ProtectedRoute requiredPermission="manage_finance_settings">
      <FinanceSettings />
      // </ProtectedRoute>
    ),
  },
  // Programmes Routes
  {
    path: "/programmes",
    element: (
      // <ProtectedRoute requiredPermission="view_programmes">
      <ProgrammesDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/programmes/settings",
    element: (
      // <ProtectedRoute requiredPermission="manage_programme_settings">
      <ProgrammeSettings />
      // </ProtectedRoute>
    ),
  },
  // Service Routes
  {
    path: "/services/info",
    element: (
      // <ProtectedRoute requiredPermission="view_services">
      <ServiceInfo />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/services/transactions",
    element: (
      // <ProtectedRoute requiredPermission="view_service_transactions">
      <ServiceTransactions />
      // </ProtectedRoute>
    ),
  },
  // Community Routes
  {
    path: "/community",
    element: (
      // <ProtectedRoute requiredPermission="view_community">
      <CommunityDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/community/moderation",
    element: (
      // <ProtectedRoute requiredPermission="moderate_community">
      <CommunityModeration />
      // </ProtectedRoute>
    ),
  },
  // Financial Routes
  {
    path: "/financial/wallet",
    element: (
      // <ProtectedRoute requiredPermission="view_wallet">
      <Wallet />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/financial/transactions",
    element: (
      // <ProtectedRoute requiredPermission="view_financial_transactions">
      <FinancialTransactions />
      // </ProtectedRoute>
    ),
  },
  // Compliance Routes
  {
    path: "/compliance/audit",
    element: (
      // <ProtectedRoute requiredPermission="view_audit_logs">
      <AuditLogs />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/compliance/reports",
    element: (
      // <ProtectedRoute requiredPermission="view_compliance_reports">
      <ComplianceReports />
      // </ProtectedRoute>
    ),
  },
  // Workflow Routes - Keep only configuration related routes
  {
    path: "/workflow",
    element: (
      // <ProtectedRoute requiredPermission="manage_workflows">
      <WorkflowDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/workflow/configuration",
    element: (
      // <ProtectedRoute requiredPermission="manage_workflow_configuration">
      <WorkflowConfiguration />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/workflow/configuration/:id",
    element: (
      // <ProtectedRoute requiredPermission="manage_workflow_configuration">
      <WorkflowConfiguration />
      // </ProtectedRoute>
    ),
  },

  // Site Management Routes
  {
    path: "/site-management", //For superadmin
    element: (
      // <ProtectedRoute requiredPermission="site_management">
      <SiteManagement />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/site-management/site", //For superadmin
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <SiteDetails />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/site", //For staff
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <Site />
      // </ProtectedRoute>
    ),
  },
  // {
  //   path: "/site-management/approval", //For superadmin
  //   element: (
  //     // <ProtectedRoute requiredPermission="view_site_details">
  //     <SiteClosureApproval />
  //     // </ProtectedRoute>
  //   ),
  // },
  {
    path: "/site/utilities-billing",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <Billing/>
      // </ProtectedRoute>
    ),
  },
  // {
  //   path: "/site/insurance",
  //   element: (
  //     // <ProtectedRoute requiredPermission="view_site_details">
  //     <Usage/>
  //     // </ProtectedRoute>
  //   ),
  // },
  {
    path: "/site/usage",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <Usage />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/site/kpi",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <KPI />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/site/nms",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <NMS />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/docket-status", //For superadmin
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <DocketStatus />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/technician", //For superadmin
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <Technician />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/graph", //For superadmin
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <Graph />
      // </ProtectedRoute>
    ),
  },
  // Announcements Routes
  {
    path: "/announcements",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <Announcements />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/announcements/create-announcement",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <CreateAnnouncement />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/announcements/announcements-settings",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <AnnouncementSettings />
      // </ProtectedRoute>
    ),
  },
  // Takwim Routes
  {
    path: "/takwim",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <Takwim />
      // </ProtectedRoute>
    ),
  },

  {
    path: "/dashboard/home",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <DashboardPage />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/site/closure",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <NADIClosure />
      // </ProtectedRoute>
    ),
  }, 
  {
    path: "/dashboard/site-management",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <SiteManagementDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      // <ProtectedRoute requiredPermission="s">
      <ReportDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/reports/nadi-e-system",
    element: (
      // <ProtectedRoute requiredPermission="">
      <ReportNadiESystem />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/reports/internet-access",
    element: (
      // <ProtectedRoute requiredPermission="">
      <ReportInternetAccess />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/reports/site-management",
    element: (
      // <ProtectedRoute requiredPermission="">
      <ReportSiteManagement />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/reports/hr-salary",
    element: (
      // <ProtectedRoute requiredPermission="">
      <ReportHRSalary />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/reports/training",
    element: (
      // <ProtectedRoute requiredPermission="">
      <ReportTraining />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/reports/cm",
    element: (
      // <ProtectedRoute requiredPermission="">
      <ReportCM />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/reports/smart-services",
    element: (
      // <ProtectedRoute requiredPermission="">
      <ReportSmartService />
      // </ProtectedRoute>
    ),
  },
];
