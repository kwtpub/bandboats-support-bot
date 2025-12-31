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
export class NotFoundError extends ApplicationError {
  constructor(resource: string, identifier: string | number) {
    super(
      `${resource} with identifier "${identifier}" not found`,
      404,
      'NOT_FOUND',
      { resource, identifier },
    );
  }
}

/**
 * @class ValidationError
 * @brief Ошибка валидации данных.
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, field?: string, value?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', { field, value });
  }
}

/**
 * @class UnauthorizedError
 * @brief Ошибка "Не авторизован".
 */
export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * @class ForbiddenError
 * @brief Ошибка "Доступ запрещён".
 */
export class ForbiddenError extends ApplicationError {
  constructor(
    message: string = 'Access forbidden',
    action?: string,
    resource?: string,
  ) {
    super(message, 403, 'FORBIDDEN', { action, resource });
  }
}

/**
 * @class ConflictError
 * @brief Ошибка конфликта (например, дубликат).
 */
export class ConflictError extends ApplicationError {
  constructor(message: string, conflictingField?: string) {
    super(message, 409, 'CONFLICT', { conflictingField });
  }
}

/**
 * @class BusinessRuleViolationError
 * @brief Ошибка нарушения бизнес-правила.
 */
export class BusinessRuleViolationError extends ApplicationError {
  constructor(message: string, rule?: string) {
    super(message, 422, 'BUSINESS_RULE_VIOLATION', { rule });
  }
}

/**
 * @class InvariantViolationError
 * @brief Ошибка нарушения инварианта доменной модели.
 */
export class InvariantViolationError extends ApplicationError {
  constructor(message: string, entity?: string) {
    super(message, 422, 'INVARIANT_VIOLATION', { entity });
  }
}

/**
 * @class InvalidStateTransitionError
 * @brief Ошибка недопустимого перехода состояния.
 */
export class InvalidStateTransitionError extends ApplicationError {
  constructor(
    currentState: string,
    targetState: string,
    entity?: string,
  ) {
    super(
      `Invalid state transition from "${currentState}" to "${targetState}"${entity ? ` for ${entity}` : ''}`,
      422,
      'INVALID_STATE_TRANSITION',
      { currentState, targetState, entity },
    );
  }
}
