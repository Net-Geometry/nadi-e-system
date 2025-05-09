import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// import page based on module from menu
import Takwim from "@/pages/dashboard/takwim/Takwim";

export const takwimRoutes = [
  // Setup routes for the module
  {
    path: "/takwim",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <Takwim />
      // </ProtectedRoute>
    ),
  },
];

export const TakwimRoutes = () => {
  return (
    <Routes>
      {takwimRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
