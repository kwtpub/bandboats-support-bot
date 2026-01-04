/**
 * @file ticket-edit-callback.handler.ts
 * @brief Обработчики для редактирования и закрытия тикетов.
 *
 * Обрабатывает нажатия на кнопки редактирования заголовка, описания и закрытия тикета.
 */

import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
import { getErrorHandler } from '../../../infrastructure/errors';
import { Markup } from 'telegraf';

/**
 * Обработчик callback для кнопки "Изменить заголовок"
 */
export function createEditTitleCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser || !ctx.session) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      const callbackData =
        ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
      const match = callbackData.match(/^edit_title_(\d+)$/);

      if (!match) {
        await ctx.answerCbQuery('❌ Некорректный запрос');
        return;
      }

      const ticketId = parseInt(match[1], 10);

      // Проверяем права доступа
      const canView = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
      if (!canView) {
        await ctx.answerCbQuery('⛔️ У вас нет доступа к этому тикету');
        return;
      }

      // Устанавливаем состояние редактирования
      ctx.session.editingTicketId = ticketId;
      ctx.session.editingField = 'title';

      const message = `✏️ *Редактирование заголовка тикета #${ticketId}*\n\nВведите новый заголовок тикета:`;

      const backButton = Markup.inlineKeyboard([
        [Markup.button.callback('◀️ Отмена', `view_ticket_${ticketId}`)],
      ]);

      await ctx.answerCbQuery();

      if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
        try {
          await ctx.editMessageText(message, { parse_mode: 'Markdown', ...backButton });
        } catch (editError) {
          await ctx.reply(message, { parse_mode: 'Markdown', ...backButton });
        }
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown', ...backButton });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        handler: 'edit_title_callback',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery('❌ Произошла ошибка');
      await ctx.reply(message);
    }
  };
}

/**
 * Обработчик callback для кнопки "Изменить описание"
 */
export function createEditDescriptionCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser || !ctx.session) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      const callbackData =
        ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
      const match = callbackData.match(/^edit_description_(\d+)$/);

      if (!match) {
        await ctx.answerCbQuery('❌ Некорректный запрос');
        return;
      }

      const ticketId = parseInt(match[1], 10);

      // Проверяем права доступа
      const canView = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
      if (!canView) {
        await ctx.answerCbQuery('⛔️ У вас нет доступа к этому тикету');
        return;
      }

      // Устанавливаем состояние редактирования
      ctx.session.editingTicketId = ticketId;
      ctx.session.editingField = 'description';

      const message = `📝 *Редактирование описания тикета #${ticketId}*\n\nВведите новое описание тикета:`;

      const backButton = Markup.inlineKeyboard([
        [Markup.button.callback('◀️ Отмена', `view_ticket_${ticketId}`)],
      ]);

      await ctx.answerCbQuery();

      if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
        try {
          await ctx.editMessageText(message, { parse_mode: 'Markdown', ...backButton });
        } catch (editError) {
          await ctx.reply(message, { parse_mode: 'Markdown', ...backButton });
        }
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown', ...backButton });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        handler: 'edit_description_callback',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery('❌ Произошла ошибка');
      await ctx.reply(message);
    }
  };
}

/**
 * Обработчик callback для кнопки "Закрыть тикет"
 */
export function createCloseTicketCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      const callbackData =
        ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
      const match = callbackData.match(/^close_ticket_(\d+)$/);

      if (!match) {
        await ctx.answerCbQuery('❌ Некорректный запрос');
        return;
      }

      const ticketId = parseInt(match[1], 10);

      // Проверяем права доступа
      const canView = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
      if (!canView) {
        await ctx.answerCbQuery('⛔️ У вас нет доступа к этому тикету');
        return;
      }

      // Закрываем тикет
      await ticketService.closeTicket(ticketId, ctx.dbUser.getId());

      await ctx.answerCbQuery('✅ Тикет закрыт');

      const message = `✅ *Тикет #${ticketId} закрыт*\n\nТикет успешно закрыт.`;

      const backButton = Markup.inlineKeyboard([
        [Markup.button.callback('◀️ К моим тикетам', 'start_mytickets')],
      ]);

      if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
        try {
          await ctx.editMessageText(message, { parse_mode: 'Markdown', ...backButton });
        } catch (editError) {
          await ctx.reply(message, { parse_mode: 'Markdown', ...backButton });
        }
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown', ...backButton });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        handler: 'close_ticket_callback',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery('❌ Произошла ошибка');
      await ctx.reply(message);
    }
  };
}
