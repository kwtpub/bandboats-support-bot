/**
 * @file auth.middleware.ts
 * @brief Middleware для аутентификации пользователей.
 *
 * Проверяет наличие пользователя в БД и загружает его в контекст.
 */

import { Middleware } from 'telegraf';
import { BotContext } from '../types';
import { UserService } from '../../../domain/services/UserService/user.service';
import { getErrorHandler } from '../../../infrastructure/errors';

/**
 * Создаёт middleware для загрузки пользователя
 */
export function createAuthMiddleware(userService: UserService): Middleware<BotContext> {
  return async (ctx, next) => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.from) {
        await next();
        return;
      }

      const telegramId = ctx.from.id.toString();
      const user = await userService.getUserByTelegramId(telegramId);

      if (user) {
        ctx.dbUser = user;
      }

      await next();
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        middleware: 'auth',
        userId: ctx.from?.id,
      });
      await ctx.reply(message);
    }
  };
}

/**
 * Middleware, требующий авторизации
 */
export function requireAuth(): Middleware<BotContext> {
  return async (ctx, next) => {
    if (!ctx.dbUser) {
      await ctx.reply(
        '⚠️ Вы не авторизованы.\n\n' +
        'Используйте команду /start для регистрации.',
      );
      return;
    }

    await next();
  };
}

/**
 * Middleware, требующий роль администратора
 */
export function requireAdmin(): Middleware<BotContext> {
  return async (ctx, next) => {
    if (!ctx.dbUser) {
      await ctx.reply('⚠️ Вы не авторизованы. Используйте /start');
      return;
    }

    if (!ctx.dbUser.isAdmin()) {
      await ctx.reply('⛔️ Эта команда доступна только администраторам.');
      return;
    }

    await next();
  };
}
