import type { Result } from "@core/types/Result";
import type { UserProfile, CreateUserProfileDTO, UpdateUserProfileDTO } from "./entities/UserProfile";

export interface UserProfileRepository {
  create(data: CreateUserProfileDTO): Promise<Result<UserProfile>>;
  findAll(): Promise<Result<UserProfile[]>>;
  findByUserId(userId: string): Promise<Result<UserProfile | null>>;
  update(userId: string, data: UpdateUserProfileDTO): Promise<Result<UserProfile>>;
  delete(userId: string): Promise<Result<void>>;
}
