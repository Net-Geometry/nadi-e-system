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
  { title: "Notification Management", path: "/admin/notification-management" },
  { title: "Organizations", path: "/admin/organizations" },
  { title: "Settings", path: "/admin/settings" },
];

export const hrMenuItems = [
  { title: "HR Dashboard", path: "/hr" },
  { title: "HR Settings", path: "/hr/settings" },
  { title: "Staff Management", path: "/hr/employees" },
  { title: "Site Staff Management", path: "/hr/site-staff" },
  { title: "Leave Management", path: "/hr/leave" },
  { title: "Attendance", path: "/hr/attendance" },
  { title: "Staff Training", path: "/hr/staff-training" },
  { title: "Payroll", path: "/hr/payroll" },
];

export const posMenuItems = [
  { title: "POS Dashboard", path: "/pos" },
  { title: "Products", path: "/pos/products" },
  { title: "Sales", path: "/pos/sales" },
  { title: "Transactions", path: "/pos/transactions" },
  { title: "PUDO", path: "/pos/pudo" },
];

export const claimItems = [
  { title: "Claims Dashboard", path: "/claim" },
  { title: "Claims Settings", path: "/claim/settings" },
  // { title: "Registration", path: "/claim/registration" },
  // { title: "List Record", path: "/claim/list-record" },
  // { title: "Reports", path: "/claim/report" },
];

export const assetItems = [
  { title: "Asset Dashboard", path: "/asset" },
  { title: "Asset Settings", path: "/asset/settings" },
  { title: "Asset Registration", path: "/asset/registration" },
  { title: "Asset Performance", path: "/asset/performance" },
  { title: "Asset Maintenance", path: "/asset/maintenance" },
];

export const inventoryItems = [
  { title: "Inventory Dashboard", path: "/inventory" },
  { title: "Inventory Settings", path: "/inventory/settings" },
];

export const financeItems = [
  { title: "Finance Dashboard", path: "/finance" },
  { title: "Finance Settings", path: "/finance/settings" },
  { title: "Revenue & Expenses", path: "/finance/revenue-expenses" },
  { title: "E-Invoices", path: "/finance/e-invoice" },
];

export const programmesItems = [
  { title: "Programmes Dashboard", path: "/programmes" },
  { title: "Programmes Settings", path: "/programmes/settings" },
  { title: "Registration", path: "/programmes/registration" },
  { title: "Smart Services NADI4U", path: "/programmes/nadi4u" },
  { title: "Smart Services NADI2U", path: "/programmes/nadi2u" },
  { title: "Others", path: "/programmes/others" },
];

export const reportItems = [
  // { title: "Reports Dashboard", path: "/report/dashboard" },
  // { title: "Usage Sessions", path: "/report/usage-sessions" },
  // { title: "Internet Access", path: "/report/internet-access" },
  // { title: "Preset Reports", path: "/report/preset-reports" },
  // { title: "Custom Reports", path: "/report/custom-reports" },
  { title: "Overview", path: "/reports" },
  { title: "NADI E-System", path: "/reports/nadi-e-system" },
  { title: "Internet Access", path: "/reports/internet-access" },
  { title: "Site Management", path: "/reports/site-management" },
  { title: "HR & Salary", path: "/reports/hr-salary" },
  { title: "Training", path: "/reports/training" },
  { title: "Comprehensive Maintenance", path: "/reports/cm" },
  { title: "Smart Services", path: "/reports/smart-services" },
];

export const workflowItems = [
  { title: "Workflow Configurations", path: "/workflow" },
];

export const memberManagementItems = [
  { title: "Member Management", path: "/member-management" },
  { title: "Activity Logs", path: "/member-management/activity" },
];

export const serviceModuleItems = [
  { title: "Service Information", path: "/services" },
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
  { title: "Site Management", path: "/site-management" },
  { title: "Usage", path: "/site-management/usage" },
  { title: "Booking Management", path: "/site-management/booking-management" },
  { title: "NADI Closure", path: "/site-management/closure" },
  { title: "Insurance", path: "/site-management/insurance" },
  {
    title: "Inventory Management",
    path: "/site-management/inventory-management",
  },
  { title: "Utilities Billing", path: "/site-management/utilities-billing" },
  { title: "Vendor Management", path: "/site-management/vendor-management" },
  { title: "KPI Performance", path: "/site-management/kpi-performance" },
  { title: "NMS", path: "/site-management/nms" },
];

