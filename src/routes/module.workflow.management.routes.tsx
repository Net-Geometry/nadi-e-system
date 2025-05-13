import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// import page based on module from menu
import WorkflowConfiguration from "@/pages/dashboard/workflow/WorkflowConfiguration";
import WorkflowDashboard from "@/pages/workflow/Dashboard";

export const workflowRoutes = [
  // Setup routes for the module
  // Workflow Routes - Keep only configuration related routes
  {
    path: "/workflow",
    element: (
      // <ProtectedRoute requiredPermission="manage_workflows">
      <WorkflowDashboard />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/workflow/configuration",
    element: (
      // <ProtectedRoute requiredPermission="manage_workflow_configuration">
      <WorkflowConfiguration />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/workflow/configuration/:id",
    element: (
      // <ProtectedRoute requiredPermission="manage_workflow_configuration">
      <WorkflowConfiguration />
      // </ProtectedRoute>
    ),
  },
];

export const WorkflowRoutes = () => {
  return (
    <Routes>
      {workflowRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
