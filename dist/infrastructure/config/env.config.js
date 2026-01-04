"use strict";
/**
 * @file env.config.ts
 * @brief Конфигурация переменных окружения с валидацией.
 *
 * Загружает и валидирует переменные окружения при старте приложения.
 * Обеспечивает типобезопасный доступ к конфигурации.
 *
 * @remarks
 * Все переменные валидируются при инициализации.
 * Отсутствующие обязательные переменные вызывают ошибку.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.Environment = void 0;
exports.loadConfig = loadConfig;
exports.initializeConfig = initializeConfig;
exports.getConfig = getConfig;
const dotenv_1 = require("dotenv");
const errors_1 = require("../../domain/errors");
// Загружаем переменные из .env файла
(0, dotenv_1.config)();
/**
 * Типы окружения
 */
var Environment;
(function (Environment) {
    Environment["DEVELOPMENT"] = "development";
    Environment["PRODUCTION"] = "production";
    Environment["TEST"] = "test";
})(Environment || (exports.Environment = Environment = {}));
/**
 * Уровни логирования
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Получает обязательную переменную окружения.
 * Выбрасывает ошибку если переменная не установлена.
 */
function getRequiredEnv(key) {
    const value = process.env[key];
    if (!value || value.trim().length === 0) {
        throw new errors_1.ConfigurationError(`Required environment variable "${key}" is not set`, key);
    }
    return value;
}
/**
 * Получает опциональную переменную окружения.
 */
function getOptionalEnv(key, defaultValue) {
    return process.env[key] || defaultValue;
}
/**
 * Получает переменную окружения как число.
 */
function getEnvAsNumber(key, defaultValue) {
    const value = process.env[key];
    if (!value) {
        return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new errors_1.ConfigurationError(`Environment variable "${key}" must be a valid number, got: ${value}`, key);
    }
    return parsed;
}
/**
 * Валидирует значение окружения.
 */
function validateEnvironment(value) {
    const validEnvironments = Object.values(Environment);
    if (!validEnvironments.includes(value)) {
        throw new errors_1.ConfigurationError(`Invalid NODE_ENV "${value}". Must be one of: ${validEnvironments.join(', ')}`, 'NODE_ENV');
    }
    return value;
}
/**
 * Валидирует уровень логирования.
 */
function validateLogLevel(value) {
    const validLevels = Object.values(LogLevel);
    if (!validLevels.includes(value)) {
        throw new errors_1.ConfigurationError(`Invalid LOG_LEVEL "${value}". Must be one of: ${validLevels.join(', ')}`, 'LOG_LEVEL');
    }
    return value;
}
/**
 * Валидирует URL базы данных.
 */
function validateDatabaseUrl(url) {
    if (!url.startsWith('postgresql://')) {
        throw new errors_1.ConfigurationError('DATABASE_URL must be a valid PostgreSQL connection string starting with "postgresql://"', 'DATABASE_URL');
    }
}
/**
 * Валидирует токен Telegram бота.
 */
function validateBotToken(token) {
    // Базовая валидация: токен должен содержать двоеточие и быть достаточно длинным
    if (token === 'your_telegram_bot_token_here') {
        throw new errors_1.ConfigurationError('TELEGRAM_BOT_TOKEN must be set to a valid Telegram bot token. Get it from @BotFather', 'TELEGRAM_BOT_TOKEN');
    }
    if (!token.includes(':') || token.length < 20) {
        throw new errors_1.ConfigurationError('TELEGRAM_BOT_TOKEN appears to be invalid. Expected format: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"', 'TELEGRAM_BOT_TOKEN');
    }
}
/**
 * Загружает и валидирует конфигурацию приложения.
 */
function loadConfig() {
    // Загружаем переменные
    const nodeEnv = validateEnvironment(getOptionalEnv('NODE_ENV', Environment.DEVELOPMENT));
    const databaseUrl = getRequiredEnv('DATABASE_URL');
    validateDatabaseUrl(databaseUrl);
    const botToken = getRequiredEnv('TELEGRAM_BOT_TOKEN');
    validateBotToken(botToken);
    const logLevel = validateLogLevel(getOptionalEnv('LOG_LEVEL', LogLevel.INFO));
    const port = getEnvAsNumber('PORT', 3000);
    // Собираем конфигурацию
    const config = {
        nodeEnv,
        port,
        database: {
            url: databaseUrl,
        },
        telegram: {
            botToken,
        },
        logging: {
            level: logLevel,
        },
    };
    return config;
}
/**
 * Глобальный экземпляр конфигурации
 */
let appConfig = null;
/**
 * Инициализирует конфигурацию приложения.
 * Должна быть вызвана один раз при старте приложения.
 */
function initializeConfig() {
    if (appConfig) {
        return appConfig;
    }
    appConfig = loadConfig();
    return appConfig;
}
/**
 * Получает конфигурацию приложения.
 * Выбрасывает ошибку если конфигурация не инициализирована.
 */
function getConfig() {
    if (!appConfig) {
        throw new errors_1.ConfigurationError('Configuration not initialized. Call initializeConfig() first.');
    }
    return appConfig;
}
//# sourceMappingURL=env.config.js.map