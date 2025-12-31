/**
 * @file start.command.ts
 * @brief Обработчик команды /start.
 *
 * Приветствует пользователя и регистрирует его в системе.
 */

import { BotContext } from '../types';
import { UserService } from '../../../domain/services/UserService/user.service';
import { getErrorHandler } from '../../../infrastructure/errors';

/**
 * Обработчик команды /start
 */
export function createStartCommand(userService: UserService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      const telegramUser = ctx.from;
      if (!telegramUser) {
        await ctx.reply('❌ Не удалось получить информацию о пользователе.');
        return;
      }

      // Получаем или создаём пользователя в БД
      const dbUser = await userService.getOrCreateUser(
        telegramUser.id.toString(),
        telegramUser.first_name || telegramUser.username || 'Пользователь',
      );

      // Сохраняем пользователя в контексте
      ctx.dbUser = dbUser;

      // Формируем приветственное сообщение
      const welcomeMessage = `
👋 Добро пожаловать в систему поддержки Bandboats!

Я бот техподдержки. Вы можете:

📝 Создать новый тикет - /newticket
📋 Посмотреть свои тикеты - /mytickets
ℹ️ Получить помощь - /help

${dbUser.isAdmin() ? '\n👑 Вы администратор!\n🎫 Все тикеты - /alltickets\n' : ''}
      `.trim();

      await ctx.reply(welcomeMessage);
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        command: 'start',
        userId: ctx.from?.id,
      });
      await ctx.reply(message);
    }
  };
}
