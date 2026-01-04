/**
 * @file types.ts
 * @brief Типы для Telegram бота.
 *
 * Определяет типы контекста и расширения для Telegraf.
 */

import { Context } from 'telegraf';
import { User } from '../../domain/entities/User/user.entity';

/**
 * Интерфейс данных сессии
 */
export interface SessionData {
  awaitingTicket?: boolean;
  ticketStep?: 'title' | 'description';
  ticketTitle?: string;
  editingTicketId?: number;
  editingField?: 'title' | 'description';
  replyingToTicketId?: number;
  [key: string]: any;
}

/**
 * Расширенный контекст бота с пользователем из БД
 */
export interface BotContext extends Context {
  /**
   * Пользователь из базы данных
   */
  dbUser?: User;

  /**
   * Данные сессии пользователя
   */
  session?: SessionData;
}
