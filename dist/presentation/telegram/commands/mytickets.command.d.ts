/**
 * @file mytickets.command.ts
 * @brief Обработчик команды /mytickets.
 *
 * Показывает список тикетов пользователя.
 */
import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
/**
 * Обработчик команды /mytickets
 */
export declare function createMyTicketsCommand(ticketService: TicketService): (ctx: BotContext) => Promise<void>;
//# sourceMappingURL=mytickets.command.d.ts.map