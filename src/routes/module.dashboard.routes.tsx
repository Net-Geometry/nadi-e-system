import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// import page based on module from menu
import SiteManagementDashboard from "@/pages/dashboard/main-dashboard/SiteManagementDashboard";

const SiteManagementDashboardPage = lazy(() =>
  Promise.resolve({ default: SiteManagementDashboard })
);

export const dashboardRoutes = [
  // Setup routes for the module
  {
    path: "/dashboard/site-management",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="view_site_details"> */}
        <SiteManagementDashboard />
        {/* </ProtectedRoute> */}
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
