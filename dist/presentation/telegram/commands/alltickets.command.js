"use strict";
/**
 * @file alltickets.command.ts
 * @brief Обработчик команды /alltickets для администраторов.
 *
 * Показывает список всех тикетов в системе.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAllTicketsCommand = createAllTicketsCommand;
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
 * Обработчик команды /alltickets (только для админов)
 */
function createAllTicketsCommand(ticketService) {
    return async (ctx) => {
        const errorHandler = (0, errors_1.getErrorHandler)();
        try {
            if (!ctx.dbUser) {
                await ctx.reply('❌ Пользователь не найден. Используйте /start');
                return;
            }
            // Получаем все тикеты
            const openTickets = await ticketService.getTicketsByStatus(ticket_entity_1.TicketStatus.OPEN);
            const inProgressTickets = await ticketService.getTicketsByStatus(ticket_entity_1.TicketStatus.IN_PROGRESS);
            const closedTickets = await ticketService.getTicketsByStatus(ticket_entity_1.TicketStatus.CLOSE);
            const allTickets = [...openTickets, ...inProgressTickets, ...closedTickets];
            if (allTickets.length === 0) {
                await ctx.reply('📋 В системе пока нет тикетов.');
                return;
            }
            // Формируем сообщение по статусам
            let message = `📋 *Все тикеты в системе:*\n\n`;
            // Открытые тикеты
            if (openTickets.length > 0) {
                message += `🆕 *Открытые (${openTickets.length}):*\n`;
                openTickets.forEach((ticket) => {
                    message += `   #${ticket.getId()} - ${ticket.title}\n`;
                    message += `   👤 Автор: ID ${ticket.authorId} | 💬 ${ticket.getMessageCount()}\n`;
                });
                message += `\n`;
            }
            // В работе
            if (inProgressTickets.length > 0) {
                message += `🔄 *В работе (${inProgressTickets.length}):*\n`;
                inProgressTickets.forEach((ticket) => {
                    message += `   #${ticket.getId()} - ${ticket.title}\n`;
                    message += `   👤 Автор: ID ${ticket.authorId}`;
                    if (ticket.isAssigned()) {
                        message += ` | 🔧 Исполнитель: ID ${ticket.assigneeId}`;
                    }
                    message += ` | 💬 ${ticket.getMessageCount()}\n`;
                });
                message += `\n`;
            }
            // Закрытые (показываем последние 5)
            if (closedTickets.length > 0) {
                const recentClosed = closedTickets.slice(0, 5);
                message += `✅ *Закрытые (показаны ${recentClosed.length} из ${closedTickets.length}):*\n`;
                recentClosed.forEach((ticket) => {
                    message += `   #${ticket.getId()} - ${ticket.title}\n`;
                });
                message += `\n`;
            }
            message += `\n💡 Нажмите на кнопку для просмотра деталей\n`;
            message += `🔧 Назначить исполнителя: /assign <ticket_id> <user_id>`;
            // Создаем inline-кнопки для открытых и активных тикетов
            const activeTickets = [...openTickets, ...inProgressTickets];
            const buttons = activeTickets.map((ticket) => {
                const statusEmoji = getStatusEmoji(ticket.status);
                return [
                    telegraf_1.Markup.button.callback(`${statusEmoji} #${ticket.id} ${ticket.title.substring(0, 25)}${ticket.title.length > 25 ? '...' : ''}`, `view_ticket_${ticket.id}`),
                ];
            });
            await ctx.reply(message, {
                parse_mode: 'Markdown',
                ...(buttons.length > 0 ? telegraf_1.Markup.inlineKeyboard(buttons) : {}),
            });
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                command: 'alltickets',
                userId: ctx.from?.id,
            });
            await ctx.reply(message);
        }
    };
}
//# sourceMappingURL=alltickets.command.js.map