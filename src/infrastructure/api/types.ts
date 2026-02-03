/**
 * Laravel API response shape (ApiResponse::success / ApiResponse::error).
 * Axios gives us response.data; we unwrap to get `data` or throw on `error`.
 */
export interface LaravelSuccessResponse<T = unknown> {
  status: "success";
  message: string;
  data: T;
}

export interface LaravelErrorResponse {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;
}

export type LaravelApiResponse<T = unknown> = LaravelSuccessResponse<T> | LaravelErrorResponse;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}
