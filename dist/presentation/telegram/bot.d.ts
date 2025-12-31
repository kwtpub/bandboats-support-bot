/**
 * @file bot.ts
 * @brief Инициализация и настройка Telegram бота.
 *
 * Создаёт экземпляр бота, регистрирует команды и middleware.
 */
import { Telegraf } from 'telegraf';
import { BotContext } from './types';
import { UserService } from '../../domain/services/UserService/user.service';
import { TicketService } from '../../domain/services/TicketService/ticket.service';
/**
 * Создаёт и настраивает Telegram бота
 */
export declare function createBot(token: string, userService: UserService, ticketService: TicketService): Telegraf<BotContext>;
/**
 * Запускает бота
 */
export declare function startBot(bot: Telegraf<BotContext>): Promise<void>;
//# sourceMappingURL=bot.d.ts.map