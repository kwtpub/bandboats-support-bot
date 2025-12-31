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
import { getErrorHandler } from '../../infrastructure/errors';

// Импорт команд
import {
  createStartCommand,
  createHelpCommand,
  createMyTicketsCommand,
  createNewTicketCommand,
  createCancelCommand,
  createTicketMessageHandler,
  createTicketCommand,
} from './commands';

/**
 * Создаёт и настраивает Telegram бота
 */
export function createBot(
  token: string,
  userService: UserService,
  ticketService: TicketService,
): Telegraf<BotContext> {
  const bot = new Telegraf<BotContext>(token);
  const errorHandler = getErrorHandler();

  // Middleware для загрузки пользователя из БД
  bot.use(async (ctx, next) => {
    try {
      if (ctx.from) {
        const telegramId = ctx.from.id.toString();
        const user = await userService.getUserByTelegramId(telegramId);

        if (user) {
          ctx.dbUser = user;
        }
      }

      await next();
    } catch (error) {
      const message = errorHandler.handle(error as Error, {
        middleware: 'userLoader',
        userId: ctx.from?.id,
      });
      await ctx.reply(message);
    }
  });

  // Регистрация команд
  bot.command('start', createStartCommand(userService));
  bot.command('help', createHelpCommand());
  bot.command('mytickets', createMyTicketsCommand(ticketService));
  bot.command('newticket', createNewTicketCommand(ticketService));
  bot.command('cancel', createCancelCommand());
  bot.command('ticket', createTicketCommand(ticketService));

  // Обработчик текстовых сообщений (для создания тикетов)
  bot.on('text', createTicketMessageHandler(ticketService));

  // Глобальный обработчик ошибок
  bot.catch((error, ctx) => {
    console.error('Bot error:', error);
    const message = errorHandler.handle(
      error instanceof Error ? error : new Error(String(error)),
      { userId: ctx.from?.id },
    );
    ctx.reply(message).catch(console.error);
  });

  return bot;
}

/**
 * Запускает бота
 */
export async function startBot(bot: Telegraf<BotContext>): Promise<void> {
  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  // Запуск бота
  await bot.launch();
  console.log('✅ Telegram bot started successfully');
}
