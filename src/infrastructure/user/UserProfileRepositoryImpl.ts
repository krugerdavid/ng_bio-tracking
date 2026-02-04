import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import { TYPES } from "@core/container/DIContainer";
import type { UserProfile, CreateUserProfileDTO, UpdateUserProfileDTO } from "@domain/user/entities/UserProfile";
import type { UserProfileRepository } from "@domain/user/UserProfileRepository";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { unwrapLaravelPaginated } from "@infrastructure/api/laravelPaginated";
import type { Role } from "@domain/shared/value-objects/Role";
import { ApiError } from "@infrastructure/api/types";

/** Respuesta de la API Laravel para un perfil de usuario (puede ser paginada: { data: [] } o array) */
interface UserProfileApi {
  id: number | string;
  user_id?: string;
  name?: string;
  email: string;
  role: string;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

function mapApiToUserProfile(api: UserProfileApi): UserProfile {
  const role = api.role === "member" ? "user" : api.role;
  const id = String(api.id);
  return {
    id,
    userId: api.user_id ?? id,
    name: api.name ?? "",
    email: api.email,
    role: role as Role,
    createdBy: api.created_by ?? null,
    createdAt: new Date(api.created_at),
    updatedAt: new Date(api.updated_at ?? api.created_at),
  };
}

/**
 * Implementación que usa la API Laravel para gestión de usuarios.
 * Endpoints esperados: GET /users, POST /users, PUT /users/:id, DELETE /users/:id
 */
@injectable()
export class UserProfileRepositoryImpl implements UserProfileRepository {
  constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  async create(data: CreateUserProfileDTO): Promise<Result<UserProfile>> {
    try {
      const payload = await this.http.post<UserProfileApi>("/users", {
        name: data.name ?? undefined,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      return Result.success(mapApiToUserProfile(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error al crear el usuario");
    }
  }

  async findAll(): Promise<Result<UserProfile[]>> {
    try {
      const payload = await this.http.get<UserProfileApi[] | { data: UserProfileApi[] }>("/users");
      const { items } = unwrapLaravelPaginated(payload);
      return Result.success(items.map(mapApiToUserProfile));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        return Result.success([]);
      }
      return Result.error(err instanceof ApiError ? err.message : "Error al listar usuarios");
    }
  }

  async findByUserId(userId: string): Promise<Result<UserProfile | null>> {
    try {
      const payload = await this.http.get<UserProfileApi>(`/users/${userId}`);
      return Result.success(mapApiToUserProfile(payload));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return Result.success(null);
      }
      return Result.error(err instanceof ApiError ? err.message : "Error al obtener usuario");
    }
  }

  async update(userId: string, data: UpdateUserProfileDTO): Promise<Result<UserProfile>> {
    try {
      const body: Record<string, unknown> = {};
      if (data.name !== undefined) body.name = data.name;
      if (data.role !== undefined) body.role = data.role;
      if (data.password !== undefined && data.password !== "") body.password = data.password;
      const payload = await this.http.put<UserProfileApi>(`/users/${userId}`, body);
      return Result.success(mapApiToUserProfile(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error al actualizar usuario");
    }
  }

  async delete(userId: string): Promise<Result<void>> {
    try {
      await this.http.delete<void>(`/users/${userId}`);
      return Result.success(undefined);
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error al eliminar usuario");
    }
  }
}
