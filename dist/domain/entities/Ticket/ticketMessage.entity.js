"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketMessage = void 0;
/**
 * @file ticketMessage.entity.ts
 * @brief Entity сообщения в тикете.
 *
 * Представляет сообщение, отправленное пользователем или администратором
 * в рамках конкретного тикета.
 *
 * @remarks
 * Это сущность доменного слоя, используется в логике приложения и сервисах.
 */
class TicketMessage {
    /**
     * Создаёт новое сообщение тикета.
     *
     * @param id - Уникальный идентификатор сообщения.
     * @param ticketId - Идентификатор тикета, к которому относится сообщение.
     * @param authorId - Идентификатор автора сообщения.
     * @param content - Текст сообщения.
     * @param createAt - Дата создания сообщения.
     */
    constructor(id, ticketId, authorId, content, createAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.authorId = authorId;
        this.content = content;
        this.createAt = createAt;
    }
}
exports.TicketMessage = TicketMessage;
//# sourceMappingURL=ticketMessage.entity.js.map