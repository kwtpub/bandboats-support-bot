"use strict";
/**
 * @file index.ts
 * @brief Экспорт всех классов ошибок.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = exports.TelegramApiError = exports.ExternalServiceError = exports.DatabaseError = exports.InvalidStateTransitionError = exports.InvariantViolationError = exports.BusinessRuleViolationError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.ApplicationError = void 0;
// Базовый класс
var base_error_1 = require("./base.error");
Object.defineProperty(exports, "ApplicationError", { enumerable: true, get: function () { return base_error_1.ApplicationError; } });
// Доменные ошибки
var domain_errors_1 = require("./domain.errors");
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return domain_errors_1.NotFoundError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return domain_errors_1.ValidationError; } });
Object.defineProperty(exports, "UnauthorizedError", { enumerable: true, get: function () { return domain_errors_1.UnauthorizedError; } });
Object.defineProperty(exports, "ForbiddenError", { enumerable: true, get: function () { return domain_errors_1.ForbiddenError; } });
Object.defineProperty(exports, "ConflictError", { enumerable: true, get: function () { return domain_errors_1.ConflictError; } });
Object.defineProperty(exports, "BusinessRuleViolationError", { enumerable: true, get: function () { return domain_errors_1.BusinessRuleViolationError; } });
Object.defineProperty(exports, "InvariantViolationError", { enumerable: true, get: function () { return domain_errors_1.InvariantViolationError; } });
Object.defineProperty(exports, "InvalidStateTransitionError", { enumerable: true, get: function () { return domain_errors_1.InvalidStateTransitionError; } });
// Инфраструктурные ошибки
var infrastructure_errors_1 = require("./infrastructure.errors");
Object.defineProperty(exports, "DatabaseError", { enumerable: true, get: function () { return infrastructure_errors_1.DatabaseError; } });
Object.defineProperty(exports, "ExternalServiceError", { enumerable: true, get: function () { return infrastructure_errors_1.ExternalServiceError; } });
Object.defineProperty(exports, "TelegramApiError", { enumerable: true, get: function () { return infrastructure_errors_1.TelegramApiError; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return infrastructure_errors_1.ConfigurationError; } });
//# sourceMappingURL=index.js.map