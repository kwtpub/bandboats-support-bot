/**
 * @file infrastructure.errors.ts
 * @brief Ошибки инфраструктурного слоя.
 *
 * Содержит ошибки, связанные с внешними системами и инфраструктурой.
 *
 * @remarks
 * Эти ошибки возникают при проблемах с базой данных, внешними API и т.д.
 */

import { ApplicationError } from './base.error';

/**
 * @class DatabaseError
 * @brief Ошибка работы с базой данных.
 */
export class DatabaseError extends ApplicationError {
  constructor(message: string, operation?: string, originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR', {
      operation,
      originalError: originalError?.message,
    });
  }
}

/**
 * @class ExternalServiceError
 * @brief Ошибка взаимодействия с внешним сервисом.
 */
export class ExternalServiceError extends ApplicationError {
  constructor(
    service: string,
    message: string,
    originalError?: Error,
  ) {
    super(
      `External service "${service}" error: ${message}`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      {
        service,
        originalError: originalError?.message,
      },
    );
  }
}

/**
 * @class TelegramApiError
 * @brief Ошибка Telegram Bot API.
 */
export class TelegramApiError extends ApplicationError {
  constructor(message: string, method?: string, originalError?: Error) {
    super(
      `Telegram API error: ${message}`,
      503,
      'TELEGRAM_API_ERROR',
      {
        method,
        originalError: originalError?.message,
      },
    );
  }
}

/**
 * @class ConfigurationError
 * @brief Ошибка конфигурации приложения.
 */
export class ConfigurationError extends ApplicationError {
  constructor(message: string, configKey?: string) {
    super(message, 500, 'CONFIGURATION_ERROR', { configKey });
  }
}
