import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { PrivateRoute } from "./PrivateRoute";
import LoginPage from "@presentation/features/auth/pages/LoginPage";
import { PageLoader } from "@presentation/shared/components/PageLoader";

// Lazy load page controllers to avoid loading all data on login
const MemberListPageController = lazy(() => import("@presentation/features/members/pages/MemberListPageController"));
const MemberDetailPageController = lazy(
  () => import("@presentation/features/members/pages/MemberDetailPageController")
);

const UserManagementPageController = lazy(
  () => import("@presentation/features/admin/pages/UserManagementPageController")
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
