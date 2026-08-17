import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import { TYPES } from "@core/container/DIContainer";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { ApiError } from "@infrastructure/api/types";

export interface RegisterInput {
  name: string;
  email: string;
  trainingGroup?: string;
  password: string;
  passwordConfirmation: string;
}

@injectable()
export class RegisterUseCase {
  constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  async execute(input: RegisterInput): Promise<Result<string>> {
    if (!input.name.trim()) {
      return Result.error("Ingresá tu nombre.");
    }
    if (!input.email.trim()) {
      return Result.error("Ingresá tu email.");
    }
    if (!input.password || input.password.length < 8) {
      return Result.error("La contraseña debe tener al menos 8 caracteres.");
    }
    if (input.password !== input.passwordConfirmation) {
      return Result.error("Las contraseñas no coinciden.");
    }

    try {
      const res = await this.http.request("post", "/register", {
        data: {
          name: input.name.trim(),
          email: input.email.trim(),
          training_group: input.trainingGroup || null,
          password: input.password,
          password_confirmation: input.passwordConfirmation,
        },
      });
      return Result.success(res.message ?? "Tu registro fue enviado. El profe te va a avisar apenas lo apruebe.");
    } catch (err) {
      if (err instanceof ApiError) {
        const emailErr = err.errors?.email?.[0];
        const nameErr = err.errors?.name?.[0];
        const passErr = err.errors?.password?.[0];
        return Result.error(emailErr ?? nameErr ?? passErr ?? err.message);
      }
      return Result.error("No se pudo enviar el registro.");
    }
  }
}
