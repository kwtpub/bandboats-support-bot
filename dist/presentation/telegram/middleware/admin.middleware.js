"use strict";
/**
 * @file admin.middleware.ts
 * @brief Middleware для проверки прав администратора.
 *
 * Проверяет, что пользователь имеет роль ADMIN.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminMiddleware = createAdminMiddleware;
/**
 * Middleware для проверки прав администратора
 */
function createAdminMiddleware() {
    return async (ctx, next) => {
        if (!ctx.dbUser) {
            await ctx.reply('❌ Пользователь не найден. Используйте /start');
            return;
        }
        if (!ctx.dbUser.isAdmin()) {
            await ctx.reply('⛔️ Эта команда доступна только администраторам.');
            return;
        }
        await next();
    };
}
//# sourceMappingURL=admin.middleware.js.map