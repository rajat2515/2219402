// Export main types
export type { 
  LogLevel, 
  LogStack, 
  LogPackage, 
  LoggerConfig, 
  LogEntry, 
  LogResponse, 
  Logger 
} from './types';

// Export main class
export { LoggingMiddleware } from './logger';

// Export convenience functions for creating logger instances
export { createLogger, createFrontendLogger, createBackendLogger } from './factory';

// Default export for easy importing
export { LoggingMiddleware as default } from './logger'; 