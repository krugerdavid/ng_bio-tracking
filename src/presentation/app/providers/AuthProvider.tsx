import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@domain/user/entities/User";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { LoginUseCase } from "@application/auth/use-cases/LoginUseCase";
import type { LogoutUseCase } from "@application/auth/use-cases/LogoutUseCase";
import type { AuthRepository } from "@domain/auth/AuthRepository";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loginUseCase = container.get<LoginUseCase>(TYPES.LoginUseCase);
  const logoutUseCase = container.get<LogoutUseCase>(TYPES.LogoutUseCase);
  const authRepository = container.get<AuthRepository>(TYPES.AuthRepository);

  useEffect(() => {
    let isMounted = true;
    let hasReceivedInitialState = false;

    // Listen to auth changes - this will fire immediately with current state
    // Similar to merchant-web's approach
    const unsubscribe = authRepository.onAuthStateChange(async currentUser => {
      if (isMounted) {
        if (!hasReceivedInitialState) {
          hasReceivedInitialState = true;
          // First callback is the initial state
          setUser(currentUser);
          setLoading(false);
        } else {
          // Subsequent callbacks are state changes
          setUser(currentUser);
        }
      }
    });

    // Fallback: if onAuthStateChange doesn't fire within 3 seconds, set loading to false
    // This handles cases where getUser() is slow or fails silently
    const timeout = setTimeout(() => {
      if (isMounted && !hasReceivedInitialState) {
        console.warn("Auth state change did not fire within timeout, setting loading to false");
        setUser(null);
        setLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [authRepository]);

  const login = async (email: string, password: string) => {
    const result = await loginUseCase.execute(email, password);
    if (result.isError()) {
      throw new Error(result.getError());
    }
    setUser(result.getValue());
  };

  const logout = async () => {
    const result = await logoutUseCase.execute();
    if (result.isError()) {
      throw new Error(result.getError());
    }
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
