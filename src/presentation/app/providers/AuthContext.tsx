import { createContext } from "react";
import type { User } from "@domain/user/entities/User";
import { Result } from "@core/types/Result";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<Result<void>>;
  logout: () => Promise<Result<void>>;
  clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
