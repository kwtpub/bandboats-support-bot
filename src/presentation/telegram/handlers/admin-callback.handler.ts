/**
 * @file admin-callback.handler.ts
 * @brief Обработчики callback для админ-панели.
 */

import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
import { getErrorHandler } from '../../../infrastructure/errors';
import { Markup } from 'telegraf';
import { TicketStatus } from '../../../domain/entities/Ticket/ticket.entity';

const TICKETS_PER_PAGE = 5;

/**
 * Обработчик для кнопки "Открытые тикеты"
 */
export function createAdminOpenTicketsCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      // Проверяем права администратора
      if (!ctx.dbUser.isAdmin()) {
        await ctx.answerCbQuery('❌ Нет прав доступа');
        return;
      }

      // Получаем открытые тикеты
      const tickets = await ticketService.getTicketsByStatus(TicketStatus.OPEN);

      if (tickets.length === 0) {
        await ctx.answerCbQuery();
        const message = '📂 *Открытые тикеты*\n\nНет открытых тикетов.';

        try {
          await ctx.editMessageText(message, { parse_mode: 'Markdown' });
        } catch (editError) {
          await ctx.reply(message, { parse_mode: 'Markdown' });
        }
        return;
      }

      // Показываем первую страницу
      await showOpenTicketsPage(ctx, ticketService, tickets, 0);
      await ctx.answerCbQuery();
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'admin_open_tickets',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Обработчик для пагинации открытых тикетов
 */
export function createAdminOpenTicketsPaginationHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      if (!ctx.dbUser.isAdmin()) {
        await ctx.answerCbQuery('❌ Нет прав доступа');
        return;
      }

      // Извлекаем номер страницы из callback_data
      const callbackQuery = ctx.callbackQuery;
      if (!callbackQuery || !('data' in callbackQuery)) {
        return;
      }

      const page = parseInt(callbackQuery.data.split('_').pop() || '0', 10);

      // Получаем открытые тикеты
      const tickets = await ticketService.getTicketsByStatus(TicketStatus.OPEN);

      await showOpenTicketsPage(ctx, ticketService, tickets, page);
      await ctx.answerCbQuery();
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'admin_open_tickets_page',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Показывает страницу с открытыми тикетами
 */
async function showOpenTicketsPage(
  ctx: BotContext,
  ticketService: TicketService,
  tickets: any[],
  page: number,
): Promise<void> {
  const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);
  const startIndex = page * TICKETS_PER_PAGE;
  const endIndex = Math.min(startIndex + TICKETS_PER_PAGE, tickets.length);
  const pageTickets = tickets.slice(startIndex, endIndex);

  let message = `📂 *Открытые тикеты*\n\n`;
  message += `Страница ${page + 1} из ${totalPages}\n`;
  message += `Всего открытых тикетов: ${tickets.length}\n\n`;

  // Создаём кнопки для каждого тикета на странице
  const ticketButtons = pageTickets.map((ticket) => [
    Markup.button.callback(`${ticket.title}`, `admin_view_ticket_${ticket.getId()}`),
  ]);

  // Создаём кнопки пагинации
  const paginationButtons = [];
  if (page > 0) {
    paginationButtons.push(Markup.button.callback('⬅️', `admin_open_tickets_page_${page - 1}`));
  }
  paginationButtons.push(
    Markup.button.callback(`${page + 1}/${totalPages}`, 'admin_pagination_info'),
  );
  if (page < totalPages - 1) {
    paginationButtons.push(Markup.button.callback('➡️', `admin_open_tickets_page_${page + 1}`));
  }

  // Добавляем кнопку "Назад к админ-панели"
  const backButton = [Markup.button.callback('◀️ Назад к админ-панели', 'admin_panel')];

  const buttons = [...ticketButtons, paginationButtons, backButton];

  const keyboard = Markup.inlineKeyboard(buttons);

  try {
    await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
  } catch (editError) {
    await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
  }
}

