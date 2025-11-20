import type { Result } from "@core/types/Result";
import type { User } from "../user/entities/User";

export interface AuthRepository {
  login(email: string, password: string): Promise<Result<User>>;
  logout(): Promise<Result<void>>;
  getCurrentUser(): Promise<Result<User | null>>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}
