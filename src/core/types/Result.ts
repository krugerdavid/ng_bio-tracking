/**
 * A Result is a wrapper around a value or an error.
 *
 * It is a monad that can be used to chain operations.
 *
 * Example usage:
 * const result = Result.success(value);
 * const result = Result.error(error);
 * const result = Result.success(value).map(fn);
 * const result = Result.success(value).flatMap(fn);
 * const result = Result.success(value).map(fn).flatMap(fn).isSuccess();
 */

export class Result<T> {
  private readonly value?: T;
  private readonly error?: string;

  private constructor(value?: T, error?: string) {
    this.value = value;
    this.error = error;
  }

  /**
   * Create a successful Result<T>
   *
   * @param value - The value to store in the Result
   * @returns A Result<T>
   */
  static success<T>(value: T): Result<T> {
    return new Result<T>(value, undefined);
  }

  /**
   * Create an error Result<T>
   *
   * @param error - The error message to store in the Result
   * @returns A Result<T>
   */
  static error<T>(error: string): Result<T> {
    return new Result<T>(undefined, error);
  }

  /**
   * Check if the Result is successful
   *
   * @returns True if the Result is successful, false otherwise
   */
  isSuccess(): boolean {
    return this.error === undefined;
  }

  /**
   * Check if the Result is an error
   *
   * @returns True if the Result is an error, false otherwise
   */
  isError(): boolean {
    return this.error !== undefined;
  }

  getValue(): T {
    if (this.isError()) throw new Error(this.error);
    return this.value!;
  }

  getError(): string {
    return this.error!;
  }

  /**
   * Map a Result<T> to a Result<U>
   *
   * @param fn - The function to apply to the value if the result is successful
   * @returns A Result<U>
   */
  map<U>(fn: (value: T) => U): Result<U> {
    if (this.isError()) {
      return Result.error<U>(this.error!);
    }
    try {
      return Result.success(fn(this.value!));
    } catch (error) {
      return Result.error<U>(error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Flatten a Result<Result<T>> to a Result<T>
   *
   * @param fn - The function to apply to the value if the result is successful
   * @returns A Result<U>
   */
  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this.isError()) {
      return Result.error<U>(this.error!);
    }
    return fn(this.value!);
  }
}
