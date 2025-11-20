import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { User } from "@domain/user/entities/User";
import type { AuthRepository } from "@domain/auth/AuthRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class GetCurrentUserUseCase {
  constructor(@inject(TYPES.AuthRepository) private authRepository: AuthRepository) {}

  async execute(): Promise<Result<User | null>> {
    return await this.authRepository.getCurrentUser();
  }
}