/**
 * Обработчик для кнопки информации о пагинации (ничего не делает)
 */
export function createAdminPaginationInfoHandler() {
  return async (ctx: BotContext): Promise<void> => {
    await ctx.answerCbQuery();
  };
}

/**
 * Обработчик для кнопки "Админ-панель"
 */
export function createAdminPanelCallbackHandler() {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      // Проверяем права администратора
      if (!ctx.dbUser.isAdmin()) {
        await ctx.answerCbQuery('❌ Нет прав доступа');
        return;
      }

      await ctx.answerCbQuery();

      const message = `🔐 *Админ-панель*\n\nВыберите действие:`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📂 Открытые тикеты', 'admin_open_tickets')],
        [Markup.button.callback('📋 Мои назначенные', 'admin_assigned_to_me')],
      ]);

      try {
        await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
      } catch (editError) {
        await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'admin_panel',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Обработчик для кнопки "Мои назначенные"
 */
export function createAdminAssignedToMeCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      if (!ctx.dbUser.isAdmin()) {
        await ctx.answerCbQuery('❌ Нет прав доступа');
        return;
      }

      // Получаем все тикеты
      const allTickets = await ticketService.getTicketsByStatus(TicketStatus.OPEN);
      const inProgressTickets = await ticketService.getTicketsByStatus(TicketStatus.IN_PROGRESS);

      // Объединяем и фильтруем тикеты, назначенные текущему админу
      const myTickets = [...allTickets, ...inProgressTickets].filter(
        (ticket) => ticket.assigneeId === ctx.dbUser!.getId(),
      );

      if (myTickets.length === 0) {
        await ctx.answerCbQuery();
        const message = '📋 *Мои назначенные*\n\nУ вас нет назначенных тикетов.';

        const keyboard = Markup.inlineKeyboard([
          [Markup.button.callback('◀️ Назад к админ-панели', 'admin_panel')],
        ]);

        try {
          await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
        } catch (editError) {
          await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
        }
        return;
      }

      // Показываем первую страницу
      await showAssignedToMePage(ctx, myTickets, 0);
      await ctx.answerCbQuery();
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'admin_assigned_to_me',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Показывает страницу с тикетами, назначенными админу
 */
async function showAssignedToMePage(ctx: BotContext, tickets: any[], page: number): Promise<void> {
  const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);
  const startIndex = page * TICKETS_PER_PAGE;
  const endIndex = Math.min(startIndex + TICKETS_PER_PAGE, tickets.length);
  const pageTickets = tickets.slice(startIndex, endIndex);

  let message = `📋 *Мои назначенные*\n\n`;
  message += `Страница ${page + 1} из ${totalPages}\n`;
  message += `Всего назначенных тикетов: ${tickets.length}\n\n`;

  // Создаём кнопки для каждого тикета на странице
  const ticketButtons = pageTickets.map((ticket) => [
    Markup.button.callback(`${ticket.title}`, `admin_view_ticket_${ticket.getId()}`),
  ]);

  // Создаём кнопки пагинации
  const paginationButtons = [];
  if (page > 0) {
    paginationButtons.push(Markup.button.callback('⬅️', `admin_assigned_to_me_page_${page - 1}`));
  }
  paginationButtons.push(
    Markup.button.callback(`${page + 1}/${totalPages}`, 'admin_pagination_info'),
  );
  if (page < totalPages - 1) {
    paginationButtons.push(Markup.button.callback('➡️', `admin_assigned_to_me_page_${page + 1}`));
  }

  // Добавляем кнопку "Назад к админ-панели"
  const backButton = [Markup.button.callback('◀️ Назад к админ-панели', 'admin_panel')];

  const buttons = [...ticketButtons, paginationButtons, backButton];

  const keyboard = Markup.inlineKeyboard(buttons);

  try {
    await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
  } catch (editError) {
    await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
  }
}

