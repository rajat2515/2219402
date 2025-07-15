"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingMiddleware = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Core logging middleware implementation
 */
class LoggingMiddleware {
    constructor(config) {
        this.config = {
            enableConsoleLog: true,
            retryAttempts: 3,
            retryDelay: 1000,
            ...config
        };
        this.apiClient = axios_1.default.create({
            baseURL: this.config.apiUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.accessToken}`
            },
            timeout: 10000
        });
    }
    /**
     * Core logging function that sends logs to the test server
     */
    async log(stack, level, packageName, message) {
        const logEntry = {
            stack,
            level,
            package: packageName,
            message
        };
        // Console logging for development
        if (this.config.enableConsoleLog) {
            this.logToConsole(logEntry);
        }
        // Send to API with retry logic
        return await this.sendLogToAPI(logEntry);
    }
    /**
     * Debug level logging
     */
    async debug(packageName, message) {
        return this.log(this.config.defaultStack, 'debug', packageName, message);
    }
    /**
     * Info level logging
     */
    async info(packageName, message) {
        return this.log(this.config.defaultStack, 'info', packageName, message);
    }
    /**
     * Warning level logging
     */
    async warn(packageName, message) {
        return this.log(this.config.defaultStack, 'warn', packageName, message);
    }
    /**
     * Error level logging
     */
    async error(packageName, message) {
        return this.log(this.config.defaultStack, 'error', packageName, message);
    }
    /**
     * Fatal level logging
     */
    async fatal(packageName, message) {
        return this.log(this.config.defaultStack, 'fatal', packageName, message);
    }
    /**
     * Send log entry to the API with retry logic
     */
    async sendLogToAPI(logEntry) {
        let lastError = null;
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                const response = await this.apiClient.post('/logs', logEntry);
                if (response.status === 200 && response.data) {
                    return response.data;
                }
            }
            catch (error) {
                lastError = error;
                if (this.config.enableConsoleLog) {
                    console.warn(`Log API attempt ${attempt}/${this.config.retryAttempts} failed:`, error);
                }
                // Don't retry on certain error types
                if (axios_1.default.isAxiosError(error)) {
                    const axiosError = error;
                    if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
                        if (this.config.enableConsoleLog) {
                            console.error('Authentication failed for logging API. Check your access token.');
                        }
                        break;
                    }
                }
                // Wait before retry (except on last attempt)
                if (attempt < this.config.retryAttempts) {
                    await this.delay(this.config.retryDelay * attempt);
                }
            }
        }
        // Log the failure locally if all retries failed
        if (this.config.enableConsoleLog) {
            console.error('Failed to send log to API after all retries:', lastError?.message);
            console.error('Original log entry:', logEntry);
        }
        return null;
    }
    /**
     * Log to console with proper formatting
     */
    logToConsole(logEntry) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${logEntry.stack.toUpperCase()}] [${logEntry.level.toUpperCase()}] [${logEntry.package}] ${logEntry.message}`;
        switch (logEntry.level) {
            case 'debug':
                console.debug(logMessage);
                break;
            case 'info':
                console.info(logMessage);
                break;
            case 'warn':
                console.warn(logMessage);
                break;
            case 'error':
            case 'fatal':
                console.error(logMessage);
                break;
            default:
                console.log(logMessage);
        }
    }
    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Update access token if needed
     */
    updateAccessToken(newToken) {
        this.config.accessToken = newToken;
        this.apiClient.defaults.headers['Authorization'] = `Bearer ${newToken}`;
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.LoggingMiddleware = LoggingMiddleware;