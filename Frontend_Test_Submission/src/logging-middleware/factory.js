"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = createLogger;
exports.createFrontendLogger = createFrontendLogger;
exports.createBackendLogger = createBackendLogger;
const logger_1 = require("./logger");
/**
 * Factory function to create a logger instance with default configuration
 */
function createLogger(config) {
    return new logger_1.LoggingMiddleware(config);
}
/**
 * Create a logger for frontend applications
 */
function createFrontendLogger(apiUrl, accessToken) {
    return new logger_1.LoggingMiddleware({
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
function createBackendLogger(apiUrl, accessToken) {
    return new logger_1.LoggingMiddleware({
        apiUrl,
        accessToken,
        defaultStack: 'backend',
        enableConsoleLog: false, // Usually disabled in production backend
        retryAttempts: 5,
        retryDelay: 2000
    });
}