import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Dashboard from "@/pages/dashboard/Dashboard";
import Users from "@/pages/dashboard/Users";
import Roles from "@/pages/dashboard/Roles";
import RoleConfig from "@/pages/dashboard/Permissions";
import MenuVisibility from "@/pages/dashboard/MenuVisibility";
import ActivityLog from "@/pages/dashboard/Activity";
import StateHolidays from "@/pages/dashboard/StateHolidays";
import Organizations from "@/pages/dashboard/Organizations";
import Settings from "@/pages/dashboard/Settings";
import UserGroups from "@/pages/dashboard/UserGroups";
import LookupSettings from "@/pages/dashboard/LookupSettings";
import UserProfile from "@/pages/dashboard/profile/UserProfile";
import NotificationManagement from "@/pages/dashboard/NotificationManagement";
import NotificationUsage from "@/pages/dashboard/NotificationUsage";
import OrganizationDetails from "@/pages/dashboard/OrganizationDetails";

// Implement lazy loading for the Dashboard component
const DashboardPage = lazy(() => Promise.resolve({ default: Dashboard }));
const UsersPage = lazy(() => Promise.resolve({ default: Users }));
const RolesPage = lazy(() => Promise.resolve({ default: Roles }));
const PermissionsPage = lazy(() => Promise.resolve({ default: RoleConfig }));
const SettingsPage = lazy(() => Promise.resolve({ default: Settings }));
const MenuVisibilityPage = lazy(() =>
  Promise.resolve({ default: MenuVisibility })
);
const ActivityLogPage = lazy(() => Promise.resolve({ default: ActivityLog }));
const OrganizationsPage = lazy(() =>
  Promise.resolve({ default: Organizations })
);
const OrganizationDetailsPage = lazy(() =>
  Promise.resolve({ default: OrganizationDetails })
);
const StateHolidaysPage = lazy(() =>
  Promise.resolve({ default: StateHolidays })
);
const UserGroupsPage = lazy(() => Promise.resolve({ default: UserGroups }));
const LookupSettingsPage = lazy(() =>
  Promise.resolve({ default: LookupSettings })
);

export const adminRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <DashboardPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <UsersPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/user-groups",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <UserGroupsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/roles",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <RolesPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/permissions",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <PermissionsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/menu-visibility",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <MenuVisibilityPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/activity",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <ActivityLogPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/state-holidays",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <StateHolidaysPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/organizations",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <OrganizationsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <SettingsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/lookup-settings",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <LookupSettingsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/dashboard/profile",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <UserProfile />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/notification-management",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <NotificationManagement />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/admin/notification-usage",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="manage_site_staff"> */}
        <NotificationUsage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
];

export const AdminRoutes = () => {
  return (
    <Routes>
      {adminRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
