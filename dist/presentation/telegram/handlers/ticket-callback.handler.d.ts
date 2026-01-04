/**
 * @file ticket-callback.handler.ts
 * @brief Обработчик callback-запросов для тикетов.
 *
 * Обрабатывает нажатия на inline-кнопки связанные с тикетами.
 */
import { BotContext } from '../types';
import { TicketService } from '../../../domain/services/TicketService/ticket.service';
/**
 * Обработчик callback для просмотра тикета
 */
export declare function createViewTicketCallbackHandler(ticketService: TicketService): (ctx: BotContext) => Promise<void>;
//# sourceMappingURL=ticket-callback.handler.d.ts.map