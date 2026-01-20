/**
 * @file start.command.ts
 * @brief Обработчик команды /start.
 *
 * Приветствует пользователя и регистрирует его в системе.
 */

import { BotContext } from '../types';
import { UserService } from '../../../domain/services/UserService/user.service';
import { getErrorHandler } from '../../../infrastructure/errors';
import { Markup } from 'telegraf';

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

      // Формируем приветственное сообщение в зависимости от роли
      let welcomeMessage: string;

      if (dbUser.isAdmin()) {
        // UI для администратора - сразу админ-панель
        welcomeMessage = `🔐 *Админ-панель*\n\nВыберите действие:`;
      } else {
        // UI для обычного пользователя
        welcomeMessage = `
👋 Добро пожаловать в систему поддержки Bandboats!

Я бот техподдержки. Здесь вы можете получить помощь по любым вопросам.

Используйте кнопку ниже для сообщения о проблеме:
        `.trim();
      }

      // Создаем inline-кнопки
      let keyboard;
      if (dbUser.isAdmin()) {
        keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('📂 Открытые проблемы', 'admin_open_tickets')],
          [Markup.button.callback('📋 Мои назначенные', 'admin_assigned_to_me')],
        ]);
      } else {
        keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('📝 Новая проблема', 'start_newticket')],
          [Markup.button.callback('📋 Мои проблемы', 'start_mytickets')],
        ]);
      }

      await ctx.reply(welcomeMessage, { parse_mode: 'Markdown', ...keyboard });
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        command: 'start',
        userId: ctx.from?.id,
      });
      await ctx.reply(message);
    }
  };
}
