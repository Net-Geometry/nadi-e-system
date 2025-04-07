
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import Landing from "@/pages/Landing";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import MemberLogin from "@/pages/auth/MemberLogin";
import { dashboardRoutes, DashboardRoutes } from "@/routes/dashboard.routes";
import { memberRoutes } from "@/routes/member.routes";
import { moduleRoutes } from "@/routes/module.routes";
import UIComponents from "@/pages/UIComponents";
import OrganizationDetails from "@/pages/dashboard/OrganizationDetails";

// Import example pages
import HomeExample from "@/pages/examples/HomeExample";
import DetailExample from "@/pages/examples/DetailExample";
import SettingsExample from "@/pages/examples/SettingsExample";

const queryClient = new QueryClient();

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/member-login" element={<MemberLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/ui-components" element={<UIComponents />} />

              {/* Example Pages */}
              <Route path="/examples/home" element={<HomeExample />} />
              <Route path="/examples/detail" element={<DetailExample />} />
              <Route path="/examples/settings" element={<SettingsExample />} />

              {/* Add organization details route */}
              <Route
                path="/admin/organizations/:id"
                element={<OrganizationDetails />}
              />

              {/* Dashboard routes */}
              {dashboardRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      {route.element}
                    </Suspense>
                  }
                />
              ))}

              {/* Member routes */}
              {Array.isArray(memberRoutes) &&
                memberRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        {route.element}
                      </Suspense>
                    }
                  />
                ))}

              {/* Module routes */}
              {Array.isArray(moduleRoutes) &&
                moduleRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        {route.element}
                      </Suspense>
                    }
                  />
                ))}
            </Routes>
          </Suspense>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
