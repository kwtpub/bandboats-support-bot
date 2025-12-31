"use strict";
/**
 * @file mytickets.command.ts
 * @brief Обработчик команды /mytickets.
 *
 * Показывает список тикетов пользователя.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMyTicketsCommand = createMyTicketsCommand;
const errors_1 = require("../../../infrastructure/errors");
const ticket_entity_1 = require("../../../domain/entities/Ticket/ticket.entity");
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
 * Обработчик команды /mytickets
 */
function createMyTicketsCommand(ticketService) {
    return async (ctx) => {
        const errorHandler = (0, errors_1.getErrorHandler)();
        try {
            if (!ctx.dbUser) {
                await ctx.reply('❌ Пользователь не найден. Используйте /start');
                return;
            }
            // Получаем тикеты пользователя
            const tickets = await ticketService.getTicketsByAuthor(ctx.dbUser.id);
            if (tickets.length === 0) {
                await ctx.reply('📋 У вас пока нет тикетов.\n\nСоздайте новый тикет командой /newticket');
                return;
            }
            // Формируем список тикетов
            let message = `📋 *Ваши тикеты (${tickets.length}):*\n\n`;
            tickets.forEach((ticket, index) => {
                const statusEmoji = getStatusEmoji(ticket.status);
                const statusText = getStatusText(ticket.status);
                const messageCount = ticket.getMessageCount();
                message += `${index + 1}. ${statusEmoji} *${ticket.title}*\n`;
                message += `   ID: #${ticket.id} | ${statusText}\n`;
                message += `   💬 Сообщений: ${messageCount}\n`;
                if (ticket.isAssigned()) {
                    message += `   👤 Назначен исполнителю\n`;
                }
                message += `\n`;
            });
            message += `\n💡 Для просмотра деталей тикета используйте: /ticket <ID>`;
            await ctx.reply(message, { parse_mode: 'Markdown' });
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                command: 'mytickets',
                userId: ctx.from?.id,
            });
            await ctx.reply(message);
        }
    };
}
//# sourceMappingURL=mytickets.command.js.map