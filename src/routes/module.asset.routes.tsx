import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";


import AssetDashboard from "@/pages/dashboard/asset/AssetDashboard";
import AssetDetails from "@/pages/dashboard/asset/AssetDetails";
import AssetSettings from "@/pages/dashboard/asset/AssetSettings";

// Implement lazy loading for the Dashboard component
const AssetDashboardPage = lazy(() => Promise.resolve({ default: AssetDashboard }));
const AssetDetailsPage = lazy(() => Promise.resolve({ default: AssetDetails }));
const AssetSettingsPage = lazy(() => Promise.resolve({ default: AssetSettings }));


export const assetRoutes = [
  {
    path: "/asset",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <AssetDashboardPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/asset/detail/:id",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <AssetDetailsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/asset/settings",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <AssetSettingsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
];

export const AssetRoutes = () => {
  return (
    <Routes>
      {assetRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};


