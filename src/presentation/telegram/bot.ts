/**
 * @file bot.ts
 * @brief Инициализация и настройка Telegram бота.
 *
 * Создаёт экземпляр бота, регистрирует команды и middleware.
 */

import { Telegraf } from 'telegraf';
import { BotContext } from './types';
import { UserService } from '../../domain/services/UserService/user.service';
import { TicketService } from '../../domain/services/TicketService/ticket.service';
import { getErrorHandler } from '../../infrastructure/errors';

// Импорт команд
import {
  createStartCommand,
  createHelpCommand,
  createMyTicketsCommand,
  createNewTicketCommand,
  createCancelCommand,
  createTicketMessageHandler,
  createTicketCommand,
  createAllTicketsCommand,
  createAssignCommand,
} from './commands';
import { createAdminCommand } from './commands/admin.command';

// Импорт middleware
import {
  createAuthMiddleware,
  createLoggingMiddleware,
  createErrorMiddleware,
  createSessionMiddleware,
  createAdminMiddleware,
} from './middleware';

// Импорт обработчиков callback
import {
  createViewTicketCallbackHandler,
  createNewTicketCallbackHandler,
  createBackToMenuCallbackHandler,
  createBackToTitleCallbackHandler,
  createMyTicketsCallbackHandler,
  createEditTitleCallbackHandler,
  createEditDescriptionCallbackHandler,
  createCloseTicketCallbackHandler,
} from './handlers';
import {
  createAdminOpenTicketsCallbackHandler,
  createAdminOpenTicketsPaginationHandler,
  createAdminPaginationInfoHandler,
  createAdminPanelCallbackHandler,
  createAdminViewTicketCallbackHandler,
  createAdminAssignSelfCallbackHandler,
  createAdminAssignedToMeCallbackHandler,
  createAdminAssignedToMePaginationHandler,
  createAdminReplyTicketCallbackHandler,
  createAdminCancelReplyCallbackHandler,
  createAdminCloseTicketCallbackHandler,
} from './handlers/admin-callback.handler';
import {
  createUserReplyTicketCallbackHandler,
  createUserCloseTicketCallbackHandler,
  createUserCancelReplyCallbackHandler,
} from './handlers/user-ticket-callback.handler';

/**
 * Создаёт и настраивает Telegram бота
 */
export function createBot(
  token: string,
  userService: UserService,
  ticketService: TicketService,
): Telegraf<BotContext> {
  const bot = new Telegraf<BotContext>(token);

  // Регистрация middleware (порядок важен!)
  // 1. Логирование - первым для отслеживания всех запросов
  bot.use(createLoggingMiddleware());

  // 2. Обработка ошибок - оборачивает все последующие middleware
  bot.use(createErrorMiddleware());

  // 3. Сессии - для хранения временных данных
  bot.use(createSessionMiddleware());

  // 4. Аутентификация - загрузка пользователя из БД
  bot.use(createAuthMiddleware(userService));

  // Регистрация команд
  bot.command('start', createStartCommand(userService));
  bot.command('help', createHelpCommand());
  bot.command('mytickets', createMyTicketsCommand(ticketService));
  bot.command('newticket', createNewTicketCommand(ticketService, userService));
  bot.command('cancel', createCancelCommand());
  bot.command('ticket', createTicketCommand(ticketService));

  // Команды только для администраторов
  bot.command('admin', createAdminCommand());
  bot.command('alltickets', createAdminMiddleware(), createAllTicketsCommand(ticketService));
  bot.command('assign', createAdminMiddleware(), createAssignCommand(ticketService));

  // Обработчики callback-запросов
  bot.action(/^view_ticket_\d+$/, createViewTicketCallbackHandler(ticketService));
  bot.action('start_newticket', createNewTicketCallbackHandler());
  bot.action('start_mytickets', createMyTicketsCallbackHandler(ticketService));
  bot.action('ticket_back_to_menu', createBackToMenuCallbackHandler());
  bot.action('ticket_back_to_title', createBackToTitleCallbackHandler());
  bot.action(/^edit_title_\d+$/, createEditTitleCallbackHandler(ticketService));
  bot.action(/^edit_description_\d+$/, createEditDescriptionCallbackHandler(ticketService));
  bot.action(/^close_ticket_\d+$/, createCloseTicketCallbackHandler(ticketService));

  // Обработчики callback для админ-панели
  bot.action('admin_panel', createAdminPanelCallbackHandler());
  bot.action('admin_open_tickets', createAdminOpenTicketsCallbackHandler(ticketService));
  bot.action(
    /^admin_open_tickets_page_\d+$/,
    createAdminOpenTicketsPaginationHandler(ticketService),
  );
  bot.action('admin_pagination_info', createAdminPaginationInfoHandler());
  bot.action(/^admin_view_ticket_\d+$/, createAdminViewTicketCallbackHandler(ticketService));
  bot.action(/^admin_assign_self_\d+$/, createAdminAssignSelfCallbackHandler(ticketService));
  bot.action('admin_assigned_to_me', createAdminAssignedToMeCallbackHandler(ticketService));
  bot.action(
    /^admin_assigned_to_me_page_\d+$/,
    createAdminAssignedToMePaginationHandler(ticketService),
  );
  bot.action(/^admin_reply_ticket_\d+$/, createAdminReplyTicketCallbackHandler(ticketService));
  bot.action('admin_cancel_reply', createAdminCancelReplyCallbackHandler());
  bot.action(/^admin_close_ticket_\d+$/, createAdminCloseTicketCallbackHandler(ticketService));

  // Обработчики callback для пользователей
  bot.action(/^user_reply_ticket_\d+$/, createUserReplyTicketCallbackHandler(ticketService));
  bot.action(/^user_close_ticket_\d+$/, createUserCloseTicketCallbackHandler(ticketService));
  bot.action('user_cancel_reply', createUserCancelReplyCallbackHandler());

  // Обработчик текстовых сообщений (для сообщения о проблемах)
  bot.on('text', createTicketMessageHandler(ticketService, userService));

  // Глобальный обработчик ошибок (для ошибок вне middleware chain)
  bot.catch((error, ctx) => {
    console.error('[Bot] Uncaught error:', error);
    const errorHandler = getErrorHandler();
    const message = errorHandler.handle(error instanceof Error ? error : new Error(String(error)), {
      userId: ctx.from?.id,
      source: 'bot.catch',
    });
    ctx.reply(message).catch(console.error);
  });

  return bot;
}

/**
 * Запускает бота
 */
export async function startBot(bot: Telegraf<BotContext>): Promise<void> {
  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  // Запуск бота
  await bot.launch();
  console.log('✅ Telegram bot started successfully');
}
