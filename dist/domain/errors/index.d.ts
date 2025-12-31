/**
 * @file index.ts
 * @brief Экспорт всех классов ошибок.
 */
export { ApplicationError } from './base.error';
export { NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError, BusinessRuleViolationError, InvariantViolationError, InvalidStateTransitionError, } from './domain.errors';
export { DatabaseError, ExternalServiceError, TelegramApiError, ConfigurationError, } from './infrastructure.errors';
//# sourceMappingURL=index.d.ts.map