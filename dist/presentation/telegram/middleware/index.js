"use strict";
/**
 * @file index.ts
 * @brief Экспорт всех middleware.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminMiddleware = exports.clearSession = exports.getSession = exports.createSessionMiddleware = exports.createErrorMiddleware = exports.createLoggingMiddleware = exports.requireAdmin = exports.requireAuth = exports.createAuthMiddleware = void 0;
var auth_middleware_1 = require("./auth.middleware");
Object.defineProperty(exports, "createAuthMiddleware", { enumerable: true, get: function () { return auth_middleware_1.createAuthMiddleware; } });
Object.defineProperty(exports, "requireAuth", { enumerable: true, get: function () { return auth_middleware_1.requireAuth; } });
Object.defineProperty(exports, "requireAdmin", { enumerable: true, get: function () { return auth_middleware_1.requireAdmin; } });
var logging_middleware_1 = require("./logging.middleware");
Object.defineProperty(exports, "createLoggingMiddleware", { enumerable: true, get: function () { return logging_middleware_1.createLoggingMiddleware; } });
var error_middleware_1 = require("./error.middleware");
Object.defineProperty(exports, "createErrorMiddleware", { enumerable: true, get: function () { return error_middleware_1.createErrorMiddleware; } });
var session_middleware_1 = require("./session.middleware");
Object.defineProperty(exports, "createSessionMiddleware", { enumerable: true, get: function () { return session_middleware_1.createSessionMiddleware; } });
Object.defineProperty(exports, "getSession", { enumerable: true, get: function () { return session_middleware_1.getSession; } });
Object.defineProperty(exports, "clearSession", { enumerable: true, get: function () { return session_middleware_1.clearSession; } });
var admin_middleware_1 = require("./admin.middleware");
Object.defineProperty(exports, "createAdminMiddleware", { enumerable: true, get: function () { return admin_middleware_1.createAdminMiddleware; } });
//# sourceMappingURL=index.js.map