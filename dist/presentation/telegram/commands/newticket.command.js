"use strict";
/**
 * @file newticket.command.ts
 * @brief Обработчик команды /newticket.
 *
 * Запускает процесс создания нового тикета.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewTicketCommand = createNewTicketCommand;
exports.createCancelCommand = createCancelCommand;
exports.createTicketMessageHandler = createTicketMessageHandler;
const errors_1 = require("../../../infrastructure/errors");
// Временное хранилище состояний (в будущем заменить на сессии)
const userStates = new Map();
/**
 * Обработчик команды /newticket
 */
function createNewTicketCommand(ticketService) {
    return async (ctx) => {
        const errorHandler = (0, errors_1.getErrorHandler)();
        try {
            if (!ctx.dbUser) {
                await ctx.reply('❌ Пользователь не найден. Используйте /start');
                return;
            }
            const userId = ctx.from.id;
            // Инициализируем состояние создания тикета
            userStates.set(userId, {
                waitingForTitle: true,
                waitingForDescription: false,
            });
            await ctx.reply('📝 *Создание нового тикета*\n\n' +
                'Шаг 1/2: Введите заголовок тикета\n\n' +
                '💡 Заголовок должен кратко описывать вашу проблему\n' +
                '📏 Максимум 200 символов\n\n' +
                'Для отмены используйте /cancel', { parse_mode: 'Markdown' });
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                command: 'newticket',
                userId: ctx.from?.id,
            });
            await ctx.reply(message);
        }
    };
}
/**
 * Обработчик отмены создания тикета
 */
function createCancelCommand() {
    return async (ctx) => {
        const userId = ctx.from?.id;
        if (userId) {
            userStates.delete(userId);
            await ctx.reply('❌ Создание тикета отменено.');
        }
    };
}
/**
 * Обработчик текстовых сообщений для создания тикета
 */
function createTicketMessageHandler(ticketService) {
    return async (ctx) => {
        const errorHandler = (0, errors_1.getErrorHandler)();
        try {
            if (!ctx.dbUser || !ctx.from || !ctx.message || !('text' in ctx.message)) {
                return;
            }
            const userId = ctx.from.id;
            const state = userStates.get(userId);
            if (!state) {
                // Пользователь не в процессе создания тикета
                return;
            }
            const text = ctx.message.text;
            // Шаг 1: Получение заголовка
            if (state.waitingForTitle) {
                if (text.length > 200) {
                    await ctx.reply('⚠️ Заголовок слишком длинный. Максимум 200 символов.\n' +
                        'Попробуйте снова:');
                    return;
                }
                // Сохраняем заголовок и переходим к следующему шагу
                state.title = text;
                state.waitingForTitle = false;
                state.waitingForDescription = true;
                await ctx.reply('📝 *Создание нового тикета*\n\n' +
                    'Шаг 2/2: Опишите вашу проблему подробно\n\n' +
                    '💡 Чем подробнее описание, тем быстрее мы сможем помочь\n' +
                    '📏 Максимум 2000 символов\n\n' +
                    'Для отмены используйте /cancel', { parse_mode: 'Markdown' });
                return;
            }
            // Шаг 2: Получение описания
            if (state.waitingForDescription && state.title) {
                if (text.length > 2000) {
                    await ctx.reply('⚠️ Описание слишком длинное. Максимум 2000 символов.\n' +
                        'Попробуйте снова:');
                    return;
                }
                // Создаём тикет
                const ticket = await ticketService.createTicket(ctx.dbUser.id, state.title, text);
                // Очищаем состояние
                userStates.delete(userId);
                await ctx.reply(`✅ *Тикет успешно создан!*\n\n` +
                    `🆔 ID: #${ticket.id}\n` +
                    `📝 Заголовок: ${ticket.title}\n` +
                    `📊 Статус: Открыт\n\n` +
                    `Мы свяжемся с вами в ближайшее время!\n\n` +
                    `Посмотреть тикет: /ticket ${ticket.id}`, { parse_mode: 'Markdown' });
            }
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                handler: 'ticketMessage',
                userId: ctx.from?.id,
            });
            await ctx.reply(message);
            // Очищаем состояние при ошибке
            if (ctx.from?.id) {
                userStates.delete(ctx.from.id);
            }
        }
    };
}
//# sourceMappingURL=newticket.command.js.map