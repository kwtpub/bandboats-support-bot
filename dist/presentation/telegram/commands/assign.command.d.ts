/**
 * @file assign.command.ts
 * @brief Обработчик команды /assign для назначения тикета исполнителю.
 *
 * Позволяет администраторам назначать тикеты пользователям.
 */
import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
/**
 * Обработчик команды /assign <ticket_id> <user_id> (только для админов)
 */
export declare function createAssignCommand(ticketService: TicketService): (ctx: BotContext) => Promise<void>;
//# sourceMappingURL=assign.command.d.ts.map