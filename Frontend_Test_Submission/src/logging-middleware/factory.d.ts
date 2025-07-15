import { LoggerConfig, Logger } from './types';
/**
 * Factory function to create a logger instance with default configuration
 */
export declare function createLogger(config: LoggerConfig): Logger;
/**
 * Create a logger for frontend applications
 */
export declare function createFrontendLogger(apiUrl: string, accessToken: string): Logger;
/**
 * Create a logger for backend applications
 */
export declare function createBackendLogger(apiUrl: string, accessToken: string): Logger;
//# sourceMappingURL=factory.d.ts.map