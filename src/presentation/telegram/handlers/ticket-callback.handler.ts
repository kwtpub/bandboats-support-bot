/**
 * @file ticket-callback.handler.ts
 * @brief Обработчик callback-запросов для тикетов.
 *
 * Обрабатывает нажатия на inline-кнопки связанные с тикетами.
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
 * Обработчик callback для просмотра тикета
 */
export function createViewTicketCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      // Извлекаем ID тикета из callback_data
      const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
      const match = callbackData.match(/^view_ticket_(\d+)$/);

      if (!match) {
        await ctx.answerCbQuery('❌ Некорректный запрос');
        return;
      }

      const ticketId = parseInt(match[1], 10);

      // Получаем тикет
      const ticket = await ticketService.getTicketById(ticketId);
      if (!ticket) {
        await ctx.answerCbQuery(`❌ Тикет #${ticketId} не найден`);
        return;
      }

      // Проверяем права доступа
      const canView = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
      if (!canView) {
        await ctx.answerCbQuery('⛔️ У вас нет доступа к этому тикету');
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

      // Отвечаем на callback
      await ctx.answerCbQuery();
      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        handler: 'view_ticket_callback',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery('❌ Произошла ошибка');
      await ctx.reply(message);
    }
  };
}
