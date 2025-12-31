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
/**
 * Типы окружения
 */
export declare enum Environment {
    DEVELOPMENT = "development",
    PRODUCTION = "production",
    TEST = "test"
}
/**
 * Уровни логирования
 */
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
/**
 * Интерфейс конфигурации приложения
 */
export interface AppConfig {
    nodeEnv: Environment;
    port: number;
    database: {
        url: string;
    };
    telegram: {
        botToken: string;
    };
    logging: {
        level: LogLevel;
    };
}
/**
 * Загружает и валидирует конфигурацию приложения.
 */
export declare function loadConfig(): AppConfig;
/**
 * Инициализирует конфигурацию приложения.
 * Должна быть вызвана один раз при старте приложения.
 */
export declare function initializeConfig(): AppConfig;
/**
 * Получает конфигурацию приложения.
 * Выбрасывает ошибку если конфигурация не инициализирована.
 */
export declare function getConfig(): AppConfig;
//# sourceMappingURL=env.config.d.ts.map