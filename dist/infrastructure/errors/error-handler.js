"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
exports.initializeErrorHandler = initializeErrorHandler;
exports.getErrorHandler = getErrorHandler;
const errors_1 = require("../../domain/errors");
/**
 * @class ErrorHandler
 * @brief Централизованный обработчик ошибок приложения.
 */
class ErrorHandler {
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Обрабатывает ошибку и возвращает понятное сообщение для пользователя.
     *
     * @param error - Ошибка для обработки
     * @param context - Дополнительный контекст (например, userId, action)
     * @returns Сообщение для пользователя
     */
    handle(error, context) {
        // Логируем ошибку
        this.logError(error, context);
        // Если это наша кастомная ошибка
        if (error instanceof errors_1.ApplicationError) {
            return this.handleApplicationError(error);
        }
        // Если это стандартная ошибка
        return this.handleGenericError(error);
    }
    /**
     * Обрабатывает кастомную ошибку приложения.
     */
    handleApplicationError(error) {
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
    handleGenericError(error) {
        // В production не показываем детали ошибок
        if (process.env.NODE_ENV === 'production') {
            return '❌ Произошла непредвиденная ошибка. Попробуйте позже.';
        }
        return `❌ Ошибка: ${error.message}`;
    }
    /**
     * Логирует ошибку с контекстом.
     */
    logError(error, context) {
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
        if (error instanceof errors_1.ApplicationError) {
            // Клиентские ошибки (4xx) - WARNING
            if (error.statusCode >= 400 && error.statusCode < 500) {
                this.logger.warn(error.message, {
                    ...error.toJSON(),
                    context,
                });
            }
            else {
                // Серверные ошибки (5xx) - ERROR
                this.logger.error(error.message, error, {
                    ...error.toJSON(),
                    context,
                });
            }
        }
        else {
            // Все остальные ошибки логируем как ERROR
            this.logger.error(error.message, error, context);
        }
    }
    /**
     * Проверяет, является ли ошибка операционной (ожидаемой).
     * Операционные ошибки обрабатываются gracefully.
     * Программные ошибки требуют перезапуска приложения.
     */
    isOperationalError(error) {
        if (error instanceof errors_1.ApplicationError) {
            // Все наши кастомные ошибки - операционные
            return true;
        }
        // Стандартные ошибки обычно программные
        return false;
    }
    /**
     * Обрабатывает фатальную ошибку (требует перезапуска).
     */
    handleFatalError(error, context) {
        this.logError(error, context);
        console.error('Fatal error occurred. Application will exit.');
        console.error(error);
        // Даём время на запись логов
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
}
exports.ErrorHandler = ErrorHandler;
/**
 * Глобальный синглтон обработчика ошибок
 */
let globalErrorHandler = null;
/**
 * Инициализирует глобальный обработчик ошибок.
 */
function initializeErrorHandler(logger) {
    globalErrorHandler = new ErrorHandler(logger);
    return globalErrorHandler;
}
/**
 * Получает глобальный обработчик ошибок.
 */
function getErrorHandler() {
    if (!globalErrorHandler) {
        globalErrorHandler = new ErrorHandler();
    }
    return globalErrorHandler;
}
//# sourceMappingURL=error-handler.js.map