import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { PrivateRoute } from "./PrivateRoute";
import LoginPage from "../../features/auth/pages/LoginPage";
import MemberListPageController from "../../features/members/pages/MemberListPageController";
import MemberDetailPageController from "../../features/members/pages/MemberDetailPageController";
import RegisterMemberPageController from "../../features/members/pages/RegisterMemberPageController";
import UserManagementPageController from "../../features/admin/pages/UserManagementPageController";

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
            element: <MemberListPageController />,
          },
          {
            path: "/members",
            element: <MemberListPageController />,
          },
          {
            path: "/register-member",
            element: <RegisterMemberPageController />,
          },
          {
            path: "/member/:memberId",
            element: <MemberDetailPageController />,
          },
          {
            path: "/users",
            element: <UserManagementPageController />,
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