export const dashboardItems = [
  { title: "Home", path: "/dahsboard/home" },
  { title: "Membership", path: "/dahsboard/member" },
  { title: "Smart Services", path: "/dahsboard/smart-services" },
  { title: "Operation", path: "/dahsboard/operation" },
  { title: "Takwim", path: "/dahsboard/takwim" },
  { title: "Claim", path: "/dahsboard/claim" },
  { title: "Staff Summary", path: "/dahsboard/staff-summary" },
  { title: "Leave Summary", path: "/dahsboard/leave-summary" },
  { title: "Attendance", path: "/dahsboard/attendance" },
  { title: "Site Management", path: "/dahsboard/site-management" },
  { title: "Staff Training", path: "/dahsboard/staff-training" },
  { title: "Payroll", path: "/dahsboard/payroll" },
  { title: "Calendar", path: "/dahsboard/calendar" },
  {
    title: "Leave Application Summary",
    path: "/dahsboard-leave-application-summary",
  },
  {
    title: "Replacement Leave Summary",
    path: "/dahsboard-replacement-leave-summary",
  },
  { title: "Events", path: "/dahsboard-events" },
  { title: "Health", path: "/dahsboard-health" },
  { title: "PC Booking", path: "/dahsboard-pc-booking" },
  { title: "Upcoming Event", path: "/dahsboard-upcoming-event" },
  { title: "Participations", path: "/dahsboard-participation" },
  { title: "Event Breakdown", path: "/dahsboard-event-breakdown" },
  { title: "Docket Status", path: "/dahsboard-docket-status" },
  { title: "Technician", path: "/dahsboard-technician" },
  { title: "Graph", path: "/dahsboard-graph" },
];

export const nadiDashboardItems = [
  { title: "NADI Dashboard", path: "/nadi-dashboard" },
  // { title: "NADI Information", path: "/nadi-dashboard-nadi-information" },
  // { title: "Membership", path: "/nadi-dashboard-membership" },
  // { title: "Events", path: "/nadi-dashboard-events" },
  // { title: "Maps", path: "/nadi-dashboard-aps" },
  // { title: "NADI Location", path: "/nadi-dashboard-nadi-location" },
  // { title: "Operation Hour", path: "/nadi-dashboard-operation-hour" },
  // { title: "Service Provider", path: "/nadi-dashboard-service-provider" },
  // { title: "Contact Information", path: "/nadi-dashboard-contact-information" },
  // { title: "Others", path: "/nadi-dashboard-others" },
];

export const iotDashboardItems = [
  { title: "IOT Dashboard", path: "/iot-dashboard" },
  // { title: "Rain Gauge", path: "/iot-dashboard-rain-gauge" },
  // { title: "Temperature", path: "/iot-dashboard-temperature" },
  // { title: "Humidity", path: "/iot-dashboard-humidity" },
  // { title: "Pressure", path: "/iot-dashboard-pressure" },
];

export const announcementsItems = [
  { title: "Announcements", path: "/announcements" },
  { title: "Create Announcements", path: "/announcements/create-announcement" },
  {
    title: "Announcements Settings",
    path: "/announcements/announcements-settings",
  },
];

export const takwimItems = [
  { title: "Takwim Management", path: "/takwim" },
  { title: "Takwim Settings", path: "/takwim/settings" },
];

export const bookingItems = [
  { title: "Booking Management", path: "/booking" },
  { title: "Booking Settings", path: "/booking/settings" },
];

export const vendorManagementItems = [
  { title: "Vendor Dashboard", path: "/vendor" },
  { title: "Vendor Companies", path: "/vendor/companies" },
  { title: "Vendor Admin Management", path: "/vendor/staff" },
  { title: "Vendor Staff Management", path: "/vendor/admin/staff/new" },
  { title: "Team Management", path: "/vendor/teams" },
  { title: "Contracts", path: "/vendor/contracts" },
  { title: "Reports", path: "/vendor/reports" },
];
