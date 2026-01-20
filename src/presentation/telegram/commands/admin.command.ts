/**
 * @file admin.command.ts
 * @brief Обработчик команды /admin.
 *
 * Показывает меню администратора.
 */

import { BotContext } from '../types';
import { getErrorHandler } from '../../../infrastructure/errors';
import { Markup } from 'telegraf';

/**
 * Обработчик команды /admin
 */
export function createAdminCommand() {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.reply('❌ Пользователь не найден. Используйте /start');
        return;
      }

      // Проверяем права администратора
      if (!ctx.dbUser.isAdmin()) {
        await ctx.reply('❌ У вас нет прав доступа к админ-панели.');
        return;
      }

      const message = `🔐 *Админ-панель*\n\nВыберите действие:`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📂 Открытые проблемы', 'admin_open_tickets')],
      ]);

      await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        command: 'admin',
        userId: ctx.from?.id,
      });
      await ctx.reply(message);
    }
  };
}
