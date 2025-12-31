"use strict";
/**
 * @file session.middleware.ts
 * @brief Middleware для управления сессиями пользователей.
 *
 * Простое хранилище сессий в памяти для временных данных.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = getSession;
exports.clearSession = clearSession;
exports.createSessionMiddleware = createSessionMiddleware;
// Хранилище сессий в памяти
const sessions = new Map();
/**
 * Получить сессию пользователя
 */
function getSession(userId) {
    if (!sessions.has(userId)) {
        sessions.set(userId, {});
    }
    return sessions.get(userId);
}
/**
 * Очистить сессию пользователя
 */
function clearSession(userId) {
    sessions.delete(userId);
}
/**
 * Создаёт middleware для сессий
 */
function createSessionMiddleware() {
    return async (ctx, next) => {
        if (ctx.from) {
            ctx.session = getSession(ctx.from.id);
        }
        await next();
    };
}
//# sourceMappingURL=session.middleware.js.map