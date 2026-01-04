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
                // UI для администратора
                welcomeMessage = `
👋 Добро пожаловать в систему поддержки Bandboats!

👑 *Панель администратора*

📊 *Управление тикетами:*
🎫 Все тикеты - /alltickets
🔧 Назначить тикет - /assign <ticket_id> <user_id>
📋 Мои тикеты - /mytickets
🔍 Просмотр тикета - /ticket <ID>

📝 *Работа с тикетами:*
✏️ Создать тикет - /newticket
💬 Ответить в тикет - /reply <ID>
✅ Закрыть тикет - /close <ID>

ℹ️ Помощь - /help
        `.trim();
            }
            else {
                // UI для обычного пользователя
                welcomeMessage = `
👋 Добро пожаловать в систему поддержки Bandboats!

Я бот техподдержки. Здесь вы можете получить помощь по любым вопросам.

*Доступные команды:*

📝 Создать новый тикет - /newticket
📋 Мои тикеты - /mytickets
🔍 Просмотр тикета - /ticket <ID>
💬 Ответить в тикет - /reply <ID>
ℹ️ Помощь - /help

Начните с создания тикета командой /newticket
        `.trim();
            }
            await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
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