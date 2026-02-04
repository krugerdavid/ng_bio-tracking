import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { UserProfile, UpdateUserProfileDTO } from "@domain/user/entities/UserProfile";
import type { UserProfileRepository } from "@domain/user/UserProfileRepository";
import type { UserDomain } from "@domain/user/UserDomain";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class UpdateUserUseCase {
  constructor(
    @inject(TYPES.UserProfileRepository) private userProfileRepository: UserProfileRepository,
    @inject(TYPES.UserDomain) private userDomain: UserDomain
  ) {}

  async execute(userId: string, data: UpdateUserProfileDTO): Promise<Result<UserProfile>> {
    try {
      if (data.password !== undefined && data.password !== "") {
        this.userDomain.validateUserProfile({ password: data.password });
      }
      return await this.userProfileRepository.update(userId, data);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Error al actualizar usuario");
    }
  }
}
