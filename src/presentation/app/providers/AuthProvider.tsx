import { useCallback, useEffect, useMemo, useState } from "react";
import * as Sentry from "@sentry/react";
import { container, TYPES } from "@core/container/DIContainer";
import type { AuthRepository } from "@domain/auth/AuthRepository";
import type { User } from "@domain/user/entities/User";
import { Result } from "@core/types/Result";
import { AuthContext, type AuthContextType, type AuthState } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const authRepository = container.get<AuthRepository>(TYPES.AuthRepository);

  useEffect(() => {
    let cancelled = false;

    // Obtener sesión inicial de forma explícita (Supabase onAuthStateChange no siempre dispara al montar)
    authRepository.getCurrentUser().then(result => {
      if (cancelled) return;
      const user = result.isSuccess() ? result.getValue() : null;
      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false,
        isAuthenticated: user !== null,
        error: null,
      }));
    });

    const unsubscribe = authRepository.onAuthStateChange((user: User | null) => {
      if (cancelled) return;
      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false,
        isAuthenticated: user !== null,
        error: null,
      }));
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [authRepository]);

  const login = useCallback(
    async (email: string, password: string): Promise<Result<void>> => {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await authRepository.login(email, password);

      if (result.isError()) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          error: result.getError(),
        }));
        return Result.error(result.getError());
      }

      // Auth state will be updated by onAuthStateChange listener
      return Result.success(undefined);
    },
    [authRepository]
  );

  const logout = useCallback(async (): Promise<Result<void>> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    const result = await authRepository.logout();

    if (result.isError()) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: result.getError(),
      }));
      return Result.error(result.getError());
    }

    // Auth state will be updated by onAuthStateChange listener
    return Result.success(undefined);
  }, [authRepository]);

  const clearAuthError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Asocia el usuario logueado a los eventos de Sentry (no-op si Sentry no está inicializado).
  useEffect(() => {
    const user = authState.user;
    Sentry.setUser(user ? { id: user.id, email: user.email, username: user.name ?? user.email } : null);
  }, [authState.user]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      authState,
      login,
      logout,
      clearAuthError,
    }),
    [authState, login, logout, clearAuthError]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
