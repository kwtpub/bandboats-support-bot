/**
 * @file domain.errors.ts
 * @brief Доменные ошибки приложения.
 *
 * Содержит специфичные для бизнес-логики классы ошибок.
 *
 * @remarks
 * Эти ошибки выбрасываются при нарушении бизнес-правил и инвариантов.
 */
import { ApplicationError } from './base.error';
/**
 * @class NotFoundError
 * @brief Ошибка "Ресурс не найден".
 */
export declare class NotFoundError extends ApplicationError {
    constructor(resource: string, identifier: string | number);
}
/**
 * @class ValidationError
 * @brief Ошибка валидации данных.
 */
export declare class ValidationError extends ApplicationError {
    constructor(message: string, field?: string, value?: unknown);
}
/**
 * @class UnauthorizedError
 * @brief Ошибка "Не авторизован".
 */
export declare class UnauthorizedError extends ApplicationError {
    constructor(message?: string);
}
/**
 * @class ForbiddenError
 * @brief Ошибка "Доступ запрещён".
 */
export declare class ForbiddenError extends ApplicationError {
    constructor(message?: string, action?: string, resource?: string);
}
/**
 * @class ConflictError
 * @brief Ошибка конфликта (например, дубликат).
 */
export declare class ConflictError extends ApplicationError {
    constructor(message: string, conflictingField?: string);
}
/**
 * @class BusinessRuleViolationError
 * @brief Ошибка нарушения бизнес-правила.
 */
export declare class BusinessRuleViolationError extends ApplicationError {
    constructor(message: string, rule?: string);
}
/**
 * @class InvariantViolationError
 * @brief Ошибка нарушения инварианта доменной модели.
 */
export declare class InvariantViolationError extends ApplicationError {
    constructor(message: string, entity?: string);
}
/**
 * @class InvalidStateTransitionError
 * @brief Ошибка недопустимого перехода состояния.
 */
export declare class InvalidStateTransitionError extends ApplicationError {
    constructor(currentState: string, targetState: string, entity?: string);
}
//# sourceMappingURL=domain.errors.d.ts.map