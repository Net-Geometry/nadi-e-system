import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// import page based on module from menu
import ServiceInfo from "@/pages/dashboard/services/ServiceInfo";
import ServiceTransactions from "@/pages/dashboard/services/Transactions";

export const serviceRoutes = [
  // Setup routes for the module
  {
    path: "/services/info",
    element: (
      // <ProtectedRoute requiredPermission="view_services">
      <ServiceInfo />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/services/transactions",
    element: (
      // <ProtectedRoute requiredPermission="view_service_transactions">
      <ServiceTransactions />
      // </ProtectedRoute>
    ),
  },
];

export const ServiceRoutes = () => {
  return (
    <Routes>
      {serviceRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
