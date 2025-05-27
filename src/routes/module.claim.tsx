import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load components
const ClaimDashboard = lazy(() => import("@/pages/dashboard/claim/ClaimDashboard"));
const ClaimSettings = lazy(() => import("@/pages/dashboard/claim/ClaimSettings"));
const ClaimRegister = lazy(() => import("@/pages/dashboard/claim/ClaimRegister"));
// const ClaimRegister = lazy(() => import("@/pages/dashboard/claim/ClaimRegister"));
// const ClaimList = lazy(() => import("@/pages/dashboard/claim/ClaimList"));
// const ClaimReport = lazy(() => import("@/pages/dashboard/claim/ClaimReport"));

export const claimRoutes = [
    {
        path: "/claim",
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                {/* <ProtectedRoute requiredPermission=""> */}
                <ClaimDashboard />
                {/* </ProtectedRoute> */}
            </Suspense>
        ),
    },
    {
        path: "/claim/settings",
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                {/* <ProtectedRoute requiredPermission=""> */}
                <ClaimSettings />
                {/* </ProtectedRoute> */}
            </Suspense>
        ),
    },
    {
        path: "/claim/register",
        element: (
            <Suspense fallback={<LoadingSpinner />}>
                {/* <ProtectedRoute requiredPermission=""> */}
                <ClaimRegister/>
                {/* </ProtectedRoute> */}
            </Suspense>
        ),
    },
    // {
    //     path: "/claim/list-record",
    //     element: (
    //         <Suspense fallback={<LoadingSpinner />}>
    //             {/* <ProtectedRoute requiredPermission=""> */}
    //             <ClaimList />
    //             {/* </ProtectedRoute> */}
    //         </Suspense>
    //     ),
    // },
    // {
    //     path: "/claim/report",
    //     element: (
    //         <Suspense fallback={<LoadingSpinner />}>
    //             {/* <ProtectedRoute requiredPermission=""> */}
    //             <ClaimReport />
    //             {/* </ProtectedRoute> */}
    //         </Suspense>
    //     ),
    // },
];

export const ClaimRoutes = () => {
    return (
        <Routes>
            {claimRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
            ))}
        </Routes>
    );
};
