/**
 * @file assign.command.ts
 * @brief Обработчик команды /assign для назначения тикета исполнителю.
 *
 * Позволяет администраторам назначать тикеты пользователям.
 */

import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
import { getErrorHandler } from '../../../infrastructure/errors';

/**
 * Обработчик команды /assign <ticket_id> <user_id> (только для админов)
 */
export function createAssignCommand(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.reply('❌ Пользователь не найден. Используйте /start');
        return;
      }

      // Парсим аргументы команды
      const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
      const args = messageText.split(' ').slice(1);

      if (args.length !== 2) {
        await ctx.reply(
          '❌ Неверный формат команды.\n\n' +
            'Использование: /assign <ticket_id> <user_id>\n\n' +
            'Пример: /assign 1 123456789',
        );
        return;
      }

      const ticketId = parseInt(args[0], 10);
      const assigneeId = parseInt(args[1], 10);

      if (isNaN(ticketId) || isNaN(assigneeId)) {
        await ctx.reply('❌ ID проблемы и ID пользователя должны быть числами.');
        return;
      }

      // Назначаем тикет
      const ticket = await ticketService.assignTicket(ticketId, assigneeId, ctx.dbUser.getId());

      await ctx.reply(
        `✅ *Проблема успешно назначена!*\n\n` +
          `🆔 ID проблемы: #${ticket.getId()}\n` +
          `📝 Заголовок: ${ticket.title}\n` +
          `🔧 Исполнитель: ID ${assigneeId}\n` +
          `📊 Статус: ${ticket.isInProgress() ? 'В работе' : 'Открыт'}`,
        { parse_mode: 'Markdown' },
      );
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        command: 'assign',
        userId: ctx.from?.id,
      });
      await ctx.reply(message);
    }
  };
}
