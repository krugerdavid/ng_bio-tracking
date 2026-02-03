import { injectable } from "inversify";
import { Result } from "@core/types/Result";
import type { UserProfile, CreateUserProfileDTO, UpdateUserProfileDTO } from "@domain/user/entities/UserProfile";
import type { UserProfileRepository } from "@domain/user/UserProfileRepository";

const API_NOT_AVAILABLE = "User management is not available via the current API.";

/**
 * Stub implementation when the REST API does not expose user management (list/create/update/delete users).
 * Admin features (list users, create user, delete user) will show empty list or error until the API adds these endpoints.
 */
@injectable()
export class UserProfileRepositoryImpl implements UserProfileRepository {
  async create(data: CreateUserProfileDTO): Promise<Result<UserProfile>> {
    void data;
    return Result.error(API_NOT_AVAILABLE);
  }

  async findAll(): Promise<Result<UserProfile[]>> {
    return Result.success([]);
  }

  async findByUserId(userId: string): Promise<Result<UserProfile | null>> {
    void userId;
    return Result.success(null);
  }

  async update(userId: string, data: UpdateUserProfileDTO): Promise<Result<UserProfile>> {
    void userId;
    void data;
    return Result.error(API_NOT_AVAILABLE);
  }

  async delete(userId: string): Promise<Result<void>> {
    void userId;
    return Result.error(API_NOT_AVAILABLE);
  }
}
