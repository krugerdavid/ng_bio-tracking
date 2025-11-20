import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { AuthRepository } from "@domain/auth/AuthRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class LogoutUseCase {
  constructor(@inject(TYPES.AuthRepository) private authRepository: AuthRepository) {}

  async execute(): Promise<Result<void>> {
    return await this.authRepository.logout();
  }
}