/**
 * Обработчик для пагинации тикетов, назначенных админу
 */
export function createAdminAssignedToMePaginationHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      if (!ctx.dbUser.isAdmin()) {
        await ctx.answerCbQuery('❌ Нет прав доступа');
        return;
      }

      // Извлекаем номер страницы из callback_data
      const callbackQuery = ctx.callbackQuery;
      if (!callbackQuery || !('data' in callbackQuery)) {
        return;
      }

      const page = parseInt(callbackQuery.data.split('_').pop() || '0', 10);

      // Получаем все тикеты, назначенные текущему админу
      const allTickets = await ticketService.getTicketsByStatus(TicketStatus.OPEN);
      const inProgressTickets = await ticketService.getTicketsByStatus(TicketStatus.IN_PROGRESS);

      const myTickets = [...allTickets, ...inProgressTickets].filter(
        (ticket) => ticket.assigneeId === ctx.dbUser!.getId(),
      );

      await showAssignedToMePage(ctx, myTickets, page);
      await ctx.answerCbQuery();
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'admin_assigned_to_me_page',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Обработчик для назначения тикета себе
 */
export function createAdminAssignSelfCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      if (!ctx.dbUser.isAdmin()) {
        await ctx.answerCbQuery('❌ Нет прав доступа');
        return;
      }

      // Извлекаем ID тикета из callback_data
      const callbackQuery = ctx.callbackQuery;
      if (!callbackQuery || !('data' in callbackQuery)) {
        return;
      }

      const ticketId = parseInt(callbackQuery.data.split('_').pop() || '0', 10);

      // Назначаем тикет себе
      await ticketService.assignTicket(ticketId, ctx.dbUser.getId(), ctx.dbUser.getId());

      await ctx.answerCbQuery('✅ Тикет назначен вам');

      // Получаем обновленный тикет
      const ticket = await ticketService.getTicketById(ticketId);
      if (!ticket) {
        return;
      }

      // Формируем обновленное сообщение
      const statusEmoji = ticket.isOpen() ? '🆕' : ticket.isInProgress() ? '🔄' : '✅';
      const statusText = ticket.isOpen() ? 'Открыт' : ticket.isInProgress() ? 'В работе' : 'Закрыт';

      let message = `${statusEmoji} *Тикет #${ticket.getId()}*\n\n`;
      message += `📌 *Заголовок:* ${ticket.title}\n`;
      message += `📊 *Статус:* ${statusText}\n`;
      message += `💬 *Сообщений:* ${ticket.getMessageCount()}\n`;

      if (ticket.isAssigned()) {
        message += `👤 *Назначен вам*\n`;
      }

      message += `\n`;

      // Показываем сообщения
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

      // Кнопка возврата
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('◀️ Назад к списку', 'admin_open_tickets')],
      ]);

      try {
        await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
      } catch (editError) {
        await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'admin_assign_self',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Обработчик для кнопки "Ответить на тикет"
 */
export function createAdminReplyTicketCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser || !ctx.session) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      if (!ctx.dbUser.isAdmin()) {
        await ctx.answerCbQuery('❌ Нет прав доступа');
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

      // Проверяем, что тикет назначен текущему админу
      if (ticket.assigneeId !== ctx.dbUser.getId()) {
        await ctx.answerCbQuery('❌ Этот тикет назначен другому администратору');
        return;
      }

      await ctx.answerCbQuery();

      // Устанавливаем режим ответа на тикет
      ctx.session.replyingToTicketId = ticketId;

      const message = `💬 *Ответ на тикет #${ticketId}*\n\n📝 Напишите ваш ответ:`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('❌ Отмена', 'admin_cancel_reply')],
      ]);

      try {
        await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
      } catch (editError) {
        await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'admin_reply_ticket',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Обработчик для отмены ответа на тикет
 */
export function createAdminCancelReplyCallbackHandler() {
  return async (ctx: BotContext): Promise<void> => {
    try {
      if (!ctx.session) {
        return;
      }

      // Очищаем сессию
      delete ctx.session.replyingToTicketId;

      await ctx.answerCbQuery('Ответ отменён');

      const message = `🔐 *Админ-панель*\n\nВыберите действие:`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📂 Открытые тикеты', 'admin_open_tickets')],
        [Markup.button.callback('📋 Мои назначенные', 'admin_assigned_to_me')],
      ]);

      try {
        await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
      } catch (editError) {
        await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
      }
    } catch (error) {
      await ctx.answerCbQuery('❌ Ошибка при отмене');
    }
  };
}

