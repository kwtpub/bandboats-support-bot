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
/**
 * Создаёт и настраивает Telegram бота
 */
function createBot(token, userService, ticketService) {
    const bot = new telegraf_1.Telegraf(token);
    const errorHandler = (0, errors_1.getErrorHandler)();
    // Middleware для загрузки пользователя из БД
    bot.use(async (ctx, next) => {
        try {
            if (ctx.from) {
                const telegramId = ctx.from.id.toString();
                const user = await userService.getUserByTelegramId(telegramId);
                if (user) {
                    ctx.dbUser = user;
                }
            }
            await next();
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                middleware: 'userLoader',
                userId: ctx.from?.id,
            });
            await ctx.reply(message);
        }
    });
    // Регистрация команд
    bot.command('start', (0, commands_1.createStartCommand)(userService));
    bot.command('help', (0, commands_1.createHelpCommand)());
    bot.command('mytickets', (0, commands_1.createMyTicketsCommand)(ticketService));
    bot.command('newticket', (0, commands_1.createNewTicketCommand)(ticketService));
    bot.command('cancel', (0, commands_1.createCancelCommand)());
    bot.command('ticket', (0, commands_1.createTicketCommand)(ticketService));
    // Обработчик текстовых сообщений (для создания тикетов)
    bot.on('text', (0, commands_1.createTicketMessageHandler)(ticketService));
    // Глобальный обработчик ошибок
    bot.catch((error, ctx) => {
        console.error('Bot error:', error);
        const message = errorHandler.handle(error instanceof Error ? error : new Error(String(error)), { userId: ctx.from?.id });
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