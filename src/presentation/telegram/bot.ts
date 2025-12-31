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

// Импорт middleware
import {
  createAuthMiddleware,
  createLoggingMiddleware,
  createErrorMiddleware,
  createSessionMiddleware,
} from './middleware';

/**
 * Создаёт и настраивает Telegram бота
 */
export function createBot(
  token: string,
  userService: UserService,
  ticketService: TicketService,
): Telegraf<BotContext> {
  const bot = new Telegraf<BotContext>(token);

  // Регистрация middleware (порядок важен!)
  // 1. Логирование - первым для отслеживания всех запросов
  bot.use(createLoggingMiddleware());

  // 2. Обработка ошибок - оборачивает все последующие middleware
  bot.use(createErrorMiddleware());

  // 3. Сессии - для хранения временных данных
  bot.use(createSessionMiddleware());

  // 4. Аутентификация - загрузка пользователя из БД
  bot.use(createAuthMiddleware(userService));

  // Регистрация команд
  bot.command('start', createStartCommand(userService));
  bot.command('help', createHelpCommand());
  bot.command('mytickets', createMyTicketsCommand(ticketService));
  bot.command('newticket', createNewTicketCommand(ticketService));
  bot.command('cancel', createCancelCommand());
  bot.command('ticket', createTicketCommand(ticketService));

  // Обработчик текстовых сообщений (для создания тикетов)
  bot.on('text', createTicketMessageHandler(ticketService));

  // Глобальный обработчик ошибок (для ошибок вне middleware chain)
  bot.catch((error, ctx) => {
    console.error('[Bot] Uncaught error:', error);
    const errorHandler = getErrorHandler();
    const message = errorHandler.handle(error instanceof Error ? error : new Error(String(error)), {
      userId: ctx.from?.id,
      source: 'bot.catch',
    });
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
