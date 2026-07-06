/**
 * Standardized API response shape.
 * All successful controller responses should go through this helper
 * to ensure a consistent JSON envelope across the entire API.
 */
export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T;

  constructor(message: string, data: T) {
    this.success = true;
    this.message = message;
    this.data    = data;
  }
}

/**
 * Convenience factory — avoids `new ApiResponse(...)` at call sites.
 */
export function ok<T>(message: string, data: T): ApiResponse<T> {
  return new ApiResponse(message, data);
}
