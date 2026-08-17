import { Suspense, lazy } from "react";
import { useAuth } from "@presentation/shared/hooks/useAuth";
import { isUser } from "@domain/shared/value-objects/Role";
import { PageLoader } from "@presentation/shared/components/PageLoader";

const DashboardPageController = lazy(() => import("@presentation/features/dashboard/pages/DashboardPageController"));
const MemberHomePageController = lazy(
  () => import("@presentation/features/member-home/pages/MemberHomePageController")
);

/**
 * Ruta "/": admin/root ven el dashboard global; un alumno (role=user/member) ve su
 * propia ficha de solo lectura en vez de la pantalla de admin.
 */
export function HomeRouteController() {
  const { authState } = useAuth();

  if (authState.isLoading || !authState.user) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      {isUser(authState.user.role) ? <MemberHomePageController /> : <DashboardPageController />}
    </Suspense>
  );
}
