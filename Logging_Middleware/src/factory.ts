import { LoggingMiddleware } from './logger';
import { LoggerConfig, Logger } from './types';

/**
 * Factory function to create a logger instance with default configuration
 */
export function createLogger(config: LoggerConfig): Logger {
  return new LoggingMiddleware(config);
}

/**
 * Create a logger for frontend applications
 */
export function createFrontendLogger(apiUrl: string, accessToken: string): Logger {
  return new LoggingMiddleware({
    apiUrl,
    accessToken,
    defaultStack: 'frontend',
    enableConsoleLog: true,
    retryAttempts: 3,
    retryDelay: 1000
  });
}

/**
 * Create a logger for backend applications
 */
export function createBackendLogger(apiUrl: string, accessToken: string): Logger {
  return new LoggingMiddleware({
    apiUrl,
    accessToken,
    defaultStack: 'backend',
    enableConsoleLog: false, // Usually disabled in production backend
    retryAttempts: 5,
    retryDelay: 2000
  });
} 