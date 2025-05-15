import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/dashboard/Dashboard";
import UsersPage from "@/pages/dashboard/Users";
import RolesPage from "@/pages/dashboard/Roles";
import PermissionsPage from "@/pages/dashboard/Permissions";
import MenuVisibilityPage from "@/pages/dashboard/MenuVisibility";
import ActivityLogPage from "@/pages/dashboard/Activity";
import StateHolidaysPage from "@/pages/dashboard/StateHolidays";
import OrganizationsPage from "@/pages/dashboard/Organizations";
import SettingsPage from "@/pages/dashboard/Settings";
import UserGroupsPage from "@/pages/dashboard/UserGroups";
import LookupSettingsPage from "@/pages/dashboard/LookupSettings";
import UserProfile from "@/pages/dashboard/profile/UserProfile";
import NotificationManagement from "@/pages/dashboard/NotificationManagement";
import NotificationUsage from "@/pages/dashboard/NotificationUsage";

// Lazy load dashboard components
const DashboardPage = lazy(() => Promise.resolve({ default: Dashboard }));
const Users = lazy(() => import("@/pages/dashboard/Users"));
const Roles = lazy(() => import("@/pages/dashboard/Roles"));
const RoleConfig = lazy(() => import("@/pages/dashboard/RoleConfig"));
const Settings = lazy(() => import("@/pages/dashboard/Settings"));
const AccessControl = lazy(() => import("@/pages/dashboard/AccessControl"));
const MenuVisibility = lazy(() => import("@/pages/dashboard/MenuVisibility"));
const Activity = lazy(() => import("@/pages/dashboard/Activity"));
const Reports = lazy(() => import("@/pages/dashboard/Reports"));
const Calendar = lazy(() => import("@/pages/dashboard/Calendar"));
const Notifications = lazy(() => import("@/pages/dashboard/Notifications"));
const SiteManagement = lazy(
  () => import("@/pages/dashboard/site/SiteManagement")
);
const Profile = lazy(() => import("@/pages/dashboard/Profile"));
const UsageSessions = lazy(() => import("@/pages/dashboard/UsageSessions"));
const Organizations = lazy(() => import("@/pages/dashboard/Organizations"));
const OrganizationDetails = lazy(
  () => import("@/pages/dashboard/OrganizationDetails")
);
const ParameterSettings = lazy(
  () => import("@/pages/dashboard/OrganizationDetails")
);
const StateHolidays = lazy(() => import("@/pages/dashboard/StateHolidays"));

export const dashboardRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <DashboardPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <UsersPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/user-groups",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <UserGroupsPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/roles",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <RolesPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/permissions",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <PermissionsPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/menu-visibility",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <MenuVisibilityPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/activity",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <ActivityLogPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/state-holidays",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <StateHolidaysPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/organizations",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <OrganizationsPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <SettingsPage />
      </Suspense>
    ),
  },
  {
    path: "/admin/lookup-settings",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <LookupSettingsPage />
      </Suspense>
    ),
  },
  {
    path: "/dashboard/profile",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile />
      </Suspense>
    ),
  },
  {
    path: "/admin/notification-management",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotificationManagement />,
      </Suspense>
    ),
  },
  {
    path: "/admin/notification-usage",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotificationUsage />,
      </Suspense>
    ),
  },
];

export const DashboardRoutes = () => {
  return (
    <Routes>
      {dashboardRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
