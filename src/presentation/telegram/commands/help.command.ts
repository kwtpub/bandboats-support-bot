/**
 * @file help.command.ts
 * @brief Обработчик команды /help.
 *
 * Показывает список доступных команд и инструкции.
 */

import { BotContext } from '../types';
import { getErrorHandler } from '../../../infrastructure/errors';

/**
 * Обработчик команды /help
 */
export function createHelpCommand() {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      const isAdmin = ctx.dbUser?.isAdmin() || false;

      const helpMessage = `
📖 *Справка по командам*

*Основные команды:*
/start - Начать работу с ботом
/help - Показать эту справку
/newticket - Создать новый тикет
/mytickets - Мои тикеты

${
  isAdmin
    ? `
*Команды администратора:*
/alltickets - Все тикеты в системе
/stats - Статистика по тикетам
`
    : ''
}

*Как создать тикет:*
1. Отправьте команду /newticket
2. Введите заголовок тикета
3. Опишите вашу проблему

*Как просмотреть тикеты:*
Используйте /mytickets для просмотра списка ваших тикетов.
${isAdmin ? 'Используйте /alltickets для просмотра всех тикетов.' : ''}

*Нужна помощь?*
Опишите свою проблему максимально подробно при создании тикета.
      `.trim();

      await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        command: 'help',
        userId: ctx.from?.id,
      });
      await ctx.reply(message);
    }
  };
}
