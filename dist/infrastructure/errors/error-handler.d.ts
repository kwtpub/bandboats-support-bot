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
export declare class ErrorHandler {
    private readonly logger?;
    constructor(logger?: ErrorLogger | undefined);
    /**
     * Обрабатывает ошибку и возвращает понятное сообщение для пользователя.
     *
     * @param error - Ошибка для обработки
     * @param context - Дополнительный контекст (например, userId, action)
     * @returns Сообщение для пользователя
     */
    handle(error: Error, context?: Record<string, unknown>): string;
    /**
     * Обрабатывает кастомную ошибку приложения.
     */
    private handleApplicationError;
    /**
     * Обрабатывает стандартную ошибку.
     */
    private handleGenericError;
    /**
     * Логирует ошибку с контекстом.
     */
    private logError;
    /**
     * Проверяет, является ли ошибка операционной (ожидаемой).
     * Операционные ошибки обрабатываются gracefully.
     * Программные ошибки требуют перезапуска приложения.
     */
    isOperationalError(error: Error): boolean;
    /**
     * Обрабатывает фатальную ошибку (требует перезапуска).
     */
    handleFatalError(error: Error, context?: Record<string, unknown>): void;
}
/**
 * Инициализирует глобальный обработчик ошибок.
 */
export declare function initializeErrorHandler(logger?: ErrorLogger): ErrorHandler;
/**
 * Получает глобальный обработчик ошибок.
 */
export declare function getErrorHandler(): ErrorHandler;
//# sourceMappingURL=error-handler.d.ts.map