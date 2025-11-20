import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { UserProfileRepository } from "@domain/user/UserProfileRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class DeleteUserUseCase {
  constructor(@inject(TYPES.UserProfileRepository) private userProfileRepository: UserProfileRepository) {}

  async execute(userId: string): Promise<Result<void>> {
    if (!userId) {
      return Result.error("User ID is required");
    }

    return await this.userProfileRepository.delete(userId);
  }
}
