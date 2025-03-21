
import {
  LayoutDashboard,
  Settings,
  Users,
  Shield,
  UserCog,
  Activity,
  FileBarChart,
  Bell,
  Calendar,
  Briefcase,
  UserPlus,
  ClipboardCheck,
  Clock,
  ShoppingCart,
  Barcode,
  Receipt,
  Box,
  Package,
  DollarSign,
  List,
  FileText,
  Cog,
  ChartBar,
  Timer,
  User,
  Database,
  CreditCard,
  MessageSquare,
  Flag,
  Wallet,
  Gauge,
  FileCheck,
  Eye,
  Layout,
  Building,
  GitBranch,
  CheckSquare,
  BarChart,
  Users2,
} from "lucide-react";
import { MenuItem } from "@/types/menu";

export const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { title: "User Management", icon: Users, path: "/admin/users" },
  { title: "User Groups", icon: Users2, path: "/admin/user-groups" },
  { title: "Roles & Permissions", icon: Shield, path: "/admin/roles" },
  { title: "Menu Visibility", icon: Eye, path: "/admin/menu-visibility" },
  { title: "Activity Log", icon: Activity, path: "/admin/activity" },
  // { title: "Calendar", icon: Calendar, path: "/admin/calendar" },
  {
    title: "State Holidays",
    icon: Calendar,
    path: "/admin/state-holidays",
    visibleTo: ["super_admin"],
  },
  { title: "Notifications", icon: Bell, path: "/admin/notifications" },
  { title: "Organizations", icon: Users, path: "/admin/organizations" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

export const hrMenuItems = [
  { title: "HR Dashboard", icon: Briefcase, path: "/hr" },
  { title: "Site Staff Management", icon: Users, path: "/hr/employees" },
  { title: "Attendance", icon: ClipboardCheck, path: "/hr/attendance" },
  { title: "Leave Management", icon: Clock, path: "/hr/leave" },
];

export const posMenuItems = [
  { title: "POS Dashboard", icon: ShoppingCart, path: "/pos" },
  { title: "Products", icon: Barcode, path: "/pos/products" },
  { title: "Transactions", icon: Receipt, path: "/pos/transactions" },
];

export const claimItems = [
  { title: "Claims Dashboard", icon: FileText, path: "/claim" },
  { title: "Claims Settings", icon: Cog, path: "/claim/settings" },
];

export const assetItems = [
  { title: "Asset Dashboard", icon: Box, path: "/asset" },
  { title: "Asset Settings", icon: Cog, path: "/asset/settings" },
];

export const financeItems = [
  { title: "Finance Dashboard", icon: DollarSign, path: "/finance" },
  { title: "Finance Settings", icon: Cog, path: "/finance/settings" },
];

export const programmesItems = [
  { title: "Programmes Dashboard", icon: List, path: "/programmes" },
  { title: "Programmes Settings", icon: Cog, path: "/programmes/settings" },
];

export const reportItems = [
  { title: "Reports Dashboard", icon: ChartBar, path: "/report/dashboard" },
  { title: "Usage Sessions", icon: Timer, path: "/report/usage-sessions" },
  { title: "Internet Access", icon: Timer, path: "/report/internet-access" },
];

export const workflowItems: MenuItem[] = [
  {
    title: "Workflow Configurations",
    path: "/workflow",
    icon: Settings,
  },
];

export const memberManagementItems = [
  { title: "Personal Details", icon: User, path: "/members/details" },
  { title: "Registration", icon: UserPlus, path: "/members/registration" },
  { title: "Activity Logs", icon: Activity, path: "/members/activity" },
];

export const serviceModuleItems = [
  { title: "Service Information", icon: Database, path: "/services/info" },
  { title: "Transactions", icon: CreditCard, path: "/services/transactions" },
];

export const communityItems = [
  { title: "Community Dashboard", icon: MessageSquare, path: "/community" },
  { title: "Moderation", icon: Flag, path: "/community/moderation" },
];

export const financialItems = [
  { title: "Wallet", icon: Wallet, path: "/financial/wallet" },
  { title: "Transactions", icon: Receipt, path: "/financial/transactions" },
];

export const complianceItems = [
  { title: "Audit Logs", icon: FileCheck, path: "/compliance/audit" },
  { title: "System Reports", icon: Gauge, path: "/compliance/reports" },
];

export const siteManagementItems = [
  { title: "Site Management", icon: Building, path: "/site-management/main" },
  { title: "Site Detail", icon: Building, path: "/site" },
];


