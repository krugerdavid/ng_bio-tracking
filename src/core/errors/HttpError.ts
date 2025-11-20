import { DomainError } from "./DomainError";

export interface HttpErrorDetails {
  status: number;
  statusText: string;
  url: string;
  method: string;
  data?: unknown;
}

export class HttpError extends DomainError {
  readonly code = "HTTP_ERROR";
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly method: string;
  readonly data?: unknown;

  constructor(message: string, details: HttpErrorDetails, cause?: Error) {
    super(message, cause);
    this.status = details.status;
    this.statusText = details.statusText;
    this.url = details.url;
    this.method = details.method;
    this.data = details.data;
  }

  static fromSupabaseError(error: unknown): HttpError {
    // Type guard for Supabase-like error structure
    const supabaseError = error as {
      status?: number;
      statusText?: string;
      message?: string;
      code?: string;
      details?: string;
    };

    const status = supabaseError.status || 0;
    const statusText = supabaseError.statusText || "Unknown Error";
    const url = "supabase";
    const method = "UNKNOWN";
    const message = supabaseError.message || supabaseError.details || "Unknown error";

    return new HttpError(
      message,
      {
        status,
        statusText,
        url,
        method,
        data: supabaseError,
      },
      error instanceof Error ? error : undefined
    );
  }

  /**
   * Get technical details for debugging purposes
   */
  getTechnicalDetails(): string {
    return `${this.method} ${this.url} failed with status ${this.status} ${this.statusText}`;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      url: this.url,
      method: this.method,
      data: this.data,
      technicalDetails: this.getTechnicalDetails(),
    };
  }
}

// Convenience factory functions for common HTTP errors
export class BadRequestError extends HttpError {
  constructor(message: string, details: Omit<HttpErrorDetails, "status" | "statusText">) {
    super(message, { ...details, status: 400, statusText: "Bad Request" });
  }
}

export class UnauthorizedHttpError extends HttpError {
  constructor(message: string, details: Omit<HttpErrorDetails, "status" | "statusText">) {
    super(message, { ...details, status: 401, statusText: "Unauthorized" });
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, details: Omit<HttpErrorDetails, "status" | "statusText">) {
    super(message, { ...details, status: 403, statusText: "Forbidden" });
  }
}

export class NotFoundHttpError extends HttpError {
  constructor(message: string, details: Omit<HttpErrorDetails, "status" | "statusText">) {
    super(message, { ...details, status: 404, statusText: "Not Found" });
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string, details: Omit<HttpErrorDetails, "status" | "statusText">) {
    super(message, { ...details, status: 500, statusText: "Internal Server Error" });
  }
}
