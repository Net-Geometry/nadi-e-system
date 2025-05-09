import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import InventoryDashboard from "@/pages/dashboard/inventory/InventoryDashboard";
import InventorySettings from "@/pages/dashboard/inventory/InventorySettings";

// Implement lazy loading for the Dashboard component
const InventoryDashboardPage = lazy(() => Promise.resolve({ default: InventoryDashboard }));
const InventorySettingsPage = lazy(() => Promise.resolve({ default: InventorySettings }));


export const inventoryRoutes = [
  {
    path: "/inventory",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <InventoryDashboardPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/inventory/settings",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <InventorySettingsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
];

export const InventoryRoutes = () => {
  return (
    <Routes>
      {inventoryRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};


