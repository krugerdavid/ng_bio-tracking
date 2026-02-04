import { Navigate } from "react-router-dom";
import { useAuth } from "@presentation/shared/hooks/useAuth";
import type { Role } from "@domain/shared/value-objects/Role";

/**
 * Protege rutas por rol: solo usuarios con uno de los roles permitidos pueden acceder.
 * Sigue DRY: un único guard reutilizable en lugar de AdminOrRootRoute, RootOnlyRoute, etc.
 */
export function RequireRoleRoute({
  children,
  allowedRoles,
  redirectTo = "/",
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}) {
  const { authState } = useAuth();
  const user = authState.user;
  const allowed = user && allowedRoles.length > 0 && allowedRoles.includes(user.role);

  if (authState.isLoading || !user) {
    return null;
  }

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
