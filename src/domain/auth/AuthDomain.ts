import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import type { AuthRepository } from "./AuthRepository";
import type { User } from "../user/entities/User";
import { UnauthorizedError } from "@core/errors/DomainError";

/**
 * Domain service for authentication business logic
 */
@injectable()
export class AuthDomain {
  constructor(@inject(TYPES.AuthRepository) private readonly authRepository: AuthRepository) {}

  /**
   * Authenticate user with email and password
   * @deprecated Use AuthRepository directly or LoginUseCase
   */
  async login(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new UnauthorizedError("Email and password are required");
    }

    const result = await this.authRepository.login(email, password);
    if (result.isError()) {
      throw new UnauthorizedError(result.getError());
    }
    return result.getValue();
  }

  /**
   * Logout current user
   * @deprecated Use AuthRepository directly or LogoutUseCase
   */
  async logout(): Promise<void> {
    const result = await this.authRepository.logout();
    if (result.isError()) {
      throw new Error(result.getError());
    }
  }

  /**
   * Get current authenticated user
   * @deprecated Use AuthRepository directly or GetCurrentUserUseCase
   */
  async getCurrentUser(): Promise<User | null> {
    const result = await this.authRepository.getCurrentUser();
    if (result.isError()) {
      return null;
    }
    return result.getValue();
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return this.authRepository.onAuthStateChange(callback);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}
