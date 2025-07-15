import { Logger, LoggerConfig, LogLevel, LogStack, LogPackage, LogResponse } from './types';
/**
 * Core logging middleware implementation
 */
export declare class LoggingMiddleware implements Logger {
    private apiClient;
    private config;
    constructor(config: LoggerConfig);
    /**
     * Core logging function that sends logs to the test server
     */
    log(stack: LogStack, level: LogLevel, packageName: LogPackage, message: string): Promise<LogResponse | null>;
    /**
     * Debug level logging
     */
    debug(packageName: LogPackage, message: string): Promise<LogResponse | null>;
    /**
     * Info level logging
     */
    info(packageName: LogPackage, message: string): Promise<LogResponse | null>;
    /**
     * Warning level logging
     */
    warn(packageName: LogPackage, message: string): Promise<LogResponse | null>;
    /**
     * Error level logging
     */
    error(packageName: LogPackage, message: string): Promise<LogResponse | null>;
    /**
     * Fatal level logging
     */
    fatal(packageName: LogPackage, message: string): Promise<LogResponse | null>;
    /**
     * Send log entry to the API with retry logic
     */
    private sendLogToAPI;
    /**
     * Log to console with proper formatting
     */
    private logToConsole;
    /**
     * Utility function for delays
     */
    private delay;
    /**
     * Update access token if needed
     */
    updateAccessToken(newToken: string): void;
    /**
     * Get current configuration
     */
    getConfig(): LoggerConfig;
}
//# sourceMappingURL=logger.d.ts.map