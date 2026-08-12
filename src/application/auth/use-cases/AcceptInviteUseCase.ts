import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import { TYPES } from "@core/container/DIContainer";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { ApiError } from "@infrastructure/api/types";

@injectable()
export class AcceptInviteUseCase {
  constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  async execute(token: string, password: string, passwordConfirmation: string): Promise<Result<string>> {
    if (!token) {
      return Result.error("El enlace de invitación no es válido.");
    }
    if (!password || password.length < 8) {
      return Result.error("La contraseña debe tener al menos 8 caracteres.");
    }
    if (password !== passwordConfirmation) {
      return Result.error("Las contraseñas no coinciden.");
    }

    try {
      const res = await this.http.request("post", "/invite/accept", {
        data: {
          token,
          password,
          password_confirmation: passwordConfirmation,
        },
      });
      return Result.success(res.message ?? "Acceso activado. Ya podés iniciar sesión.");
    } catch (err) {
      if (err instanceof ApiError) {
        const tokenErr = err.errors?.token?.[0];
        const passErr = err.errors?.password?.[0];
        return Result.error(tokenErr ?? passErr ?? err.message);
      }
      return Result.error("No se pudo activar el acceso.");
    }
  }
}
