/**
 * @file ticket.command.ts
 * @brief Обработчик команды /ticket для просмотра деталей тикета.
 *
 * Показывает подробную информацию о тикете и его сообщения.
 */

import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
import { getErrorHandler } from '../../../infrastructure/errors';
import { TicketStatus } from '../../../domain/entities/Ticket/ticket.entity';

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
 * Обработчик команды /ticket
 */
export function createTicketCommand(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.reply('❌ Пользователь не найден. Используйте /start');
        return;
      }

      // Извлекаем ID тикета из команды
      const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1) : [];

      if (args.length === 0) {
        await ctx.reply(
          '⚠️ Укажите ID тикета.\n\n' +
            'Использование: /ticket <ID>\n' +
            'Пример: /ticket 5\n\n' +
            '💡 Или используйте /mytickets для просмотра ваших тикетов с кнопками',
        );
        return;
      }

      const ticketId = parseInt(args[0], 10);
      if (isNaN(ticketId)) {
        await ctx.reply('❌ Некорректный ID тикета. Используйте число.');
        return;
      }

      // Получаем тикет
      const ticket = await ticketService.getTicketById(ticketId);
      if (!ticket) {
        await ctx.reply(`❌ Тикет #${ticketId} не найден.`);
        return;
      }

      // Проверяем права доступа
      const canView = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
      if (!canView) {
        await ctx.reply('⛔️ У вас нет доступа к этому тикету.');
        return;
      }

      // Формируем информацию о тикете
      const statusEmoji = getStatusEmoji(ticket.status);
      const statusText = getStatusText(ticket.status);

      let message = `${statusEmoji} *Тикет #${ticket.id}*\n\n`;
      message += `📝 *Заголовок:* ${ticket.title}\n`;
      message += `📊 *Статус:* ${statusText}\n`;
      message += `👤 *Автор:* ID ${ticket.authorId}\n`;

      if (ticket.isAssigned()) {
        message += `🔧 *Исполнитель:* ID ${ticket.assigneeId}\n`;
      } else {
        message += `🔧 *Исполнитель:* Не назначен\n`;
      }

      const messageCount = ticket.getMessageCount();
      message += `💬 *Сообщений:* ${messageCount}\n\n`;

      // Добавляем последнее сообщение
      const lastMessage = ticket.getLastMessage();
      if (lastMessage) {
        message += `💭 *Последнее сообщение:*\n`;
        message += `_${lastMessage.content.substring(0, 200)}${lastMessage.content.length > 200 ? '...' : ''}_\n\n`;
      }

      // Добавляем доступные действия
      if (ticket.isOpen() || ticket.isInProgress()) {
        message += `*Доступные действия:*\n`;
        message += `💬 Добавить сообщение: /reply ${ticketId}\n`;

        const canClose = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
        if (canClose) {
          message += `✅ Закрыть тикет: /close ${ticketId}\n`;
        }
      }

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        command: 'ticket',
        userId: ctx.from?.id,
      });
      await ctx.reply(message);
    }
  };
}
