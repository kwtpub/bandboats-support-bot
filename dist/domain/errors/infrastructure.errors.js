"use strict";
/**
 * @file infrastructure.errors.ts
 * @brief Ошибки инфраструктурного слоя.
 *
 * Содержит ошибки, связанные с внешними системами и инфраструктурой.
 *
 * @remarks
 * Эти ошибки возникают при проблемах с базой данных, внешними API и т.д.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = exports.TelegramApiError = exports.ExternalServiceError = exports.DatabaseError = void 0;
const base_error_1 = require("./base.error");
/**
 * @class DatabaseError
 * @brief Ошибка работы с базой данных.
 */
class DatabaseError extends base_error_1.ApplicationError {
    constructor(message, operation, originalError) {
        super(message, 500, 'DATABASE_ERROR', {
            operation,
            originalError: originalError?.message,
        });
    }
}
exports.DatabaseError = DatabaseError;
/**
 * @class ExternalServiceError
 * @brief Ошибка взаимодействия с внешним сервисом.
 */
class ExternalServiceError extends base_error_1.ApplicationError {
    constructor(service, message, originalError) {
        super(`External service "${service}" error: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', {
            service,
            originalError: originalError?.message,
        });
    }
}
exports.ExternalServiceError = ExternalServiceError;
/**
 * @class TelegramApiError
 * @brief Ошибка Telegram Bot API.
 */
class TelegramApiError extends base_error_1.ApplicationError {
    constructor(message, method, originalError) {
        super(`Telegram API error: ${message}`, 503, 'TELEGRAM_API_ERROR', {
            method,
            originalError: originalError?.message,
        });
    }
}
exports.TelegramApiError = TelegramApiError;
/**
 * @class ConfigurationError
 * @brief Ошибка конфигурации приложения.
 */
class ConfigurationError extends base_error_1.ApplicationError {
    constructor(message, configKey) {
        super(message, 500, 'CONFIGURATION_ERROR', { configKey });
    }
}
exports.ConfigurationError = ConfigurationError;
//# sourceMappingURL=infrastructure.errors.js.map