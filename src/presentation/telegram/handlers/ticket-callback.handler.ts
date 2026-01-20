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
      const callbackData =
        ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
      const match = callbackData.match(/^view_ticket_(\d+)$/);

      if (!match) {
        await ctx.answerCbQuery('❌ Некорректный запрос');
        return;
      }

      const ticketId = parseInt(match[1], 10);

      // Получаем тикет
      const ticket = await ticketService.getTicketById(ticketId);
      if (!ticket) {
        await ctx.answerCbQuery(`❌ Проблема #${ticketId} не найдена`);
        return;
      }

      // Проверяем права доступа
      const canView = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
      if (!canView) {
        await ctx.answerCbQuery('⛔️ У вас нет доступа к этой проблеме');
        return;
      }

      // Формируем информацию о тикете
      const statusEmoji = getStatusEmoji(ticket.status);
      const statusText = getStatusText(ticket.status);

      let message = `${statusEmoji} *Проблема #${ticket.id}*\n\n`;
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

      // Показываем все сообщения
      if (ticket.messages.length > 0) {
        message += `📝 *Сообщения:*\n\n`;
        ticket.messages.forEach((msg) => {
          const content =
            msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content;
          const isAuthor = msg.authorId === ticket.authorId;
          const authorLabel = isAuthor ? '👤 Пользователь' : '👨‍💼 Администратор';
          message += `${authorLabel}:\n${content}\n\n`;
        });
      }

      // Создаем inline-кнопки для управления тикетом
      const buttons = [];

      if (ticket.isOpen() || ticket.isInProgress()) {
        // Кнопки редактирования (только если тикет не закрыт)
        buttons.push([
          Markup.button.callback('✏️ Изменить заголовок', `edit_title_${ticketId}`),
          Markup.button.callback('📝 Изменить описание', `edit_description_${ticketId}`),
        ]);

        // Кнопка закрытия тикета
        const canClose = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
        if (canClose) {
          buttons.push([Markup.button.callback('✅ Закрыть проблему', `close_ticket_${ticketId}`)]);
        }
      }

      // Кнопка "Назад"
      buttons.push([Markup.button.callback('◀️ Назад', 'start_mytickets')]);

      const keyboard = Markup.inlineKeyboard(buttons);

      // Отвечаем на callback и редактируем сообщение вместо отправки нового
      await ctx.answerCbQuery();

      // Редактируем текущее сообщение вместо отправки нового
      if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
        try {
          await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
        } catch (editError) {
          // Если не удалось отредактировать (например, сообщение слишком старое), отправляем новое
          await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
        }
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
      }
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
