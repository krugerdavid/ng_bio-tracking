import { useCallback, useEffect, useMemo, useState } from "react";
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
    const unsubscribe = authRepository.onAuthStateChange(async (user: User | null) => {
      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false,
        isAuthenticated: user !== null,
        error: null,
      }));
    });

    return unsubscribe;
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
