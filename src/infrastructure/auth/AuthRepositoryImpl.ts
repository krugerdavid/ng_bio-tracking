import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { User } from "@domain/user/entities/User";
import type { AuthRepository } from "@domain/auth/AuthRepository";
import type { Role } from "@domain/shared/value-objects/Role";
import type { ApiClient } from "@infrastructure/api/ApiClient";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { ApiError } from "@infrastructure/api/types";

interface LoginResponse {
  user: UserApi;
  access_token: string;
  token_type: string;
}

interface UserApi {
  id: number | string;
  name?: string;
  email: string;
  role: string;
  created_at: string;
  member_id?: string | null;
}

function mapUserApiToUser(api: UserApi): User {
  const role = api.role === "member" ? "user" : (api.role as Role);
  return {
    id: String(api.id),
    email: api.email,
    role: role ?? "user",
    createdAt: new Date(api.created_at),
    memberId: api.member_id ?? undefined,
    name: api.name,
  };
}

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    @inject(TYPES.HttpClient) private readonly http: HttpClient,
    @inject(TYPES.ApiClient) private readonly apiClient: ApiClient
  ) {}

  async login(email: string, password: string): Promise<Result<User>> {
    try {
      const data = await this.http.post<LoginResponse>("/login", { email, password });
      this.apiClient.setToken(data.access_token);
      return Result.success(mapUserApiToUser(data.user));
    } catch (err) {
      if (err instanceof ApiError) {
        const emailErr = err.errors?.email?.[0];
        return Result.error(emailErr ?? err.message);
      }
      return Result.error("Login failed");
    }
  }

  async logout(): Promise<Result<void>> {
    try {
      await this.http.post("/logout");
    } catch {
      // Clear session even if server request fails (e.g. network)
    }
    this.apiClient.clearToken();
    return Result.success(undefined);
  }

  async getCurrentUser(): Promise<Result<User | null>> {
    const token = this.apiClient.getToken();
    if (!token) {
      return Result.success(null);
    }
    try {
      const user = await this.http.get<UserApi>("/me");
      return Result.success(mapUserApiToUser(user));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 401) {
        return Result.success(null);
      }
      return Result.error(err instanceof ApiError ? err.message : "Failed to get user");
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const unsubscribe = this.apiClient.addAuthStateListener(async () => {
      const result = await this.getCurrentUser();
      callback(result.isSuccess() ? result.getValue() : null);
    });
    // Initial state
    this.getCurrentUser().then(result => {
      callback(result.isSuccess() ? (result.getValue() ?? null) : null);
    });
    return unsubscribe;
  }
}
