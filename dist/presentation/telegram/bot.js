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
// Импорт middleware
const middleware_1 = require("./middleware");
// Импорт обработчиков callback
const handlers_1 = require("./handlers");
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
    bot.command('newticket', (0, commands_1.createNewTicketCommand)(ticketService));
    bot.command('cancel', (0, commands_1.createCancelCommand)());
    bot.command('ticket', (0, commands_1.createTicketCommand)(ticketService));
    // Команды только для администраторов
    bot.command('alltickets', (0, middleware_1.createAdminMiddleware)(), (0, commands_1.createAllTicketsCommand)(ticketService));
    bot.command('assign', (0, middleware_1.createAdminMiddleware)(), (0, commands_1.createAssignCommand)(ticketService));
    // Обработчики callback-запросов
    bot.action(/^view_ticket_\d+$/, (0, handlers_1.createViewTicketCallbackHandler)(ticketService));
    // Обработчик текстовых сообщений (для создания тикетов)
    bot.on('text', (0, commands_1.createTicketMessageHandler)(ticketService));
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