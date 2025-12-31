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
/**
 * Получить сессию пользователя
 */
export declare function getSession(userId: number): SessionData;
/**
 * Очистить сессию пользователя
 */
export declare function clearSession(userId: number): void;
/**
 * Создаёт middleware для сессий
 */
export declare function createSessionMiddleware(): Middleware<SessionContext>;
//# sourceMappingURL=session.middleware.d.ts.map