import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import AuditLogs from "@/pages/dashboard/compliance/AuditLogs";
import ComplianceReports from "@/pages/dashboard/compliance/ComplianceReports";

export const complianceRoutes = [
  // Compliance Routes
  {
    path: "/compliance/audit",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        {/* <ProtectedRoute requiredPermission="view_audit_logs"> */}
        <AuditLogs />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
  {
    path: "/compliance/reports",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        // {/* <ProtectedRoute requiredPermission="view_compliance_reports"> */}
        <ComplianceReports />
        {/* </ProtectedRoute> */}
      </Suspense>
    ),
  },
];

export const ComplianceRoutes = () => {
  return (
    <Routes>
      {complianceRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
