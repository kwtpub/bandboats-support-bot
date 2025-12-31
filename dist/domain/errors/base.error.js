"use strict";
/**
 * @file base.error.ts
 * @brief Базовый класс для всех доменных ошибок.
 *
 * Предоставляет основу для иерархии кастомных ошибок приложения.
 *
 * @remarks
 * Все доменные ошибки должны наследоваться от этого класса.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationError = void 0;
/**
 * @class ApplicationError
 * @brief Базовый класс для всех ошибок приложения.
 */
class ApplicationError extends Error {
    /**
     * Создаёт новую ошибку приложения.
     *
     * @param message - Сообщение об ошибке
     * @param statusCode - HTTP статус код
     * @param errorCode - Уникальный код ошибки
     * @param metadata - Дополнительные данные
     */
    constructor(message, statusCode, errorCode, metadata) {
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
    toJSON() {
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
exports.ApplicationError = ApplicationError;
//# sourceMappingURL=base.error.js.map