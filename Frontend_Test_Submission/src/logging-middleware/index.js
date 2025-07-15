"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.createBackendLogger = exports.createFrontendLogger = exports.createLogger = exports.LoggingMiddleware = void 0;
// Export main class
var logger_1 = require("./logger");
Object.defineProperty(exports, "LoggingMiddleware", { enumerable: true, get: function () { return logger_1.LoggingMiddleware; } });
// Export convenience functions for creating logger instances
var factory_1 = require("./factory");
Object.defineProperty(exports, "createLogger", { enumerable: true, get: function () { return factory_1.createLogger; } });
Object.defineProperty(exports, "createFrontendLogger", { enumerable: true, get: function () { return factory_1.createFrontendLogger; } });
Object.defineProperty(exports, "createBackendLogger", { enumerable: true, get: function () { return factory_1.createBackendLogger; } });
// Default export for easy importing
var logger_2 = require("./logger");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return logger_2.LoggingMiddleware; } });