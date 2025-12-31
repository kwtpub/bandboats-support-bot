/**
 * @file auth.middleware.ts
 * @brief Middleware для аутентификации пользователей.
 *
 * Проверяет наличие пользователя в БД и загружает его в контекст.
 */
import { Middleware } from 'telegraf';
import { BotContext } from '../types';
import { UserService } from '../../../domain/services/UserService/user.service';
/**
 * Создаёт middleware для загрузки пользователя
 */
export declare function createAuthMiddleware(userService: UserService): Middleware<BotContext>;
/**
 * Middleware, требующий авторизации
 */
export declare function requireAuth(): Middleware<BotContext>;
/**
 * Middleware, требующий роль администратора
 */
export declare function requireAdmin(): Middleware<BotContext>;
//# sourceMappingURL=auth.middleware.d.ts.map