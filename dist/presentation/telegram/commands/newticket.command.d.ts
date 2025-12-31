/**
 * @file newticket.command.ts
 * @brief Обработчик команды /newticket.
 *
 * Запускает процесс создания нового тикета.
 */
import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
/**
 * Обработчик команды /newticket
 */
export declare function createNewTicketCommand(ticketService: TicketService): (ctx: BotContext) => Promise<void>;
/**
 * Обработчик отмены создания тикета
 */
export declare function createCancelCommand(): (ctx: BotContext) => Promise<void>;
/**
 * Обработчик текстовых сообщений для создания тикета
 */
export declare function createTicketMessageHandler(ticketService: TicketService): (ctx: BotContext) => Promise<void>;
//# sourceMappingURL=newticket.command.d.ts.map