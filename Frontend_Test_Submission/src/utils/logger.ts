// Import the compiled logging middleware
const loggingMiddleware = require('../logging-middleware/index');
const { createFrontendLogger } = loggingMiddleware;

// Type definition for Logger
interface Logger {
  log: (level: string, message: string, packageName: string, data?: any) => Promise<void>;
  info: (message: string, packageName: string, data?: any) => Promise<void>;
  warn: (message: string, packageName: string, data?: any) => Promise<void>;
  error: (message: string, packageName: string, data?: any) => Promise<void>;
  debug: (message: string, packageName: string, data?: any) => Promise<void>;
}

// Logger configuration
const LOGGING_CONFIG = {
  apiUrl: 'http://20.244.56.144/evaluation-service',
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGJpbXJPbXMweDRhU1pYWkcwbEliSzd0eFpKcTVqUzJkdHJIb2dpc2pKL3BQVnVQdk5GRnJTRXFnRGoyNG5iNjNhK3JueWJHRFpiNXVySFJNQUxxYUg1K1lROVZTdmJxZVRxaUpIVlhlemlMMWRqUGFOZjNOcG8xSndMcjBNNDBHSzVnMEJsd3VzY2QzQVJQS3VGTjJ5SGJ5ZlZYODdGRXdxK21yYlFtS0hxanltaXhNZ1UxT0ZLMGJkSUVyS3FYQ2hGNERmTEdLN3djNkkxTUpTcFl1UVVMdERwY0JNNGtQMlBsbTM1OGNBNXZBanpOSUdrbE1nOFZnd3lPbUJGOElJSUV4WkRzQlFBUWlXR0JTQWtoK2lPWTM2c2g4YUEzVjh6NzQ1WDZJL0psUW8zOHQzRnlkVHR4UWhtY3NodEozZUVyZlgweUEwTDVNTTJhOGY0IiwiaWF0IjoxNzQzNTc0MzQ0LCJleHAiOjE3NDM1OTQzNDR9.YApD98gq0IN_oWw7JMfmuUfK1m4hLTm7AIcLDcLAzVg'
};

// Create the logger instance
let logger: Logger | null = null;

// Fallback logger for when middleware fails
const fallbackLogger: Logger = {
  log: async (level: string, message: string, packageName: string, data?: any) => { 
    console.log(`[${level.toUpperCase()}] [${packageName}] ${message}`, data || ''); 
  },
  info: async (message: string, packageName: string, data?: any) => { 
    console.info(`[INFO] [${packageName}] ${message}`, data || ''); 
  },
  warn: async (message: string, packageName: string, data?: any) => { 
    console.warn(`[WARN] [${packageName}] ${message}`, data || ''); 
  },
  error: async (message: string, packageName: string, data?: any) => { 
    console.error(`[ERROR] [${packageName}] ${message}`, data || ''); 
  },
  debug: async (message: string, packageName: string, data?: any) => { 
    console.debug(`[DEBUG] [${packageName}] ${message}`, data || ''); 
  }
};

export const initializeLogger = (): Logger => {
  if (!logger) {
    try {
      logger = createFrontendLogger(
        LOGGING_CONFIG.apiUrl,
        LOGGING_CONFIG.accessToken
      );
    } catch (error) {
      console.warn('Failed to initialize logging middleware, using fallback logger:', error);
      logger = fallbackLogger;
    }
  }
  return logger!; // Non-null assertion since we initialize logger above
};

export const getLogger = (): Logger => {
  if (!logger) {
    return initializeLogger();
  }
  return logger;
};

// Convenience logging functions with proper package categorization
export const logPageLoad = (pageName: string, loadTime?: number) => {
  const message = loadTime 
    ? `${pageName} page loaded in ${loadTime}ms`
    : `${pageName} page loaded`;
  getLogger().info(message, 'page');
};

export const logUserAction = (action: string, details?: any) => {
  const message = details 
    ? `User action: ${action} - ${JSON.stringify(details)}`
    : `User action: ${action}`;
  getLogger().info(message, 'component', details);
};

export const logApiCall = (endpoint: string, method: string, status?: number) => {
  const message = status 
    ? `API ${method} ${endpoint} - Status: ${status}`
    : `API ${method} ${endpoint} initiated`;
  getLogger().info(message, 'api', { endpoint, method, status });
};

export const logError = (error: Error, context: string) => {
  const message = `Error in ${context}: ${error.message}`;
  getLogger().error(message, 'component', { error: error.stack, context });
};

export const logFormValidation = (formName: string, isValid: boolean, errors?: string[]) => {
  const message = isValid 
    ? `${formName} form validation passed`
    : `${formName} form validation failed: ${errors?.join(', ') || 'Unknown errors'}`;
  getLogger().warn(message, 'component', { formName, isValid, errors });
};

export const logUrlShortening = (originalUrl: string, shortCode: string) => {
  const message = `URL shortened successfully: ${originalUrl} -> ${shortCode}`;
  getLogger().info(message, 'api', { originalUrl, shortCode });
};

export const logUrlClick = (shortCode: string, originalUrl: string) => {
  const message = `Short URL clicked: ${shortCode} -> ${originalUrl}`;
  getLogger().info(message, 'component', { shortCode, originalUrl });
};

export const logStateChange = (component: string, state: any) => {
  const message = `State change in ${component}: ${JSON.stringify(state)}`;
  getLogger().debug('state', message);
};

export const logPerformance = (metric: string, value: number, unit: string = 'ms') => {
  const message = `Performance metric: ${metric} = ${value}${unit}`;
  getLogger().info('component', message);
};

export const logAuthAction = (action: string, success: boolean) => {
  const message = success 
    ? `Authentication action successful: ${action}`
    : `Authentication action failed: ${action}`;
  getLogger().info('auth', message);
};

export const logStorageOperation = (operation: string, key: string, success: boolean) => {
  const message = success
    ? `Storage ${operation} successful for key: ${key}`
    : `Storage ${operation} failed for key: ${key}`;
  getLogger().debug('utils', message);
};

export const logConfigLoad = (configName: string, success: boolean) => {
  const message = success
    ? `Configuration loaded successfully: ${configName}`
    : `Failed to load configuration: ${configName}`;
  getLogger().info(message, 'config', { configName, success });
};

// Export the logger instance for direct use when needed
export { logger }; 