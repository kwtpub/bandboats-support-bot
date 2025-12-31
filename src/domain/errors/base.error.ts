/**
 * @file base.error.ts
 * @brief Базовый класс для всех доменных ошибок.
 *
 * Предоставляет основу для иерархии кастомных ошибок приложения.
 *
 * @remarks
 * Все доменные ошибки должны наследоваться от этого класса.
 */

/**
 * @class ApplicationError
 * @brief Базовый класс для всех ошибок приложения.
 */
export abstract class ApplicationError extends Error {
  /**
   * HTTP статус код для ошибки
   */
  public readonly statusCode: number;

  /**
   * Код ошибки для идентификации типа
   */
  public readonly errorCode: string;

  /**
   * Дополнительные метаданные ошибки
   */
  public readonly metadata?: Record<string, unknown>;

  /**
   * Создаёт новую ошибку приложения.
   *
   * @param message - Сообщение об ошибке
   * @param statusCode - HTTP статус код
   * @param errorCode - Уникальный код ошибки
   * @param metadata - Дополнительные данные
   */
  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.metadata = metadata;

    // Сохраняем правильный stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Преобразует ошибку в JSON для логирования или API ответа.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      metadata: this.metadata,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}
