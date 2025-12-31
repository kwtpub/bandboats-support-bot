/**
 * @file types.ts
 * @brief Типы для Telegram бота.
 *
 * Определяет типы контекста и расширения для Telegraf.
 */

import { Context } from 'telegraf';
import { User } from '../../domain/entities/User/user.entity';

/**
 * Расширенный контекст бота с пользователем из БД
 */
export interface BotContext extends Context {
  /**
   * Пользователь из базы данных
   */
  dbUser?: User;
}
