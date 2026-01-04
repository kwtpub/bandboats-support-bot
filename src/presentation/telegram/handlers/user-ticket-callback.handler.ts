/**
 * @file user-ticket-callback.handler.ts
 * @brief Обработчики callback для действий пользователей с тикетами.
 */

import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
import { getErrorHandler } from '../../../infrastructure/errors';
import { Markup } from 'telegraf';

/**
 * Обработчик для кнопки "Ответить" (для пользователя)
 */
export function createUserReplyTicketCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser || !ctx.session) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      // Извлекаем ID тикета из callback_data
      const callbackQuery = ctx.callbackQuery;
      if (!callbackQuery || !('data' in callbackQuery)) {
        return;
      }

      const ticketId = parseInt(callbackQuery.data.split('_').pop() || '0', 10);

      const ticket = await ticketService.getTicketById(ticketId);
      if (!ticket) {
        await ctx.answerCbQuery('❌ Тикет не найден');
        return;
      }

      // Проверяем, что пользователь является автором тикета
      if (ticket.authorId !== ctx.dbUser.getId()) {
        await ctx.answerCbQuery('❌ Это не ваш тикет');
        return;
      }

      if (ticket.isClosed()) {
        await ctx.answerCbQuery('❌ Тикет уже закрыт');
        return;
      }

      await ctx.answerCbQuery();

      // Устанавливаем режим ответа на тикет
      ctx.session.replyingToTicketId = ticketId;
      ctx.session.awaitingTicket = true;
      ctx.session.ticketStep = 'description';

      const message = `💬 *Ответ на тикет #${ticketId}*\n\n📝 Напишите ваше сообщение:`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('❌ Отмена', 'user_cancel_reply')],
      ]);

      try {
        await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
      } catch (editError) {
        await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'user_reply_ticket',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Обработчик для кнопки "Закрыть тикет" (для пользователя)
 */
export function createUserCloseTicketCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      // Извлекаем ID тикета из callback_data
      const callbackQuery = ctx.callbackQuery;
      if (!callbackQuery || !('data' in callbackQuery)) {
        return;
      }

      const ticketId = parseInt(callbackQuery.data.split('_').pop() || '0', 10);

      const ticket = await ticketService.getTicketById(ticketId);
      if (!ticket) {
        await ctx.answerCbQuery('❌ Тикет не найден');
        return;
      }

      // Проверяем, что пользователь является автором тикета
      if (ticket.authorId !== ctx.dbUser.getId()) {
        await ctx.answerCbQuery('❌ Это не ваш тикет');
        return;
      }

      if (ticket.isClosed()) {
        await ctx.answerCbQuery('Тикет уже закрыт');
        return;
      }

      // Закрываем тикет
      await ticketService.closeTicket(ticketId, ctx.dbUser.getId());

      await ctx.answerCbQuery('✅ Тикет закрыт');

      const message = `✅ *Тикет #${ticketId} закрыт*\n\n📌 *${ticket.title}*\n\nТикет успешно закрыт.`;

      try {
        await ctx.editMessageText(message, { parse_mode: 'Markdown' });
      } catch (editError) {
        await ctx.reply(message, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'user_close_ticket',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Обработчик для отмены ответа на тикет (для пользователя)
 */
export function createUserCancelReplyCallbackHandler() {
  return async (ctx: BotContext): Promise<void> => {
    try {
      if (!ctx.session) {
        return;
      }

      // Очищаем сессию
      delete ctx.session.replyingToTicketId;
      delete ctx.session.awaitingTicket;
      delete ctx.session.ticketStep;

      await ctx.answerCbQuery('Ответ отменён');

      const message = `Действие отменено.`;

      try {
        await ctx.editMessageText(message);
      } catch (editError) {
        await ctx.reply(message);
      }
    } catch (error) {
      await ctx.answerCbQuery('❌ Ошибка при отмене');
    }
  };
}
