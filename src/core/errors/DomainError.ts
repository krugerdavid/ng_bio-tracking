export abstract class DomainError extends Error {
  abstract readonly code: string;
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
  }
}

export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = "UNAUTHORIZED";

  constructor(message = "Unauthorized access") {
    super(message);
  }
}
