import { MenuItem } from "@/types/menu";

export const menuItems = [
  { title: "Dashboard", path: "/admin/dashboard" },
  { title: "User Management", path: "/admin/users" },
  { title: "User Groups", path: "/admin/user-groups" },
  { title: "Roles & Permissions", path: "/admin/roles" },
  { title: "Menu Visibility", path: "/admin/menu-visibility" },
  { title: "Activity Log", path: "/admin/activity" },
  {
    title: "State Holidays",
    path: "/admin/state-holidays",
    visibleTo: ["super_admin"],
  },
  { title: "Notifications", path: "/admin/notifications" },
  { title: "Organizations", path: "/admin/organizations" },
  { title: "Settings", path: "/admin/settings" },
];

export const hrMenuItems = [
  { title: "HR Dashboard", path: "/hr" },
  { title: "Site Staff Management", path: "/hr/employees" },
  { title: "Attendance", path: "/hr/attendance" },
  { title: "Leave Management", path: "/hr/leave" },
];

export const posMenuItems = [
  { title: "POS Dashboard", path: "/pos" },
  { title: "Products", path: "/pos/products" },
  { title: "Transactions", path: "/pos/transactions" },
];

export const claimItems = [
  { title: "Claims Dashboard", path: "/claim" },
  { title: "Claims Settings", path: "/claim/settings" },
];

export const assetItems = [
  { title: "Asset Dashboard", path: "/asset" },
  { title: "Asset Settings", path: "/asset/settings" },
];

export const inventoryItems = [
  { title: "Inventory Dashboard", path: "/inventory" },
  { title: "Inventory Settings", path: "/inventory/settings" },
];

export const financeItems = [
  { title: "Finance Dashboard", path: "/finance" },
  { title: "Finance Settings", path: "/finance/settings" },
];

export const programmesItems = [
  { title: "Programmes Dashboard", path: "/programmes" },
  { title: "Programmes Settings", path: "/programmes/settings" },
];

export const reportItems = [
  { title: "Reports Dashboard", path: "/report/dashboard" },
  { title: "Usage Sessions", path: "/report/usage-sessions" },
  { title: "Internet Access", path: "/report/internet-access" },
];

export const workflowItems: MenuItem[] = [
  {
    title: "Workflow Configurations",
    path: "/workflow",
  },
];

export const memberManagementItems = [
  { title: "Personal Details", path: "/members/details" },
  { title: "Registration", path: "/members/registration" },
  { title: "Activity Logs", path: "/members/activity" },
];

export const serviceModuleItems = [
  { title: "Service Information", path: "/services/info" },
  { title: "Transactions", path: "/services/transactions" },
];

export const communityItems = [
  { title: "Community Dashboard", path: "/community" },
  { title: "Moderation", path: "/community/moderation" },
];

export const financialItems = [
  { title: "Wallet", path: "/financial/wallet" },
  { title: "Transactions", path: "/financial/transactions" },
];

export const complianceItems = [
  { title: "Audit Logs", path: "/compliance/audit" },
  { title: "System Reports", path: "/compliance/reports" },
];

export const siteManagementItems = [
  { title: "Site Management", path: "/site-management/main" },
];