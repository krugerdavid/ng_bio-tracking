import { injectable, inject } from "inversify";
import type { AxiosError } from "axios";
import { TYPES } from "@core/container/DIContainer";
import type { ApiClient } from "./ApiClient";
import type { LaravelApiResponse } from "./types";
import { ApiError } from "./types";

/**
 * HTTP client that unwraps Laravel ApiResponse ({ status, message, data }).
 * On success returns `data`; on error throws ApiError with message and statusCode.
 * Used by repository implementations (DDD infrastructure).
 */
@injectable()
export class HttpClient {
  constructor(@inject(TYPES.ApiClient) private readonly apiClient: ApiClient) {}

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await this.request<T>("get", url, { params });
    return res.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const res = await this.request<T>("post", url, { data });
    return res.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const res = await this.request<T>("put", url, { data });
    return res.data;
  }

  async delete<T>(url: string): Promise<T> {
    const res = await this.request<T>("delete", url);
    return res.data;
  }

  /**
   * Execute request and return unwrapped data (+ Laravel message). Catches AxiosError and throws ApiError.
   */
  async request<T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    options?: { params?: Record<string, unknown>; data?: unknown }
  ): Promise<{ data: T; status: number; message?: string }> {
    try {
      let raw: LaravelApiResponse<T>;
      if (method === "get") {
        raw = await this.apiClient.get<LaravelApiResponse<T>>(url, options?.params);
      } else if (method === "post") {
        raw = await this.apiClient.post<LaravelApiResponse<T>>(url, options?.data);
      } else if (method === "put") {
        raw = await this.apiClient.put<LaravelApiResponse<T>>(url, options?.data);
      } else {
        raw = await this.apiClient.delete<LaravelApiResponse<T>>(url);
      }
      if (raw.status === "error") {
        throw new ApiError(raw.message, 400, raw.errors);
      }
      return { data: raw.data as T, status: 200, message: raw.message };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw this.toApiError(err);
    }
  }

  private toApiError(err: unknown): ApiError {
    const axiosError = err as AxiosError<LaravelApiResponse>;
    if (axiosError.response?.data && typeof axiosError.response.data === "object") {
      const body = axiosError.response.data as LaravelApiResponse;
      if (body.status === "error") {
        return new ApiError(body.message, axiosError.response.status ?? 500, body.errors);
      }
      // Laravel validation (422) without status:error wrapper
      if (axiosError.response.status === 422 && "errors" in body) {
        const errors = (body as { errors?: Record<string, string[]>; message?: string }).errors;
        const message =
          (body as { message?: string }).message ??
          (errors ? Object.values(errors).flat()[0] : undefined) ??
          "Validación fallida";
        return new ApiError(message, 422, errors);
      }
    }
    return new ApiError(
      err instanceof Error ? err.message : "Request failed",
      (err as AxiosError).response?.status ?? 500
    );
  }
}
