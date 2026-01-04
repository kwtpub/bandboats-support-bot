"use strict";
/**
 * @file start.command.ts
 * @brief Обработчик команды /start.
 *
 * Приветствует пользователя и регистрирует его в системе.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStartCommand = createStartCommand;
const errors_1 = require("../../../infrastructure/errors");
const telegraf_1 = require("telegraf");
/**
 * Обработчик команды /start
 */
function createStartCommand(userService) {
    return async (ctx) => {
        const errorHandler = (0, errors_1.getErrorHandler)();
        try {
            const telegramUser = ctx.from;
            if (!telegramUser) {
                await ctx.reply('❌ Не удалось получить информацию о пользователе.');
                return;
            }
            // Получаем или создаём пользователя в БД
            const dbUser = await userService.getOrCreateUser(telegramUser.id.toString(), telegramUser.first_name || telegramUser.username || 'Пользователь');
            // Сохраняем пользователя в контексте
            ctx.dbUser = dbUser;
            // Формируем приветственное сообщение в зависимости от роли
            let welcomeMessage;
            if (dbUser.isAdmin()) {
                // UI для администратора - сразу админ-панель
                welcomeMessage = `🔐 *Админ-панель*\n\nВыберите действие:`;
            }
            else {
                // UI для обычного пользователя
                welcomeMessage = `
👋 Добро пожаловать в систему поддержки Bandboats!

Я бот техподдержки. Здесь вы можете получить помощь по любым вопросам.

Используйте кнопку ниже для создания тикета:
        `.trim();
            }
            // Создаем inline-кнопки
            let keyboard;
            if (dbUser.isAdmin()) {
                keyboard = telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('📂 Открытые тикеты', 'admin_open_tickets')],
                    [telegraf_1.Markup.button.callback('📋 Мои назначенные', 'admin_assigned_to_me')],
                ]);
            }
            else {
                keyboard = telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('📝 Новый тикет', 'start_newticket')],
                    [telegraf_1.Markup.button.callback('📋 Мои тикеты', 'start_mytickets')],
                ]);
            }
            await ctx.reply(welcomeMessage, { parse_mode: 'Markdown', ...keyboard });
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                command: 'start',
                userId: ctx.from?.id,
            });
            await ctx.reply(message);
        }
    };
}
//# sourceMappingURL=start.command.js.map