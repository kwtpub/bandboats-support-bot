/**
 * @file start-callback.handler.ts
 * @brief Обработчик callback-запросов для стартового меню.
 *
 * Обрабатывает нажатия на inline-кнопки стартового меню.
 */

import { BotContext } from '../types';
import { getErrorHandler } from '../../../infrastructure/errors';
import { Markup } from 'telegraf';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';

/**
 * Обработчик callback для кнопки "Назад в меню"
 */
export function createBackToMenuCallbackHandler() {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      // Сбрасываем состояние создания тикета
      if (ctx.session) {
        ctx.session.awaitingTicket = false;
        ctx.session.ticketStep = undefined;
        ctx.session.ticketTitle = undefined;
      }

      const message = `👋 Добро пожаловать в систему поддержки Bandboats!

Я бот техподдержки. Здесь вы можете получить помощь по любым вопросам.

Используйте кнопку ниже для сообщения о проблеме:`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📝 Новая проблема', 'start_newticket')],
        [Markup.button.callback('📋 Мои проблемы', 'start_mytickets')],
      ]);

      await ctx.answerCbQuery();

      // Редактируем текущее сообщение
      if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
        try {
          await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
        } catch (editError) {
          await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
        }
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        handler: 'back_to_menu_callback',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery('❌ Произошла ошибка');
      await ctx.reply(message);
    }
  };
}

/**
 * Обработчик callback для кнопки "Мои тикеты"
 */
export function createMyTicketsCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      await ctx.answerCbQuery();

      // Получаем тикеты пользователя
      const tickets = await ticketService.getTicketsByAuthor(ctx.dbUser.getId());

      if (tickets.length === 0) {
        const message =
          '📋 У вас пока нет проблем.\n\nИспользуйте кнопку ниже для сообщения о новой проблеме:';
        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('📝 Новая проблема', 'start_newticket')],
          [Markup.button.callback('◀️ Назад', 'ticket_back_to_menu')],
        ]);

        // Редактируем сообщение
        if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
          try {
            await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
          } catch (editError) {
            await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
          }
        } else {
          await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
        }
        return;
      }

      // Формируем список тикетов (импортируем функции из mytickets.command.ts)
      const getStatusEmoji = (status: any): string => {
        switch (status) {
          case 'OPEN':
            return '🆕';
          case 'IN_PROGRESS':
            return '🔄';
          case 'CLOSE':
            return '✅';
          default:
            return '❓';
        }
      };

      const getStatusText = (status: any): string => {
        switch (status) {
          case 'OPEN':
            return 'Открыт';
          case 'IN_PROGRESS':
            return 'В работе';
          case 'CLOSE':
            return 'Закрыт';
          default:
            return 'Неизвестно';
        }
      };

      let message = `📋 *Ваши проблемы (${tickets.length}):*\n\n💡 Выберите проблему для просмотра:`;

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

      // Добавляем кнопку "Назад"
      buttons.push([Markup.button.callback('◀️ Назад', 'ticket_back_to_menu')]);

      // Редактируем сообщение
      if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
        try {
          await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons),
          });
        } catch (editError) {
          await ctx.reply(message, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
        }
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        handler: 'mytickets_callback',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery('❌ Произошла ошибка');
      await ctx.reply(message);
    }
  };
}

/**
 * Обработчик callback для кнопки "Назад к заголовку"
 */
export function createBackToTitleCallbackHandler() {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      // Возвращаемся к шагу ввода заголовка
      if (ctx.session) {
        ctx.session.ticketStep = 'title';
        ctx.session.ticketTitle = undefined;
      }

      const message = `📝 *Сообщить о проблеме*

Шаг 1 из 2: Введите заголовок проблемы`;

      const backButton = Markup.inlineKeyboard([
        [Markup.button.callback('◀️ Назад', 'ticket_back_to_menu')],
      ]);

      await ctx.answerCbQuery();

      // Редактируем текущее сообщение
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
        handler: 'back_to_title_callback',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery('❌ Произошла ошибка');
      await ctx.reply(message);
    }
  };
}

/**
 * Обработчик callback для кнопки "Новый тикет"
 */
export function createNewTicketCallbackHandler() {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      // Устанавливаем состояние для создания тикета - шаг 1: заголовок
      if (ctx.session) {
        ctx.session.awaitingTicket = true;
        ctx.session.ticketStep = 'title';
        ctx.session.ticketTitle = undefined;
      }

      const message = `📝 *Сообщить о проблеме*

Шаг 1 из 2: Введите заголовок проблемы`;

      const backButton = Markup.inlineKeyboard([
        [Markup.button.callback('◀️ Назад', 'ticket_back_to_menu')],
      ]);

      await ctx.answerCbQuery();

      // Редактируем текущее сообщение
      if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
        try {
          await ctx.editMessageText(message, { parse_mode: 'Markdown', ...backButton });
        } catch (editError) {
          // Если не удалось отредактировать, отправляем новое
          await ctx.reply(message, { parse_mode: 'Markdown', ...backButton });
        }
      } else {
        await ctx.reply(message, { parse_mode: 'Markdown', ...backButton });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        handler: 'newticket_callback',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery('❌ Произошла ошибка');
      await ctx.reply(message);
    }
  };
}
