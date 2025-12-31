/**
 * @file error.middleware.ts
 * @brief Middleware для обработки ошибок.
 *
 * Централизованная обработка всех ошибок в боте.
 */
import { Middleware } from 'telegraf';
import { BotContext } from '../types';
/**
 * Создаёт middleware для обработки ошибок
 */
export declare function createErrorMiddleware(): Middleware<BotContext>;
//# sourceMappingURL=error.middleware.d.ts.map