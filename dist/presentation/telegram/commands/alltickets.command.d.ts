/**
 * @file alltickets.command.ts
 * @brief Обработчик команды /alltickets для администраторов.
 *
 * Показывает список всех тикетов в системе.
 */
import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
/**
 * Обработчик команды /alltickets (только для админов)
 */
export declare function createAllTicketsCommand(ticketService: TicketService): (ctx: BotContext) => Promise<void>;
//# sourceMappingURL=alltickets.command.d.ts.map