/**
 * @file admin.middleware.ts
 * @brief Middleware для проверки прав администратора.
 *
 * Проверяет, что пользователь имеет роль ADMIN.
 */
import { BotContext } from '../types';
/**
 * Middleware для проверки прав администратора
 */
export declare function createAdminMiddleware(): (ctx: BotContext, next: () => Promise<void>) => Promise<void>;
//# sourceMappingURL=admin.middleware.d.ts.map