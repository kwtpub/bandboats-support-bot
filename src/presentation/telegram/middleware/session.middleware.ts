/**
 * @file session.middleware.ts
 * @brief Middleware для управления сессиями пользователей.
 *
 * Простое хранилище сессий в памяти для временных данных.
 */

import { Middleware } from 'telegraf';
import { BotContext } from '../types';

/**
 * Интерфейс данных сессии
 */
export interface SessionData {
  [key: string]: any;
}

/**
 * Расширенный контекст с сессией
 */
export interface SessionContext extends BotContext {
  session?: SessionData;
}

// Хранилище сессий в памяти
const sessions = new Map<number, SessionData>();

/**
 * Получить сессию пользователя
 */
export function getSession(userId: number): SessionData {
  if (!sessions.has(userId)) {
    sessions.set(userId, {});
  }
  return sessions.get(userId)!;
}

/**
 * Очистить сессию пользователя
 */
export function clearSession(userId: number): void {
  sessions.delete(userId);
}

/**
 * Создаёт middleware для сессий
 */
export function createSessionMiddleware(): Middleware<SessionContext> {
  return async (ctx, next) => {
    if (ctx.from) {
      ctx.session = getSession(ctx.from.id);
    }

    await next();
  };
}
