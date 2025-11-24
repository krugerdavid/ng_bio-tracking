import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { PrivateRoute } from "./PrivateRoute";
import LoginPage from "../../features/auth/pages/LoginPage";

// Lazy load page controllers to avoid loading all data on login
const MemberListPageController = lazy(() => import("../../features/members/pages/MemberListPageController"));
const MemberDetailPageController = lazy(() => import("../../features/members/pages/MemberDetailPageController"));

const UserManagementPageController = lazy(() => import("../../features/admin/pages/UserManagementPageController"));

// Loading component for lazy loaded routes
const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
  </div>
);

// Routes configuration - similar to merchant-web
export const routesConfig = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: (
              <Suspense fallback={<PageLoader />}>
                <MemberListPageController />
              </Suspense>
            ),
          },
          {
            path: "/members",
            element: (
              <Suspense fallback={<PageLoader />}>
                <MemberListPageController />
              </Suspense>
            ),
          },
          {
            path: "/member/:memberId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <MemberDetailPageController />
              </Suspense>
            ),
          },
          {
            path: "/users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserManagementPageController />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

const router = createBrowserRouter(routesConfig);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
