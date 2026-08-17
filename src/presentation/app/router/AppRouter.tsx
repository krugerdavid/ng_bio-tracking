import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { PrivateRoute } from "./PrivateRoute";
import { RequireRoleRoute } from "./RequireRoleRoute";
import { HomeRouteController } from "./HomeRouteController";
import LoginPage from "@presentation/features/auth/pages/LoginPage";
import AcceptInvitePage from "@presentation/features/auth/pages/AcceptInvitePage";
import RegisterPage from "@presentation/features/auth/pages/RegisterPage";
import { Role } from "@domain/shared/value-objects/Role";
import { PageLoader } from "@presentation/shared/components/PageLoader";

// Lazy load page controllers to avoid loading all data on login
const MemberListPageController = lazy(() => import("@presentation/features/members/pages/MemberListPageController"));
const MemberDetailPageController = lazy(
  () => import("@presentation/features/members/pages/MemberDetailPageController")
);

const UserManagementPageController = lazy(
  () => import("@presentation/features/admin/pages/UserManagementPageController")
);

const AuditLogPageController = lazy(() => import("@presentation/features/audit/pages/AuditLogPageController"));

// Routes configuration - similar to merchant-web
export const routesConfig = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/accept-invite",
    element: <AcceptInvitePage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <HomeRouteController />,
          },
          {
            path: "/members",
            element: (
              <RequireRoleRoute allowedRoles={[Role.ADMIN, Role.ROOT]}>
                <Suspense fallback={<PageLoader />}>
                  <MemberListPageController />
                </Suspense>
              </RequireRoleRoute>
            ),
          },
          {
            path: "/member/:memberId",
            element: (
              <RequireRoleRoute allowedRoles={[Role.ADMIN, Role.ROOT]}>
                <Suspense fallback={<PageLoader />}>
                  <MemberDetailPageController />
                </Suspense>
              </RequireRoleRoute>
            ),
          },
          {
            path: "/users",
            element: (
              <RequireRoleRoute allowedRoles={[Role.ADMIN, Role.ROOT]}>
                <Suspense fallback={<PageLoader />}>
                  <UserManagementPageController />
                </Suspense>
              </RequireRoleRoute>
            ),
          },
          {
            path: "/audit-logs",
            element: (
              <RequireRoleRoute allowedRoles={[Role.ROOT]}>
                <Suspense fallback={<PageLoader />}>
                  <AuditLogPageController />
                </Suspense>
              </RequireRoleRoute>
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
