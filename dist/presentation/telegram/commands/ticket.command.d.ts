/**
 * @file ticket.command.ts
 * @brief Обработчик команды /ticket для просмотра деталей тикета.
 *
 * Показывает подробную информацию о тикете и его сообщения.
 */
import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
/**
 * Обработчик команды /ticket
 */
export declare function createTicketCommand(ticketService: TicketService): (ctx: BotContext) => Promise<void>;
//# sourceMappingURL=ticket.command.d.ts.map