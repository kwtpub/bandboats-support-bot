"use strict";
/**
 * @file auth.middleware.ts
 * @brief Middleware для аутентификации пользователей.
 *
 * Проверяет наличие пользователя в БД и загружает его в контекст.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthMiddleware = createAuthMiddleware;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const errors_1 = require("../../../infrastructure/errors");
/**
 * Создаёт middleware для загрузки пользователя
 */
function createAuthMiddleware(userService) {
    return async (ctx, next) => {
        const errorHandler = (0, errors_1.getErrorHandler)();
        try {
            if (!ctx.from) {
                await next();
                return;
            }
            const telegramId = ctx.from.id.toString();
            const user = await userService.getUserByTelegramId(telegramId);
            if (user) {
                ctx.dbUser = user;
            }
            await next();
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                middleware: 'auth',
                userId: ctx.from?.id,
            });
            await ctx.reply(message);
        }
    };
}
/**
 * Middleware, требующий авторизации
 */
function requireAuth() {
    return async (ctx, next) => {
        if (!ctx.dbUser) {
            await ctx.reply('⚠️ Вы не авторизованы.\n\n' +
                'Используйте команду /start для регистрации.');
            return;
        }
        await next();
    };
}
/**
 * Middleware, требующий роль администратора
 */
function requireAdmin() {
    return async (ctx, next) => {
        if (!ctx.dbUser) {
            await ctx.reply('⚠️ Вы не авторизованы. Используйте /start');
            return;
        }
        if (!ctx.dbUser.isAdmin()) {
            await ctx.reply('⛔️ Эта команда доступна только администраторам.');
            return;
        }
        await next();
    };
}
//# sourceMappingURL=auth.middleware.js.map