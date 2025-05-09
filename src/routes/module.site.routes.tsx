import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import SiteManagement from "@/pages/dashboard/site/SiteManagement";
import Usage from "@/pages/dashboard/site/Usage";
import  BookingManagement  from "@/pages/dashboard/site/BookingManagement";
import SiteClosure from "@/pages/dashboard/site/SiteClosure";
import Insurance from "@/pages/dashboard/site/Insurance";
import InventoryManagement from "@/pages/dashboard/site/InventoryManagement";
import UtilitiesBilling from "@/pages/dashboard/site/UtilitiesBilling";
import VendorManagement from "@/pages/dashboard/vendor/VendorManagement";
import KPIPerformance from "@/pages/dashboard/site/KPIPerformance";
import NMS from "@/pages/dashboard/site/NMS";
import SiteDetails from "@/pages/dashboard/site/SiteDetail";



// Implement lazy loading for the Dashboard component
const SiteManagementPage = lazy(() => Promise.resolve({ default: SiteManagement }));
const UsagePage = lazy(() => Promise.resolve({ default: Usage }));
const BookingManagementPage = lazy(() => Promise.resolve({ default: BookingManagement }));
const SiteClosurePage = lazy(() => Promise.resolve({ default: SiteClosure }));
const InsurancePage = lazy(() => Promise.resolve({ default: Insurance }));
const InventoryManagementPage = lazy(() => Promise.resolve({ default: InventoryManagement }));
const UtilitiesBillingPage = lazy(() => Promise.resolve({ default: UtilitiesBilling }));
const VendorManagementPage = lazy(() => Promise.resolve({ default: VendorManagement }));
const KPIPerformancePage = lazy(() => Promise.resolve({ default: KPIPerformance }));
const NMSPage = lazy(() => Promise.resolve({ default: NMS }));

export const siteRoutes = [
  {
    path: "/site-management",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <SiteManagementPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/site",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <SiteDetails />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/usage",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <UsagePage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/booking-management",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <BookingManagementPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/site-closure",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <SiteClosurePage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/insurance",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <InsurancePage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/inventory-management",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <InventoryManagementPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/utilities-billing",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <UtilitiesBillingPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/vendor-management",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <VendorManagementPage/>
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/kpi-performance",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <KPIPerformancePage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/site-management/nms",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission=""> */}
        <NMSPage />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
];

export const SiteRoutes = () => {
  return (
    <Routes>
      {siteRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
