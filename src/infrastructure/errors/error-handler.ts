/**
 * @file error-handler.ts
 * @brief Централизованный обработчик ошибок.
 *
 * Обрабатывает все ошибки приложения, логирует их и формирует
 * понятные сообщения для пользователя.
 *
 * @remarks
 * Используется в Telegram боте и других точках входа приложения.
 */

import { ApplicationError } from '../../domain/errors';

/**
 * Интерфейс логгера для обработчика ошибок
 */
export interface ErrorLogger {
  error(message: string, error: Error, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
}

/**
 * @class ErrorHandler
 * @brief Централизованный обработчик ошибок приложения.
 */
export class ErrorHandler {
  constructor(private readonly logger?: ErrorLogger) {}

  /**
   * Обрабатывает ошибку и возвращает понятное сообщение для пользователя.
   *
   * @param error - Ошибка для обработки
   * @param context - Дополнительный контекст (например, userId, action)
   * @returns Сообщение для пользователя
   */
  handle(error: Error, context?: Record<string, unknown>): string {
    // Логируем ошибку
    this.logError(error, context);

    // Если это наша кастомная ошибка
    if (error instanceof ApplicationError) {
      return this.handleApplicationError(error);
    }

    // Если это стандартная ошибка
    return this.handleGenericError(error);
  }

  /**
   * Обрабатывает кастомную ошибку приложения.
   */
  private handleApplicationError(error: ApplicationError): string {
    switch (error.errorCode) {
      case 'NOT_FOUND':
        return `❌ ${error.message}`;

      case 'VALIDATION_ERROR':
        return `⚠️ Ошибка валидации: ${error.message}`;

      case 'UNAUTHORIZED':
        return '🔒 Требуется авторизация для выполнения этого действия.';

      case 'FORBIDDEN':
        return '⛔️ У вас недостаточно прав для выполнения этого действия.';

      case 'CONFLICT':
        return `⚠️ Конфликт: ${error.message}`;

      case 'BUSINESS_RULE_VIOLATION':
        return `❌ Нарушение бизнес-правила: ${error.message}`;

      case 'INVARIANT_VIOLATION':
        return `❌ Некорректное состояние: ${error.message}`;

      case 'INVALID_STATE_TRANSITION':
        return `❌ Недопустимое изменение состояния: ${error.message}`;

      case 'DATABASE_ERROR':
        return '💾 Произошла ошибка при работе с базой данных. Попробуйте позже.';

      case 'EXTERNAL_SERVICE_ERROR':
        return '🌐 Внешний сервис временно недоступен. Попробуйте позже.';

      case 'TELEGRAM_API_ERROR':
        return '📱 Ошибка Telegram API. Попробуйте позже.';

      case 'CONFIGURATION_ERROR':
        return '⚙️ Ошибка конфигурации приложения. Обратитесь к администратору.';

      default:
        return `❌ Произошла ошибка: ${error.message}`;
    }
  }

  /**
   * Обрабатывает стандартную ошибку.
   */
  private handleGenericError(error: Error): string {
    // В production не показываем детали ошибок
    if (process.env.NODE_ENV === 'production') {
      return '❌ Произошла непредвиденная ошибка. Попробуйте позже.';
    }

    return `❌ Ошибка: ${error.message}`;
  }

  /**
   * Логирует ошибку с контекстом.
   */
  private logError(error: Error, context?: Record<string, unknown>): void {
    if (!this.logger) {
      // Если логгер не настроен, выводим в консоль
      console.error('Error occurred:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context,
      });
      return;
    }

    // Используем логгер
    if (error instanceof ApplicationError) {
      // Клиентские ошибки (4xx) - WARNING
      if (error.statusCode >= 400 && error.statusCode < 500) {
        this.logger.warn(error.message, {
          ...error.toJSON(),
          context,
        });
      } else {
        // Серверные ошибки (5xx) - ERROR
        this.logger.error(error.message, error, {
          ...error.toJSON(),
          context,
        });
      }
    } else {
      // Все остальные ошибки логируем как ERROR
      this.logger.error(error.message, error, context);
    }
  }

  /**
   * Проверяет, является ли ошибка операционной (ожидаемой).
   * Операционные ошибки обрабатываются gracefully.
   * Программные ошибки требуют перезапуска приложения.
   */
  isOperationalError(error: Error): boolean {
    if (error instanceof ApplicationError) {
      // Все наши кастомные ошибки - операционные
      return true;
    }

    // Стандартные ошибки обычно программные
    return false;
  }

  /**
   * Обрабатывает фатальную ошибку (требует перезапуска).
   */
  handleFatalError(error: Error, context?: Record<string, unknown>): void {
    this.logError(error, context);

    console.error('Fatal error occurred. Application will exit.');
    console.error(error);

    // Даём время на запись логов
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

/**
 * Глобальный синглтон обработчика ошибок
 */
let globalErrorHandler: ErrorHandler | null = null;

/**
 * Инициализирует глобальный обработчик ошибок.
 */
export function initializeErrorHandler(logger?: ErrorLogger): ErrorHandler {
  globalErrorHandler = new ErrorHandler(logger);
  return globalErrorHandler;
}

/**
 * Получает глобальный обработчик ошибок.
 */
export function getErrorHandler(): ErrorHandler {
  if (!globalErrorHandler) {
    globalErrorHandler = new ErrorHandler();
  }
  return globalErrorHandler;
}
