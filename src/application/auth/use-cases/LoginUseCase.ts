import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { User } from "@domain/user/entities/User";
import type { AuthRepository } from "@domain/auth/AuthRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class LoginUseCase {
  constructor(@inject(TYPES.AuthRepository) private authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<Result<User>> {
    // Basic validation
    if (!email || !password) {
      return Result.error("Email and password are required");
    }

    if (!email.includes("@")) {
      return Result.error("Invalid email format");
    }

    return await this.authRepository.login(email, password);
  }
}
