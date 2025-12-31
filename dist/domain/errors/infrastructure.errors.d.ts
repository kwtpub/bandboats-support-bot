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
export declare class DatabaseError extends ApplicationError {
    constructor(message: string, operation?: string, originalError?: Error);
}
/**
 * @class ExternalServiceError
 * @brief Ошибка взаимодействия с внешним сервисом.
 */
export declare class ExternalServiceError extends ApplicationError {
    constructor(service: string, message: string, originalError?: Error);
}
/**
 * @class TelegramApiError
 * @brief Ошибка Telegram Bot API.
 */
export declare class TelegramApiError extends ApplicationError {
    constructor(message: string, method?: string, originalError?: Error);
}
/**
 * @class ConfigurationError
 * @brief Ошибка конфигурации приложения.
 */
export declare class ConfigurationError extends ApplicationError {
    constructor(message: string, configKey?: string);
}
//# sourceMappingURL=infrastructure.errors.d.ts.map