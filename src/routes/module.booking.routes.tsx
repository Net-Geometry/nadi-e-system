import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { BookingManagement } from "@/pages/dashboard/site/BookingManagement";

export const bookingRoutes = [
  {
    path: "/site/booking-management",
    element: (
      // <ProtectedRoute requiredPermission="view_site_details">
      <BookingManagement />
      // </ProtectedRoute>
    ),
  },
];

export const BookingRoutes = () => {
  return (
    <Routes>
      {bookingRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
