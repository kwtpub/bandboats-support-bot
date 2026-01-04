"use strict";
/**
 * @file newticket.command.ts
 * @brief Обработчик команды /newticket.
 *
 * Запускает процесс создания нового тикета.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewTicketCommand = createNewTicketCommand;
exports.createCancelCommand = createCancelCommand;
exports.createTicketMessageHandler = createTicketMessageHandler;
const errors_1 = require("../../../infrastructure/errors");
const telegraf_1 = require("telegraf");
/**
 * Обработчик команды /newticket
 */
function createNewTicketCommand(ticketService, userService) {
    return async (ctx) => {
        const errorHandler = (0, errors_1.getErrorHandler)();
        try {
            if (!ctx.dbUser) {
                await ctx.reply('❌ Пользователь не найден. Используйте /start');
                return;
            }
            // Инициализируем состояние создания тикета в сессии
            if (ctx.session) {
                ctx.session.awaitingTicket = true;
                ctx.session.ticketStep = 'title';
                ctx.session.ticketTitle = undefined;
            }
            const backButton = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('◀️ Назад', 'ticket_back_to_menu')],
            ]);
            await ctx.reply('📝 *Создание нового тикета*\n\nШаг 1 из 2: Введите заголовок тикета', {
                parse_mode: 'Markdown',
                ...backButton,
            });
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                command: 'newticket',
                userId: ctx.from?.id,
            });
            await ctx.reply(message);
        }
    };
}
/**
 * Обработчик отмены создания тикета
 */
function createCancelCommand() {
    return async (ctx) => {
        if (ctx.session) {
            ctx.session.awaitingTicket = false;
            ctx.session.ticketStep = undefined;
            ctx.session.ticketTitle = undefined;
        }
        await ctx.reply('❌ Создание тикета отменено.');
    };
}
/**
 * Обработчик текстовых сообщений для создания тикета
 */
