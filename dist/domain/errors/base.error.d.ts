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
export declare abstract class ApplicationError extends Error {
    /**
     * HTTP статус код для ошибки
     */
    readonly statusCode: number;
    /**
     * Код ошибки для идентификации типа
     */
    readonly errorCode: string;
    /**
     * Дополнительные метаданные ошибки
     */
    readonly metadata?: Record<string, unknown>;
    /**
     * Создаёт новую ошибку приложения.
     *
     * @param message - Сообщение об ошибке
     * @param statusCode - HTTP статус код
     * @param errorCode - Уникальный код ошибки
     * @param metadata - Дополнительные данные
     */
    constructor(message: string, statusCode: number, errorCode: string, metadata?: Record<string, unknown>);
    /**
     * Преобразует ошибку в JSON для логирования или API ответа.
     */
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=base.error.d.ts.map