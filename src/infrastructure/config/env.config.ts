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

import { config } from 'dotenv';
import { ConfigurationError } from '../../domain/errors';

// Загружаем переменные из .env файла
config();

/**
 * Типы окружения
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Уровни логирования
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Интерфейс конфигурации приложения
 */
export interface AppConfig {
  // Окружение
  nodeEnv: Environment;
  port: number;

  // База данных
  database: {
    url: string;
  };

  // Telegram Bot
  telegram: {
    botToken: string;
  };

  // Логирование
  logging: {
    level: LogLevel;
  };
}

/**
 * Получает обязательную переменную окружения.
 * Выбрасывает ошибку если переменная не установлена.
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new ConfigurationError(
      `Required environment variable "${key}" is not set`,
      key,
    );
  }
  return value;
}

/**
 * Получает опциональную переменную окружения.
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Получает переменную окружения как число.
 */
function getEnvAsNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new ConfigurationError(
      `Environment variable "${key}" must be a valid number, got: ${value}`,
      key,
    );
  }

  return parsed;
}

/**
 * Валидирует значение окружения.
 */
function validateEnvironment(value: string): Environment {
  const validEnvironments = Object.values(Environment);
  if (!validEnvironments.includes(value as Environment)) {
    throw new ConfigurationError(
      `Invalid NODE_ENV "${value}". Must be one of: ${validEnvironments.join(', ')}`,
      'NODE_ENV',
    );
  }
  return value as Environment;
}

/**
 * Валидирует уровень логирования.
 */
function validateLogLevel(value: string): LogLevel {
  const validLevels = Object.values(LogLevel);
  if (!validLevels.includes(value as LogLevel)) {
    throw new ConfigurationError(
      `Invalid LOG_LEVEL "${value}". Must be one of: ${validLevels.join(', ')}`,
      'LOG_LEVEL',
    );
  }
  return value as LogLevel;
}

/**
 * Валидирует URL базы данных.
 */
function validateDatabaseUrl(url: string): void {
  if (!url.startsWith('postgresql://')) {
    throw new ConfigurationError(
      'DATABASE_URL must be a valid PostgreSQL connection string starting with "postgresql://"',
      'DATABASE_URL',
    );
  }
}

/**
 * Валидирует токен Telegram бота.
 */
function validateBotToken(token: string): void {
  // Базовая валидация: токен должен содержать двоеточие и быть достаточно длинным
  if (token === 'your_telegram_bot_token_here') {
    throw new ConfigurationError(
      'BOT_TOKEN must be set to a valid Telegram bot token. Get it from @BotFather',
      'BOT_TOKEN',
    );
  }

  if (!token.includes(':') || token.length < 20) {
    throw new ConfigurationError(
      'BOT_TOKEN appears to be invalid. Expected format: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"',
      'BOT_TOKEN',
    );
  }
}

/**
 * Загружает и валидирует конфигурацию приложения.
 */
export function loadConfig(): AppConfig {
  // Загружаем переменные
  const nodeEnv = validateEnvironment(
    getOptionalEnv('NODE_ENV', Environment.DEVELOPMENT),
  );

  const databaseUrl = getRequiredEnv('DATABASE_URL');
  validateDatabaseUrl(databaseUrl);

  const botToken = getRequiredEnv('BOT_TOKEN');
  validateBotToken(botToken);

  const logLevel = validateLogLevel(
    getOptionalEnv('LOG_LEVEL', LogLevel.INFO),
  );

  const port = getEnvAsNumber('PORT', 3000);

  // Собираем конфигурацию
  const config: AppConfig = {
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
let appConfig: AppConfig | null = null;

/**
 * Инициализирует конфигурацию приложения.
 * Должна быть вызвана один раз при старте приложения.
 */
export function initializeConfig(): AppConfig {
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
export function getConfig(): AppConfig {
  if (!appConfig) {
    throw new ConfigurationError(
      'Configuration not initialized. Call initializeConfig() first.',
    );
  }
  return appConfig;
}
