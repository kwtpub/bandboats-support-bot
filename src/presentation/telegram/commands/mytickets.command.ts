/**
 * @file mytickets.command.ts
 * @brief Обработчик команды /mytickets.
 *
 * Показывает список тикетов пользователя.
 */

import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
import { getErrorHandler } from '../../../infrastructure/errors';
import { TicketStatus } from '../../../domain/entities/Ticket/ticket.entity';
import { Markup } from 'telegraf';

/**
 * Получает эмодзи для статуса тикета
 */
function getStatusEmoji(status: TicketStatus): string {
  switch (status) {
    case TicketStatus.OPEN:
      return '🆕';
    case TicketStatus.IN_PROGRESS:
      return '🔄';
    case TicketStatus.CLOSE:
      return '✅';
    default:
      return '❓';
  }
}

/**
 * Получает текстовое представление статуса
 */
function getStatusText(status: TicketStatus): string {
  switch (status) {
    case TicketStatus.OPEN:
      return 'Открыт';
    case TicketStatus.IN_PROGRESS:
      return 'В работе';
    case TicketStatus.CLOSE:
      return 'Закрыт';
    default:
      return 'Неизвестно';
  }
}

/**
 * Обработчик команды /mytickets
 */
export function createMyTicketsCommand(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.reply('❌ Пользователь не найден. Используйте /start');
        return;
      }

      // Получаем тикеты пользователя
      const tickets = await ticketService.getTicketsByAuthor(ctx.dbUser.getId());

      if (tickets.length === 0) {
        await ctx.reply('📋 У вас пока нет тикетов.\n\nСоздайте новый тикет командой /newticket');
        return;
      }

      // Формируем список тикетов
      let message = `📋 *Ваши тикеты (${tickets.length}):*\n\n`;

      tickets.forEach((ticket, index) => {
        const statusEmoji = getStatusEmoji(ticket.status);
        const statusText = getStatusText(ticket.status);
        const messageCount = ticket.getMessageCount();

        message += `${index + 1}. ${statusEmoji} *${ticket.title}*\n`;
        message += `   ID: #${ticket.id} | ${statusText}\n`;
        message += `   💬 Сообщений: ${messageCount}\n`;
        if (ticket.isAssigned()) {
          message += `   👤 Назначен исполнителю\n`;
        }
        message += `\n`;
      });

      message += `\n💡 Нажмите на кнопку ниже для просмотра тикета:`;

      // Создаем inline-кнопки для каждого тикета
      const buttons = tickets.map((ticket) => {
        const statusEmoji = getStatusEmoji(ticket.status);
        return [
          Markup.button.callback(
            `${statusEmoji} #${ticket.id} ${ticket.title.substring(0, 25)}${ticket.title.length > 25 ? '...' : ''}`,
            `view_ticket_${ticket.id}`,
          ),
        ];
      });

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons),
      });
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        command: 'mytickets',
        userId: ctx.from?.id,
      });
      await ctx.reply(message);
    }
  };
}
