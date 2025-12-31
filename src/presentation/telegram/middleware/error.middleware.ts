/**
 * @file error.middleware.ts
 * @brief Middleware для обработки ошибок.
 *
 * Централизованная обработка всех ошибок в боте.
 */

import { Middleware } from 'telegraf';
import { BotContext } from '../types';
import { getErrorHandler } from '../../../infrastructure/errors';

/**
 * Создаёт middleware для обработки ошибок
 */
export function createErrorMiddleware(): Middleware<BotContext> {
  const errorHandler = getErrorHandler();

  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.error('[Bot] Error in middleware chain:', error);

      const message = errorHandler.handle(error as Error, {
        userId: ctx.from?.id,
        chatId: ctx.chat?.id,
        updateType: ctx.updateType,
      });

      try {
        await ctx.reply(message);
      } catch (replyError) {
        console.error('[Bot] Failed to send error message:', replyError);
      }
    }
  };
}
