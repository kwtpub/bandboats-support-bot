/**
 * @file admin.middleware.ts
 * @brief Middleware для проверки прав администратора.
 *
 * Проверяет, что пользователь имеет роль ADMIN.
 */

import { BotContext } from '../types';

/**
 * Middleware для проверки прав администратора
 */
export function createAdminMiddleware() {
  return async (ctx: BotContext, next: () => Promise<void>): Promise<void> => {
    if (!ctx.dbUser) {
      await ctx.reply('❌ Пользователь не найден. Используйте /start');
      return;
    }

    if (!ctx.dbUser.isAdmin()) {
      await ctx.reply('⛔️ Эта команда доступна только администраторам.');
      return;
    }

    await next();
  };
}
