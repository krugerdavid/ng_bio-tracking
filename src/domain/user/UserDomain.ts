import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { UserProfileRepository } from "./UserProfileRepository";
import type { User } from "./entities/User";
import type { UserProfile, CreateUserProfileDTO } from "./entities/UserProfile";
import { Role, isAdmin } from "../shared/value-objects/Role";
import { ValidationError } from "@core/errors/DomainError";

/**
 * Domain service for User business logic
 */
@injectable()
export class UserDomain {
  constructor(@inject(TYPES.UserProfileRepository) private readonly userProfileRepository: UserProfileRepository) {}

  /**
   * Check if user has admin role
   */
  isAdmin(user: User): boolean {
    return isAdmin(user.role);
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length < 6) {
      return { isValid: false, error: "Password must be at least 6 characters long" };
    }
    return { isValid: true };
  }

  /**
   * Validate user profile data
   */
  validateUserProfile(data: Partial<CreateUserProfileDTO>): void {
    if (data.email && !this.validateEmail(data.email)) {
      throw new ValidationError("Invalid email format", "email");
    }

    if (data.password) {
      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new ValidationError(passwordValidation.error || "Invalid password", "password");
      }
    }

    if (data.role && !Object.values(Role).includes(data.role)) {
      throw new ValidationError("Invalid role", "role");
    }
  }

  /**
   * Create user profile with validation
   */
  async createUserProfile(data: CreateUserProfileDTO): Promise<Result<UserProfile>> {
    this.validateUserProfile(data);
    return await this.userProfileRepository.create(data);
  }
}
