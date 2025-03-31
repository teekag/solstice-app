/**
 * Error handling utilities for Solstice App
 * Provides consistent error handling throughout the app
 */
import { Alert } from 'react-native';
import { env, devLog } from './environment';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  SERVER = 'SERVER',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'INFO',       // User can continue, minor issue
  WARNING = 'WARNING', // User should be aware, but can continue
  ERROR = 'ERROR',     // User needs to take action
  CRITICAL = 'CRITICAL' // App cannot continue
}

interface ErrorOptions {
  type?: ErrorType;
  severity?: ErrorSeverity;
  showAlert?: boolean;
  context?: Record<string, any>;
}

/**
 * Handle errors consistently throughout the app
 * @param error Error object or message
 * @param options Error handling options
 */
export const handleError = (
  error: Error | string | unknown,
  options: ErrorOptions = {}
): void => {
  const {
    type = ErrorType.UNKNOWN,
    severity = ErrorSeverity.ERROR,
    showAlert = true,
    context = {}
  } = options;

  // Extract error message
  let errorMessage = 'An unknown error occurred';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as any).message);
  }

  // Log error details
  const errorDetails = {
    type,
    severity,
    message: errorMessage,
    context,
    timestamp: new Date().toISOString()
  };
  
  // Log to console in development
  if (env.NODE_ENV !== 'production') {
    devLog('ERROR:', errorDetails);
    console.error(error);
  }
  
  // In production, we would send to error tracking service
  // if (env.NODE_ENV === 'production' && env.ERROR_TRACKING_ENABLED === 'true') {
  //   // Send to error tracking service like Sentry
  //   // errorTrackingService.captureException(error, { extra: errorDetails });
  // }

  // Show alert to user if needed
  if (showAlert) {
    let title = 'Error';
    let message = errorMessage;
    
    // Customize message based on error type
    switch (type) {
      case ErrorType.NETWORK:
        title = 'Network Error';
        message = 'Please check your internet connection and try again.';
        break;
      case ErrorType.AUTHENTICATION:
        title = 'Authentication Error';
        message = 'Please sign in again to continue.';
        break;
      case ErrorType.SERVER:
        title = 'Server Error';
        message = 'Our servers are experiencing issues. Please try again later.';
        break;
      case ErrorType.VALIDATION:
        title = 'Invalid Input';
        // Use the original error message for validation errors
        break;
    }
    
    Alert.alert(title, message);
  }
};

/**
 * Try to execute a function and handle any errors
 * @param fn Function to execute
 * @param errorOptions Error handling options
 * @returns Result of the function or null if error
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorOptions: ErrorOptions = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, errorOptions);
    return null;
  }
}

/**
 * Format API errors into user-friendly messages
 * @param error Error from API
 * @returns User-friendly error message
 */
export const formatApiError = (error: any): string => {
  // Handle Supabase errors
  if (error?.code) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'The email address is invalid.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to continue.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
  
  // Handle network errors
  if (error?.message?.includes('network')) {
    return 'Network error. Please check your internet connection.';
  }
  
  // Default error message
  return error?.message || 'An error occurred. Please try again.';
};
