"use strict";
/**
 * @file ticket-callback.handler.ts
 * @brief Обработчик callback-запросов для тикетов.
 *
 * Обрабатывает нажатия на inline-кнопки связанные с тикетами.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViewTicketCallbackHandler = createViewTicketCallbackHandler;
const errors_1 = require("../../../infrastructure/errors");
const ticket_entity_1 = require("../../../domain/entities/Ticket/ticket.entity");
const telegraf_1 = require("telegraf");
/**
 * Получает эмодзи для статуса тикета
 */
function getStatusEmoji(status) {
    switch (status) {
        case ticket_entity_1.TicketStatus.OPEN:
            return '🆕';
        case ticket_entity_1.TicketStatus.IN_PROGRESS:
            return '🔄';
        case ticket_entity_1.TicketStatus.CLOSE:
            return '✅';
        default:
            return '❓';
    }
}
/**
 * Получает текстовое представление статуса
 */
function getStatusText(status) {
    switch (status) {
        case ticket_entity_1.TicketStatus.OPEN:
            return 'Открыт';
        case ticket_entity_1.TicketStatus.IN_PROGRESS:
            return 'В работе';
        case ticket_entity_1.TicketStatus.CLOSE:
            return 'Закрыт';
        default:
            return 'Неизвестно';
    }
}
/**
 * Обработчик callback для просмотра тикета
 */
function createViewTicketCallbackHandler(ticketService) {
    return async (ctx) => {
        const errorHandler = (0, errors_1.getErrorHandler)();
        try {
            if (!ctx.dbUser) {
                await ctx.answerCbQuery('❌ Пользователь не найден');
                return;
            }
            // Извлекаем ID тикета из callback_data
            const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
            const match = callbackData.match(/^view_ticket_(\d+)$/);
            if (!match) {
                await ctx.answerCbQuery('❌ Некорректный запрос');
                return;
            }
            const ticketId = parseInt(match[1], 10);
            // Получаем тикет
            const ticket = await ticketService.getTicketById(ticketId);
            if (!ticket) {
                await ctx.answerCbQuery(`❌ Тикет #${ticketId} не найден`);
                return;
            }
            // Проверяем права доступа
            const canView = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
            if (!canView) {
                await ctx.answerCbQuery('⛔️ У вас нет доступа к этому тикету');
                return;
            }
            // Формируем информацию о тикете
            const statusEmoji = getStatusEmoji(ticket.status);
            const statusText = getStatusText(ticket.status);
            let message = `${statusEmoji} *Тикет #${ticket.id}*\n\n`;
            message += `📝 *Заголовок:* ${ticket.title}\n`;
            message += `📊 *Статус:* ${statusText}\n`;
            message += `👤 *Автор:* ID ${ticket.authorId}\n`;
            if (ticket.isAssigned()) {
                message += `🔧 *Исполнитель:* ID ${ticket.assigneeId}\n`;
            }
            else {
                message += `🔧 *Исполнитель:* Не назначен\n`;
            }
            const messageCount = ticket.getMessageCount();
            message += `💬 *Сообщений:* ${messageCount}\n\n`;
            // Показываем все сообщения
            if (ticket.messages.length > 0) {
                message += `📝 *Сообщения:*\n\n`;
                ticket.messages.forEach((msg) => {
                    const content = msg.content.length > 100 ? msg.content.substring(0, 100) + '...' : msg.content;
                    const isAuthor = msg.authorId === ticket.authorId;
                    const authorLabel = isAuthor ? '👤 Пользователь' : '👨‍💼 Администратор';
                    message += `${authorLabel}:\n${content}\n\n`;
                });
            }
            // Создаем inline-кнопки для управления тикетом
            const buttons = [];
            if (ticket.isOpen() || ticket.isInProgress()) {
                // Кнопки редактирования (только если тикет не закрыт)
                buttons.push([
                    telegraf_1.Markup.button.callback('✏️ Изменить заголовок', `edit_title_${ticketId}`),
                    telegraf_1.Markup.button.callback('📝 Изменить описание', `edit_description_${ticketId}`),
                ]);
                // Кнопка закрытия тикета
                const canClose = await ticketService.canUserViewTicket(ticketId, ctx.dbUser.getId());
                if (canClose) {
                    buttons.push([telegraf_1.Markup.button.callback('✅ Закрыть тикет', `close_ticket_${ticketId}`)]);
                }
            }
            // Кнопка "Назад"
            buttons.push([telegraf_1.Markup.button.callback('◀️ Назад', 'start_mytickets')]);
            const keyboard = telegraf_1.Markup.inlineKeyboard(buttons);
            // Отвечаем на callback и редактируем сообщение вместо отправки нового
            await ctx.answerCbQuery();
            // Редактируем текущее сообщение вместо отправки нового
            if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
                try {
                    await ctx.editMessageText(message, { parse_mode: 'Markdown', ...keyboard });
                }
                catch (editError) {
                    // Если не удалось отредактировать (например, сообщение слишком старое), отправляем новое
                    await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
                }
            }
            else {
                await ctx.reply(message, { parse_mode: 'Markdown', ...keyboard });
            }
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                handler: 'view_ticket_callback',
                userId: ctx.from?.id,
            });
            await ctx.answerCbQuery('❌ Произошла ошибка');
            await ctx.reply(message);
        }
    };
}
//# sourceMappingURL=ticket-callback.handler.js.map