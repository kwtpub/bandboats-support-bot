/**
 * @file logging.middleware.ts
 * @brief Middleware для логирования действий пользователей.
 *
 * Логирует все команды и действия пользователей для аудита.
 */
import { Middleware } from 'telegraf';
import { BotContext } from '../types';
/**
 * Создаёт middleware для логирования
 */
export declare function createLoggingMiddleware(): Middleware<BotContext>;
//# sourceMappingURL=logging.middleware.d.ts.map