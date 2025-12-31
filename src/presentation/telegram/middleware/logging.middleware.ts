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
export function createLoggingMiddleware(): Middleware<BotContext> {
  return async (ctx, next) => {
    const start = Date.now();

    // Получаем информацию о запросе
    const userId = ctx.from?.id;
    const username = ctx.from?.username;
    const firstName = ctx.from?.first_name;

    let action = 'unknown';
    if (ctx.message && 'text' in ctx.message) {
      action = ctx.message.text;
    } else if (ctx.callbackQuery) {
      action = 'callback_query';
    }

    console.log(`[Bot] User ${userId} (${username || firstName}) -> ${action}`);

    try {
      await next();

      const duration = Date.now() - start;
      console.log(`[Bot] Request processed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[Bot] Error after ${duration}ms:`, error);
      throw error;
    }
  };
}