function createTicketMessageHandler(ticketService, userService) {
    return async (ctx) => {
        const errorHandler = (0, errors_1.getErrorHandler)();
        try {
            if (!ctx.dbUser || !ctx.from || !ctx.message || !('text' in ctx.message) || !ctx.session) {
                return;
            }
            const text = ctx.message.text;
            // Проверяем, отвечает ли пользователь или админ на тикет
            if (ctx.session.replyingToTicketId) {
                const ticketId = ctx.session.replyingToTicketId;
                if (text.length > 2000) {
                    await ctx.reply('⚠️ Сообщение слишком длинное. Максимум 2000 символов.\nПопробуйте снова:');
                    return;
                }
                // Добавляем сообщение к тикету
                const ticket = await ticketService.addMessageToTicket(ticketId, ctx.dbUser.getId(), text);
                // Очищаем сессию
                delete ctx.session.replyingToTicketId;
                delete ctx.session.awaitingTicket;
                delete ctx.session.ticketStep;
                const messageCount = ticket.getMessageCount();
                const isAdmin = ctx.dbUser.isAdmin();
                // Если отвечает админ - уведомляем автора тикета
                if (isAdmin && ticket.authorId !== ctx.dbUser.getId()) {
                    const notificationText = `📬 *Новый ответ на ваш тикет #${ticketId}*\n\n📌 *${ticket.title}*\n\n💬 *Ответ ${messageCount}:*\n${text}`;
                    try {
                        if (userService) {
                            const author = await userService.getUserById(ticket.authorId);
                            if (author) {
                                const keyboard = telegraf_1.Markup.inlineKeyboard([
                                    [telegraf_1.Markup.button.callback('💬 Ответить', `user_reply_ticket_${ticketId}`)],
                                    [telegraf_1.Markup.button.callback('✅ Закрыть тикет', `user_close_ticket_${ticketId}`)],
                                ]);
                                await ctx.telegram.sendMessage(author.telegramId, notificationText, {
                                    parse_mode: 'Markdown',
                                    ...keyboard,
                                });
                            }
                        }
                    }
                    catch (error) {
                        console.error('Failed to send notification to ticket author:', error);
                    }
                    await ctx.reply(`✅ Ответ добавлен к тикету #${ticketId}!`, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('👁️ Посмотреть тикет', `admin_view_ticket_${ticketId}`)],
                        [telegraf_1.Markup.button.callback('◀️ К моим назначенным', 'admin_assigned_to_me')],
                    ]));
                }
                // Если отвечает пользователь - уведомляем админа (assignee)
                else {
                    if (ticket.assigneeId && userService) {
                        const notificationText = `📬 *Новое сообщение в тикете #${ticketId}*\n\n📌 *${ticket.title}*\n\n💬 *Сообщение ${messageCount}:*\n${text}`;
                        try {
                            const assignee = await userService.getUserById(ticket.assigneeId);
                            if (assignee) {
                                const keyboard = telegraf_1.Markup.inlineKeyboard([
                                    [telegraf_1.Markup.button.callback('💬 Ответить', `admin_reply_ticket_${ticketId}`)],
                                    [telegraf_1.Markup.button.callback('👁️ Посмотреть', `admin_view_ticket_${ticketId}`)],
                                ]);
                                await ctx.telegram.sendMessage(assignee.telegramId, notificationText, {
                                    parse_mode: 'Markdown',
                                    ...keyboard,
                                });
                            }
                        }
                        catch (error) {
                            console.error('Failed to send notification to assignee:', error);
                        }
                    }
                    await ctx.reply(`✅ Сообщение добавлено к тикету #${ticketId}!`, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('👁️ Посмотреть тикет', `view_ticket_${ticketId}`)],
                    ]));
                }
                return;
            }
            // Проверяем, редактирует ли пользователь тикет
            if (ctx.session.editingTicketId && ctx.session.editingField) {
                const ticketId = ctx.session.editingTicketId;
                const field = ctx.session.editingField;
                if (field === 'title') {
                    if (text.length > 200) {
                        await ctx.reply('⚠️ Заголовок слишком длинный. Максимум 200 символов.\nПопробуйте снова:');
                        return;
                    }
                    // Обновляем заголовок тикета
                    await ticketService.updateTicketTitle(ticketId, text, ctx.dbUser.getId());
                    ctx.session.editingTicketId = undefined;
                    ctx.session.editingField = undefined;
                    await ctx.reply(`✅ Заголовок тикета #${ticketId} успешно изменен!`, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('👁️ Посмотреть тикет', `view_ticket_${ticketId}`)],
                    ]));
                    return;
                }
                else if (field === 'description') {
                    if (text.length > 2000) {
                        await ctx.reply('⚠️ Описание слишком длинное. Максимум 2000 символов.\nПопробуйте снова:');
                        return;
                    }
                    // Обновляем описание тикета
                    await ticketService.updateTicketDescription(ticketId, text, ctx.dbUser.getId());
                    ctx.session.editingTicketId = undefined;
                    ctx.session.editingField = undefined;
                    await ctx.reply(`✅ Описание тикета #${ticketId} успешно изменено!`, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback('👁️ Посмотреть тикет', `view_ticket_${ticketId}`)],
                    ]));
                    return;
                }
            }
            // Проверяем, находится ли пользователь в процессе создания тикета
            if (!ctx.session.awaitingTicket) {
                return;
            }
            const backButton = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('◀️ Назад', 'ticket_back_to_title')],
            ]);
            const backToMenuButton = telegraf_1.Markup.inlineKeyboard([
                [telegraf_1.Markup.button.callback('◀️ Назад', 'ticket_back_to_menu')],
            ]);
            // Шаг 1: Получение заголовка
            if (ctx.session.ticketStep === 'title') {
                if (text.length > 200) {
                    await ctx.reply('⚠️ Заголовок слишком длинный. Максимум 200 символов.\nПопробуйте снова:');
                    return;
                }
                // Сохраняем заголовок и переходим к следующему шагу
                ctx.session.ticketTitle = text;
                ctx.session.ticketStep = 'description';
                await ctx.reply('📝 *Создание нового тикета*\n\nШаг 2 из 2: Введите описание проблемы', {
                    parse_mode: 'Markdown',
                    ...backButton,
                });
                return;
            }
            // Шаг 2: Получение описания
            if (ctx.session.ticketStep === 'description' && ctx.session.ticketTitle) {
                if (text.length > 2000) {
                    await ctx.reply('⚠️ Описание слишком длинное. Максимум 2000 символов.\nПопробуйте снова:');
                    return;
                }
                // Создаём тикет
                const ticket = await ticketService.createTicket(ctx.dbUser.getId(), ctx.session.ticketTitle, text);
                // Очищаем состояние
                ctx.session.awaitingTicket = false;
                ctx.session.ticketStep = undefined;
                ctx.session.ticketTitle = undefined;
                const menuButton = telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback('🏠 Вернуться в меню', 'ticket_back_to_menu')],
                ]);
                await ctx.reply(`✅ *Тикет успешно создан!*\n\n` +
                    `🆔 ID: #${ticket.id}\n` +
                    `📝 Заголовок: ${ticket.title}\n` +
                    `📊 Статус: Открыт\n\n` +
                    `Мы свяжемся с вами в ближайшее время!`, { parse_mode: 'Markdown', ...menuButton });
            }
        }
        catch (error) {
            const message = errorHandler.handle(error, {
                handler: 'ticketMessage',
                userId: ctx.from?.id,
            });
            await ctx.reply(message);
            // Очищаем состояние при ошибке
            if (ctx.session) {
                ctx.session.awaitingTicket = false;
                ctx.session.ticketStep = undefined;
                ctx.session.ticketTitle = undefined;
            }
        }
    };
}
//# sourceMappingURL=newticket.command.js.map