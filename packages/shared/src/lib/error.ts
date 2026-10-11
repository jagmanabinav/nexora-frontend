/**
 * Error handling utilities for consistent error management
 */

export interface UserFriendlyError {
  title: string;
  message: string;
  code: string;
  details?: Record<string, string>;
  isRetryable: boolean;
}

interface ApiErrorLike extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, string>;
}

function isApiError(error: unknown): error is ApiErrorLike {
  return (
    error instanceof Error &&
    "statusCode" in error &&
    typeof error.statusCode === "number" &&
    "code" in error &&
    typeof error.code === "string"
  );
}

/**
 * Convert API errors to user-friendly messages
 */
export function parseApiError(error: unknown): UserFriendlyError {
  if (isApiError(error)) {
    if (
      error.statusCode === 404 &&
      error.message.toLowerCase() === "not found"
    ) {
      return {
        title: "Backend endpoint unavailable",
        message:
          "The connected backend does not provide this textile fabric washing API endpoint yet.",
        code: "API_ENDPOINT_UNAVAILABLE",
        isRetryable: false,
      };
    }

    return {
      title: getErrorTitle(error.code),
      message: error.message,
      code: error.code,
      details: error.details,
      isRetryable: isRetryableError(error),
    };
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      title: "Network Error",
      message:
        "Unable to connect to the server. Please check your internet connection.",
      code: "NETWORK_ERROR",
      isRetryable: true,
    };
  }

  if (error instanceof Error) {
    return {
      title: "Error",
      message: error.message,
      code: "UNKNOWN_ERROR",
      isRetryable: false,
    };
  }

  return {
    title: "Error",
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    isRetryable: false,
  };
}

/**
 * Get user-friendly error title
 */
function getErrorTitle(code: string): string {
  const titles: Record<string, string> = {
    VALIDATION_ERROR: "Validation Error",
    NOT_FOUND: "Not Found",
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Permission Denied",
    CONFLICT: "Conflict",
    INTERNAL_SERVER_ERROR: "Server Error",
    SERVICE_UNAVAILABLE: "Service Unavailable",
    NETWORK_ERROR: "Network Error",
    TIMEOUT: "Request Timeout",
  };

  return titles[code] || "Error";
}

/**
 * Determine if an error can be retried
 */
export function isRetryableError(error: ApiErrorLike): boolean {
  // Retry on server errors (5xx) and network errors
  if (error.statusCode >= 500) return true;

  // Don't retry on client errors (4xx)
  if (error.statusCode >= 400 && error.statusCode < 500) return false;

  // Retry on network errors
  return error.code === "NETWORK_ERROR" || error.code === "TIMEOUT";
}

/**
 * Log error to console (development) or external service (production)
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const parsedError = parseApiError(error);

  if (process.env.NODE_ENV === "development") {
    console.error(`[${parsedError.code}] ${parsedError.title}:`, {
      message: parsedError.message,
      details: parsedError.details,
      context,
      originalError: error,
    });
  } else {
    // TODO: Send to error tracking service (e.g., Sentry)
    console.error(
      `[${parsedError.code}] ${parsedError.title}`,
      parsedError.message,
    );
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(
  details?: Record<string, string>,
): Record<string, string> {
  if (!details) return {};

  const formatted: Record<string, string> = {};

  for (const [field, error] of Object.entries(details)) {
    formatted[field] = error;
  }

  return formatted;
}

/**
 * Determine if error is caused by missing required field
 */
export function isMissingFieldError(
  fieldName: string,
  error: UserFriendlyError,
): boolean {
  return (
    error.code === "VALIDATION_ERROR" &&
    Boolean(error.details?.[fieldName]?.toLowerCase().includes("required"))
  );
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(attemptNumber: number): number {
  const baseDelay = 1000; // 1 second
  return baseDelay * Math.pow(2, attemptNumber);
}
