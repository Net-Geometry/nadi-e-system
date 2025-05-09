import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import POSDashboard from "@/pages/dashboard/pos/POSDashboard";
import Products from "@/pages/dashboard/pos/Products";
import Transactions from "@/pages/dashboard/pos/Transactions";
import Pudo from "@/pages/dashboard/pos/Pudo";

// Implement lazy loading for the Dashboard component
const POSDashboardPage = lazy(() => Promise.resolve({ default: POSDashboard }));
const ProductsPage = lazy(() => Promise.resolve({ default: Products }));
const TransactionsPage = lazy(() => Promise.resolve({ default: Transactions }));
const PudoPage = lazy(() => Promise.resolve({ default: Pudo }));

export const posRoutes = [
  {
    path: "/pos",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <POSDashboardPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/pos/products",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <ProductsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/pos/transactions",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <TransactionsPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/pos/pudo",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <PudoPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
];

export const PosRoutes = () => {
  return (
    <Routes>
      {posRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};