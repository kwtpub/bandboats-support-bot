"use strict";
/**
 * @file bot.ts
 * @brief Инициализация и настройка Telegram бота.
 *
 * Создаёт экземпляр бота, регистрирует команды и middleware.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = createBot;
exports.startBot = startBot;
const telegraf_1 = require("telegraf");
const errors_1 = require("../../infrastructure/errors");
// Импорт команд
const commands_1 = require("./commands");
const admin_command_1 = require("./commands/admin.command");
// Импорт middleware
const middleware_1 = require("./middleware");
// Импорт обработчиков callback
const handlers_1 = require("./handlers");
const admin_callback_handler_1 = require("./handlers/admin-callback.handler");
const user_ticket_callback_handler_1 = require("./handlers/user-ticket-callback.handler");
/**
 * Создаёт и настраивает Telegram бота
 */
function createBot(token, userService, ticketService) {
    const bot = new telegraf_1.Telegraf(token);
    // Регистрация middleware (порядок важен!)
    // 1. Логирование - первым для отслеживания всех запросов
    bot.use((0, middleware_1.createLoggingMiddleware)());
    // 2. Обработка ошибок - оборачивает все последующие middleware
    bot.use((0, middleware_1.createErrorMiddleware)());
    // 3. Сессии - для хранения временных данных
    bot.use((0, middleware_1.createSessionMiddleware)());
    // 4. Аутентификация - загрузка пользователя из БД
    bot.use((0, middleware_1.createAuthMiddleware)(userService));
    // Регистрация команд
    bot.command('start', (0, commands_1.createStartCommand)(userService));
    bot.command('help', (0, commands_1.createHelpCommand)());
    bot.command('mytickets', (0, commands_1.createMyTicketsCommand)(ticketService));
    bot.command('newticket', (0, commands_1.createNewTicketCommand)(ticketService, userService));
    bot.command('cancel', (0, commands_1.createCancelCommand)());
    bot.command('ticket', (0, commands_1.createTicketCommand)(ticketService));
    // Команды только для администраторов
    bot.command('admin', (0, admin_command_1.createAdminCommand)());
    bot.command('alltickets', (0, middleware_1.createAdminMiddleware)(), (0, commands_1.createAllTicketsCommand)(ticketService));
    bot.command('assign', (0, middleware_1.createAdminMiddleware)(), (0, commands_1.createAssignCommand)(ticketService));
    // Обработчики callback-запросов
    bot.action(/^view_ticket_\d+$/, (0, handlers_1.createViewTicketCallbackHandler)(ticketService));
    bot.action('start_newticket', (0, handlers_1.createNewTicketCallbackHandler)());
    bot.action('start_mytickets', (0, handlers_1.createMyTicketsCallbackHandler)(ticketService));
    bot.action('ticket_back_to_menu', (0, handlers_1.createBackToMenuCallbackHandler)());
    bot.action('ticket_back_to_title', (0, handlers_1.createBackToTitleCallbackHandler)());
    bot.action(/^edit_title_\d+$/, (0, handlers_1.createEditTitleCallbackHandler)(ticketService));
    bot.action(/^edit_description_\d+$/, (0, handlers_1.createEditDescriptionCallbackHandler)(ticketService));
    bot.action(/^close_ticket_\d+$/, (0, handlers_1.createCloseTicketCallbackHandler)(ticketService));
    // Обработчики callback для админ-панели
    bot.action('admin_panel', (0, admin_callback_handler_1.createAdminPanelCallbackHandler)());
    bot.action('admin_open_tickets', (0, admin_callback_handler_1.createAdminOpenTicketsCallbackHandler)(ticketService));
    bot.action(/^admin_open_tickets_page_\d+$/, (0, admin_callback_handler_1.createAdminOpenTicketsPaginationHandler)(ticketService));
    bot.action('admin_pagination_info', (0, admin_callback_handler_1.createAdminPaginationInfoHandler)());
    bot.action(/^admin_view_ticket_\d+$/, (0, admin_callback_handler_1.createAdminViewTicketCallbackHandler)(ticketService));
    bot.action(/^admin_assign_self_\d+$/, (0, admin_callback_handler_1.createAdminAssignSelfCallbackHandler)(ticketService));
    bot.action('admin_assigned_to_me', (0, admin_callback_handler_1.createAdminAssignedToMeCallbackHandler)(ticketService));
    bot.action(/^admin_assigned_to_me_page_\d+$/, (0, admin_callback_handler_1.createAdminAssignedToMePaginationHandler)(ticketService));
    bot.action(/^admin_reply_ticket_\d+$/, (0, admin_callback_handler_1.createAdminReplyTicketCallbackHandler)(ticketService));
    bot.action('admin_cancel_reply', (0, admin_callback_handler_1.createAdminCancelReplyCallbackHandler)());
    bot.action(/^admin_close_ticket_\d+$/, (0, admin_callback_handler_1.createAdminCloseTicketCallbackHandler)(ticketService));
    // Обработчики callback для пользователей
    bot.action(/^user_reply_ticket_\d+$/, (0, user_ticket_callback_handler_1.createUserReplyTicketCallbackHandler)(ticketService));
    bot.action(/^user_close_ticket_\d+$/, (0, user_ticket_callback_handler_1.createUserCloseTicketCallbackHandler)(ticketService));
    bot.action('user_cancel_reply', (0, user_ticket_callback_handler_1.createUserCancelReplyCallbackHandler)());
    // Обработчик текстовых сообщений (для создания тикетов)
    bot.on('text', (0, commands_1.createTicketMessageHandler)(ticketService, userService));
    // Глобальный обработчик ошибок (для ошибок вне middleware chain)
    bot.catch((error, ctx) => {
        console.error('[Bot] Uncaught error:', error);
        const errorHandler = (0, errors_1.getErrorHandler)();
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
async function startBot(bot) {
    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
    // Запуск бота
    await bot.launch();
    console.log('✅ Telegram bot started successfully');
}
//# sourceMappingURL=bot.js.map