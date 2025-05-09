import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import MemberManagement from "@/pages/dashboard/members/MemberManagement";
import Registration from "@/pages/dashboard/members/Registration";
import ActivityLogs from "@/pages/dashboard/members/ActivityLogs";
import MemberProfile from "@/pages/dashboard/members/MemberProfilePages";

// Implement lazy loading for the Dashboard component
const MemberManagementPage = lazy(() => Promise.resolve({ default: MemberManagement }));
const RegistrationPage = lazy(() => Promise.resolve({ default: Registration }));
const ActivityLogsPage = lazy(() => Promise.resolve({ default: ActivityLogs }));
const MemberProfilePage = lazy(() => Promise.resolve({ default: MemberProfile }));

export const memberRoutes = [
  {
    path: "/member-management",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <MemberManagementPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/member-management/profile",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <MemberProfilePage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/member-management/registration",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <RegistrationPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/member-management/activity",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <ActivityLogsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
];

export const MemberRoutes = () => {
  return (
    <Routes>
      {memberRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};


