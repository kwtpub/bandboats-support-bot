/**
 * @file index.ts
 * @brief Экспорт всех классов ошибок.
 */

// Базовый класс
export { ApplicationError } from './base.error';

// Доменные ошибки
export {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BusinessRuleViolationError,
  InvariantViolationError,
  InvalidStateTransitionError,
} from './domain.errors';

// Инфраструктурные ошибки
export {
  DatabaseError,
  ExternalServiceError,
  TelegramApiError,
  ConfigurationError,
} from './infrastructure.errors';
