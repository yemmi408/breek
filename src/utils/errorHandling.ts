/**
 * Utility functions for error handling and logging
 */

/**
 * Error codes for different types of application errors
 */
export enum ErrorCode {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS = 'auth/invalid-credentials',
  AUTH_USER_NOT_FOUND = 'auth/user-not-found',
  AUTH_WEAK_PASSWORD = 'auth/weak-password',
  AUTH_EMAIL_IN_USE = 'auth/email-already-in-use',
  AUTH_OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',
  
  // Data errors
  DATA_NOT_FOUND = 'data/not-found',
  DATA_ALREADY_EXISTS = 'data/already-exists',
  DATA_VALIDATION_FAILED = 'data/validation-failed',
  DATA_STORAGE_FAILED = 'data/storage-failed',
  
  // Permission errors
  PERMISSION_DENIED = 'permission/denied',
  
  // Network errors
  NETWORK_ERROR = 'network/error',
  
  // Operation errors
  OPERATION_INVALID = 'operation/invalid',
  
  // Unknown error
  UNKNOWN_ERROR = 'unknown/error'
}

/**
 * Application error class with error code
 */
export class AppError extends Error {
  code: ErrorCode;
  
  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}

/**
 * Format error message for user display
 * @param error The error object
 * @returns User-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log an error with additional context
 * @param error The error object
 * @param context Additional context about the error
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const errorObject = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    code: error instanceof AppError ? error.code : undefined,
    timestamp: new Date().toISOString(),
    context
  };
  
  // Log to console in development
  console.error('Application error:', errorObject);
  
  // In a real application, you would send this to a logging service
  // like Sentry, LogRocket, etc.
}

/**
 * Handle common errors and return appropriate user messages
 * @param error The error to handle
 * @returns User-friendly error message
 */
export function handleCommonErrors(error: unknown): string {
  if (error instanceof AppError) {
    switch (error.code) {
      case ErrorCode.AUTH_INVALID_CREDENTIALS:
        return 'Invalid username or password. Please try again.';
      case ErrorCode.AUTH_USER_NOT_FOUND:
        return 'User not found. Please check your credentials.';
      case ErrorCode.AUTH_WEAK_PASSWORD:
        return 'Password is too weak. Please use a stronger password.';
      case ErrorCode.AUTH_EMAIL_IN_USE:
        return 'This email is already in use. Please use a different email.';
      case ErrorCode.DATA_NOT_FOUND:
        return 'The requested data could not be found.';
      case ErrorCode.DATA_ALREADY_EXISTS:
        return 'This data already exists.';
      case ErrorCode.DATA_VALIDATION_FAILED:
        return error.message || 'The provided data is invalid.';
      case ErrorCode.PERMISSION_DENIED:
        return 'You do not have permission to perform this action.';
      case ErrorCode.NETWORK_ERROR:
        return 'Network error. Please check your internet connection.';
      case ErrorCode.OPERATION_INVALID:
        return error.message || 'This operation cannot be performed.';
      case ErrorCode.DATA_STORAGE_FAILED:
        return 'Failed to save data. Please try again.';
      default:
        return error.message;
    }
  }
  
  return formatErrorMessage(error);
}

/**
 * Safely execute a function and handle any errors
 * @param fn The function to execute
 * @param errorHandler Function to handle errors
 * @returns Result of the function or undefined if an error occurred
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      logError(error);
    }
    return undefined;
  }
}

/**
 * Type guard to check if an error is an AppError
 * @param error The error to check
 * @returns True if the error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an object is an Error
 * @param error The object to check
 * @returns True if the object is an Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
