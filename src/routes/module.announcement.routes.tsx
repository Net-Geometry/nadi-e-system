import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// import page based on module from menu
import Announcements from "@/pages/dashboard/announcements/Announcements";
import AnnouncementSettings from "@/pages/dashboard/announcements/AnnouncementSettings";
import CreateAnnouncement from "@/pages/dashboard/announcements/CreateAnnouncement";

export const dashboardRoutes = [
  // Setup routes for the module
  {
    path: "/announcements",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <Announcements />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/announcements/create-announcement",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <CreateAnnouncement />
      // </ProtectedRoute>
    ),
  },
  {
    path: "/announcements/announcements-settings",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <AnnouncementSettings />
      // </ProtectedRoute>
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
