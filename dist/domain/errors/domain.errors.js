"use strict";
/**
 * @file domain.errors.ts
 * @brief Доменные ошибки приложения.
 *
 * Содержит специфичные для бизнес-логики классы ошибок.
 *
 * @remarks
 * Эти ошибки выбрасываются при нарушении бизнес-правил и инвариантов.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidStateTransitionError = exports.InvariantViolationError = exports.BusinessRuleViolationError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = void 0;
const base_error_1 = require("./base.error");
/**
 * @class NotFoundError
 * @brief Ошибка "Ресурс не найден".
 */
class NotFoundError extends base_error_1.ApplicationError {
    constructor(resource, identifier) {
        super(`${resource} with identifier "${identifier}" not found`, 404, 'NOT_FOUND', { resource, identifier });
    }
}
exports.NotFoundError = NotFoundError;
/**
 * @class ValidationError
 * @brief Ошибка валидации данных.
 */
class ValidationError extends base_error_1.ApplicationError {
    constructor(message, field, value) {
        super(message, 400, 'VALIDATION_ERROR', { field, value });
    }
}
exports.ValidationError = ValidationError;
/**
 * @class UnauthorizedError
 * @brief Ошибка "Не авторизован".
 */
class UnauthorizedError extends base_error_1.ApplicationError {
    constructor(message = 'Unauthorized access') {
        super(message, 401, 'UNAUTHORIZED');
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * @class ForbiddenError
 * @brief Ошибка "Доступ запрещён".
 */
class ForbiddenError extends base_error_1.ApplicationError {
    constructor(message = 'Access forbidden', action, resource) {
        super(message, 403, 'FORBIDDEN', { action, resource });
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * @class ConflictError
 * @brief Ошибка конфликта (например, дубликат).
 */
class ConflictError extends base_error_1.ApplicationError {
    constructor(message, conflictingField) {
        super(message, 409, 'CONFLICT', { conflictingField });
    }
}
exports.ConflictError = ConflictError;
/**
 * @class BusinessRuleViolationError
 * @brief Ошибка нарушения бизнес-правила.
 */
class BusinessRuleViolationError extends base_error_1.ApplicationError {
    constructor(message, rule) {
        super(message, 422, 'BUSINESS_RULE_VIOLATION', { rule });
    }
}
exports.BusinessRuleViolationError = BusinessRuleViolationError;
/**
 * @class InvariantViolationError
 * @brief Ошибка нарушения инварианта доменной модели.
 */
class InvariantViolationError extends base_error_1.ApplicationError {
    constructor(message, entity) {
        super(message, 422, 'INVARIANT_VIOLATION', { entity });
    }
}
exports.InvariantViolationError = InvariantViolationError;
/**
 * @class InvalidStateTransitionError
 * @brief Ошибка недопустимого перехода состояния.
 */
class InvalidStateTransitionError extends base_error_1.ApplicationError {
    constructor(currentState, targetState, entity) {
        super(`Invalid state transition from "${currentState}" to "${targetState}"${entity ? ` for ${entity}` : ''}`, 422, 'INVALID_STATE_TRANSITION', { currentState, targetState, entity });
    }
}
exports.InvalidStateTransitionError = InvalidStateTransitionError;
//# sourceMappingURL=domain.errors.js.map