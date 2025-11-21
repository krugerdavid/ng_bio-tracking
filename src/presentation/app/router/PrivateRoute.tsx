import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@presentation/shared/hooks/useAuth";

export function PrivateRoute() {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <img src="/ngtraining.png" alt="NG Training Logo" className="h-24 w-auto" />
          <div className="text-slate-900  font-bold flex items-center gap-2 text-lg uppercase">
            <div className="animate-spin rounded-full h-5 w-5 border-4 border-orange-500 border-t-transparent"></div>
            Cargando
          </div>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
