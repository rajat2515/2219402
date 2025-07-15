/**
 * Log levels supported by the logging middleware
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
/**
 * Stack types for categorizing logs
 */
export type LogStack = 'backend' | 'frontend';
/**
 * Package types for categorizing the source of logs
 */
export type LogPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service' | 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'auth' | 'config' | 'middleware' | 'utils';
/**
 * Configuration for the logging middleware
 */
export interface LoggerConfig {
    apiUrl: string;
    accessToken: string;
    defaultStack: LogStack;
    enableConsoleLog?: boolean;
    retryAttempts?: number;
    retryDelay?: number;
}
/**
 * Log entry structure matching the API specification
 */
export interface LogEntry {
    stack: LogStack;
    level: LogLevel;
    package: LogPackage;
    message: string;
}
/**
 * API response structure
 */
export interface LogResponse {
    logID: string;
    message: string;
}
/**
 * Logger instance interface
 */
export interface Logger {
    log(stack: LogStack, level: LogLevel, packageName: LogPackage, message: string): Promise<LogResponse | null>;
    debug(packageName: LogPackage, message: string): Promise<LogResponse | null>;
    info(packageName: LogPackage, message: string): Promise<LogResponse | null>;
    warn(packageName: LogPackage, message: string): Promise<LogResponse | null>;
    error(packageName: LogPackage, message: string): Promise<LogResponse | null>;
    fatal(packageName: LogPackage, message: string): Promise<LogResponse | null>;
}
//# sourceMappingURL=types.d.ts.map