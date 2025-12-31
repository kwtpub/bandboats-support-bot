"use strict";
/**
 * @file error.middleware.ts
 * @brief Middleware для обработки ошибок.
 *
 * Централизованная обработка всех ошибок в боте.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorMiddleware = createErrorMiddleware;
const errors_1 = require("../../../infrastructure/errors");
/**
 * Создаёт middleware для обработки ошибок
 */
function createErrorMiddleware() {
    const errorHandler = (0, errors_1.getErrorHandler)();
    return async (ctx, next) => {
        try {
            await next();
        }
        catch (error) {
            console.error('[Bot] Error in middleware chain:', error);
            const message = errorHandler.handle(error, {
                userId: ctx.from?.id,
                chatId: ctx.chat?.id,
                updateType: ctx.updateType,
            });
            try {
                await ctx.reply(message);
            }
            catch (replyError) {
                console.error('[Bot] Failed to send error message:', replyError);
            }
        }
    };
}
//# sourceMappingURL=error.middleware.js.map