/**
 * Обработчик для закрытия тикета админом
 */
export function createAdminCloseTicketCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      if (!ctx.dbUser.isAdmin()) {
        await ctx.answerCbQuery('❌ Нет прав доступа');
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

      if (ticket.isClosed()) {
        await ctx.answerCbQuery('Тикет уже закрыт');
        return;
      }

      // Закрываем тикет
      await ticketService.closeTicket(ticketId, ctx.dbUser.getId());

      await ctx.answerCbQuery('✅ Тикет закрыт');

      const message = `✅ *Тикет #${ticketId} закрыт*\n\n📌 *${ticket.title}*\n\nТикет успешно закрыт.`;

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('◀️ К моим назначенным', 'admin_assigned_to_me')],
      ]);

      try {
        await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
      } catch (editError) {
        await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'admin_close_ticket',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}

/**
 * Обработчик для просмотра тикета из админ-панели
 */
export function createAdminViewTicketCallbackHandler(ticketService: TicketService) {
  return async (ctx: BotContext): Promise<void> => {
    const errorHandler = getErrorHandler();

    try {
      if (!ctx.dbUser) {
        await ctx.answerCbQuery('❌ Пользователь не найден');
        return;
      }

      if (!ctx.dbUser.isAdmin()) {
        await ctx.answerCbQuery('❌ Нет прав доступа');
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

      await ctx.answerCbQuery();

      // Формируем информацию о тикете
      const statusEmoji = ticket.isOpen() ? '🆕' : ticket.isInProgress() ? '🔄' : '✅';
      const statusText = ticket.isOpen() ? 'Открыт' : ticket.isInProgress() ? 'В работе' : 'Закрыт';

      let message = `${statusEmoji} *Тикет #${ticket.getId()}*\n\n`;
      message += `📌 *Заголовок:* ${ticket.title}\n`;
      message += `📊 *Статус:* ${statusText}\n`;
      message += `💬 *Сообщений:* ${ticket.getMessageCount()}\n`;

      if (ticket.isAssigned()) {
        message += `👤 *Назначен исполнителю*\n`;
      }

      message += `\n`;

      // Показываем сообщения
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

      // Создаём кнопки действий
      const buttons = [];

      // Если тикет назначен текущему админу, показываем кнопку "Ответить"
      if (ticket.assigneeId === ctx.dbUser.getId() && !ticket.isClosed()) {
        buttons.push([
          Markup.button.callback('💬 Ответить на тикет', `admin_reply_ticket_${ticketId}`),
        ]);
        buttons.push([
          Markup.button.callback('✅ Закрыть тикет', `admin_close_ticket_${ticketId}`),
        ]);
      } else if (ticket.isOpen() || ticket.isInProgress()) {
        // Если не назначен, показываем кнопку "Назначить себе"
        buttons.push([
          Markup.button.callback('👤 Назначить себе', `admin_assign_self_${ticketId}`),
        ]);
      }

      buttons.push([Markup.button.callback('◀️ Назад к списку', 'admin_open_tickets')]);

      const keyboard = Markup.inlineKeyboard(buttons);

      try {
        await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
      } catch (editError) {
        await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
      }
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        callback: 'admin_view_ticket',
        userId: ctx.from?.id,
      });
      await ctx.answerCbQuery(message);
    }
  };
}
