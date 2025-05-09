import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import InventoryDashboard from "@/pages/dashboard/inventory/InventoryDashboard";
import InventorySettings from "@/pages/dashboard/inventory/InventorySettings";
import ServiceInfo from "@/pages/dashboard/services/ServiceInfo";
import ServiceTransactions from "@/pages/dashboard/services/Transactions";

// Implement lazy loading for the Dashboard component
const ServiceInfoPage = lazy(() => Promise.resolve({ default: ServiceInfo }));
const ServiceTransactionsPage = lazy(() => Promise.resolve({ default: ServiceTransactions })); 

export const inventoryRoutes = [
  {
    path: "/services",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <ServiceInfoPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/services/transactions",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <ServiceTransactionsPage />
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


