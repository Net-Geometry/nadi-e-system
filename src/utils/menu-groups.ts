
import { 
  LayoutDashboard, Users, FileCheck, Settings, MessageSquare, 
  Wallet, Briefcase, ShoppingCart, Box, DollarSign, List, ChartBar
} from "lucide-react";
import { MenuItem } from "@/types/menu";
import { getAccordionIcon } from "./sidebar-icons";
import {
  menuItems,
  hrMenuItems,
  posMenuItems,
  claimItems,
  assetItems,
  financeItems,
  programmesItems,
  reportItems,
  workflowItems,
  memberManagementItems,
  serviceModuleItems,
  communityItems,
  financialItems,
  complianceItems,
} from "@/components/layout/sidebar/menu-items";


// // Create the menu items for each section
// const createDashboardItems = (): MenuItem[] => [
//   { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
//   { title: "User Management", icon: Users, path: "/dashboard/users" },
//   { title: "Roles & Permissions", icon: Settings, path: "/dashboard/roles" },
//   { title: "Organizations", icon: Users, path: "/dashboard/organizations" },
//   { title: "Access Control", icon: FileCheck, path: "/dashboard/access-control" },
//   { title: "Menu Visibility", icon: Settings, path: "/dashboard/menu-visibility" },
//   { title: "Activity Log", icon: FileCheck, path: "/dashboard/activity" },
//   { title: "Reports", icon: ChartBar, path: "/dashboard/reports" },
//   { title: "Calendar", icon: MessageSquare, path: "/dashboard/calendar" },
//   { title: "Notifications", icon: MessageSquare, path: "/dashboard/notifications" },
//   { title: "Settings", icon: Settings, path: "/dashboard/settings" },
// ];

// const createHrItems = (): MenuItem[] => [
//   { title: "HR Dashboard", icon: Briefcase, path: "/dashboard/hr/dashboard" },
//   { title: "Employees", icon: Users, path: "/dashboard/hr/employees" },
//   { title: "Attendance", icon: FileCheck, path: "/dashboard/hr/attendance" },
//   { title: "Leave", icon: FileCheck, path: "/dashboard/hr/leave" },
// ];

// const createPosItems = (): MenuItem[] => [
//   { title: "POS Dashboard", icon: ShoppingCart, path: "/dashboard/pos/dashboard" },
//   { title: "Products", icon: Box, path: "/dashboard/pos/products" },
//   { title: "Transactions", icon: DollarSign, path: "/dashboard/pos/transactions" },
// ];

// const createClaimItems = (): MenuItem[] => [
//   { title: "Claim Dashboard", icon: DollarSign, path: "/dashboard/claim/dashboard" },
//   { title: "Claim Settings", icon: Settings, path: "/dashboard/claim/settings" },
// ];

// const createAssetItems = (): MenuItem[] => [
//   { title: "Asset Dashboard", icon: Box, path: "/dashboard/asset/dashboard" },
//   { title: "Asset Settings", icon: Settings, path: "/dashboard/asset/settings" },
// ];

// const createFinanceItems = (): MenuItem[] => [
//   { title: "Finance Dashboard", icon: DollarSign, path: "/dashboard/finance/dashboard" },
//   { title: "Finance Settings", icon: Settings, path: "/dashboard/finance/settings" },
// ];

// const createProgrammesItems = (): MenuItem[] => [
//   { title: "Programmes Dashboard", icon: List, path: "/dashboard/programmes/dashboard" },
//   { title: "Programme Settings", icon: Settings, path: "/dashboard/programmes/settings" },
// ];

// const createReportItems = (): MenuItem[] => [
//   { title: "Reports", icon: ChartBar, path: "/dashboard/reports" },
// ];

// const createWorkflowItems = (): MenuItem[] => [
//   { title: "Workflow Dashboard", icon: FileCheck, path: "/dashboard/workflow/dashboard" },
// ];

// const createMemberManagementItems = (): MenuItem[] => [
//   { title: "Registration", icon: Users, path: "/dashboard/members/registration" },
//   { title: "Personal Details", icon: Users, path: "/dashboard/members/personal-details" },
//   { title: "Activity Logs", icon: FileCheck, path: "/dashboard/members/activity-logs" },
// ];

// const createServiceModuleItems = (): MenuItem[] => [
//   { title: "Service Info", icon: MessageSquare, path: "/dashboard/services/info" },
//   { title: "Transactions", icon: DollarSign, path: "/dashboard/services/transactions" },
// ];

// const createCommunityItems = (): MenuItem[] => [
//   { title: "Community Dashboard", icon: MessageSquare, path: "/dashboard/community/dashboard" },
//   { title: "Moderation", icon: FileCheck, path: "/dashboard/community/moderation" },
// ];

// const createFinancialItems = (): MenuItem[] => [
//   { title: "Wallet", icon: Wallet, path: "/dashboard/financial/wallet" },
//   { title: "Transactions", icon: DollarSign, path: "/dashboard/financial/transactions" },
// ];

// const createComplianceItems = (): MenuItem[] => [
//   { title: "Audit Logs", icon: FileCheck, path: "/dashboard/compliance/audit-logs" },
//   { title: "Compliance Reports", icon: ChartBar, path: "/dashboard/compliance/reports" },
// ];

export const menuGroups = [
  {
    label: "Admin Console",
    route: "/admin",
    items: menuItems,
  },
  {
    label: "Member Management",
    route: "/member",
    items: memberManagementItems,
  },
  {
    label: "Service Module",
    route: "/services",
    items: serviceModuleItems,
  },
  {
    label: "Community",
    route: "/community",
    items: communityItems,
  },
  {
    label: "Financial",
    route: "/fincancial",
    items: financialItems,
  },
  {
    label: "HR Management",
    route: "/hr",
    items: hrMenuItems,
  },
  {
    label: "POS Management",
    route: "/pos",
    items: posMenuItems,
  },
  {
    label: "Claim Management",
    route: "/claim",
    items: claimItems,
  },
  {
    label: "Asset Management",
    route: "/asset",
    items: assetItems,
  },
  {
    label: "Finance Management",
    route: "/finance",
    items: financeItems,
  },
  {
    label: "Programmes Management",
    route: "/programmes",
    items: programmesItems,
  },
  {
    label: "Report Management",
    route: "/report",
    items: reportItems,
  },
  {
    label: "Workflow Management",
    route: "/workflow",
    items: workflowItems,
  },
  {
    label: "Compliance",
    route: "/compliance",
    items: complianceItems,
  },
];
