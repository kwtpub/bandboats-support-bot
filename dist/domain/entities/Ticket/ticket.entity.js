"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = exports.TicketStatus = void 0;
const errors_1 = require("../../errors");
var TicketStatus;
(function (TicketStatus) {
    TicketStatus[TicketStatus["OPEN"] = 0] = "OPEN";
    TicketStatus[TicketStatus["IN_PROGRESS"] = 1] = "IN_PROGRESS";
    TicketStatus[TicketStatus["CLOSE"] = 2] = "CLOSE";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
/**
 * @class Ticket
 * @brief Rich Domain Entity тикета с бизнес-логикой.
 */
class Ticket {
    /**
     * Создаёт новый тикет.
     *
     * @param id - Уникальный идентификатор тикета.
     * @param authorId - Идентификатор пользователя, создавшего тикет.
     * @param assigneeId - Идентификатор пользователя, которому назначен тикет (0 если не назначен).
     * @param title - Заголовок тикета.
     * @param messages - Список сообщений, относящихся к тикету.
     * @param status - Статус тикета.
     */
    constructor(id, authorId, assigneeId, title, messages, status) {
        this.id = id;
        this.authorId = authorId;
        this.assigneeId = assigneeId;
        this.title = title;
        this.messages = messages;
        this.status = status;
        this.validateInvariants();
    }
    /**
     * Валидация инвариантов тикета.
     * @throws Error если нарушены бизнес-правила
     */
    validateInvariants() {
        if (!this.title || this.title.trim().length === 0) {
            throw new errors_1.ValidationError('Ticket title cannot be empty', 'title');
        }
        if (this.title.length > 200) {
            throw new errors_1.ValidationError('Ticket title cannot exceed 200 characters', 'title', this.title.length);
        }
        if (this.authorId <= 0) {
            throw new errors_1.ValidationError('Invalid author ID', 'authorId', this.authorId);
        }
    }
    /**
     * Назначает тикет исполнителю.
     * Переводит статус в IN_PROGRESS если тикет был OPEN.
     *
     * @param assigneeId - ID пользователя-исполнителя
     * @returns Новый экземпляр Ticket с обновлённым assigneeId и статусом
     * @throws Error если assigneeId невалиден или тикет закрыт
     */
    assign(assigneeId) {
        if (assigneeId <= 0) {
            throw new errors_1.ValidationError('Invalid assignee ID', 'assigneeId', assigneeId);
        }
        if (this.status === TicketStatus.CLOSE) {
            throw new errors_1.BusinessRuleViolationError('Cannot assign closed ticket', 'ticket_assignment');
        }
        const newStatus = this.status === TicketStatus.OPEN ? TicketStatus.IN_PROGRESS : this.status;
        return new Ticket(this.id, this.authorId, assigneeId, this.title, this.messages, newStatus);
    }
    /**
     * Изменяет статус тикета.
     *
     * @param newStatus - Новый статус тикета
     * @returns Новый экземпляр Ticket с обновлённым статусом
     * @throws Error если переход статуса невалиден
     */
    changeStatus(newStatus) {
        // Бизнес-правила переходов статусов
        if (this.status === TicketStatus.CLOSE && newStatus !== TicketStatus.OPEN) {
            throw new errors_1.InvalidStateTransitionError(TicketStatus[this.status], TicketStatus[newStatus], 'Ticket');
        }
        if (newStatus === TicketStatus.IN_PROGRESS && this.assigneeId === 0) {
            throw new errors_1.BusinessRuleViolationError('Cannot set IN_PROGRESS status without assignee', 'status_change');
        }
        return new Ticket(this.id, this.authorId, this.assigneeId, this.title, this.messages, newStatus);
    }
    /**
     * Закрывает тикет.
     *
     * @returns Новый экземпляр Ticket со статусом CLOSE
     * @throws Error если тикет уже закрыт
     */
    close() {
        if (this.status === TicketStatus.CLOSE) {
            throw new errors_1.BusinessRuleViolationError('Ticket is already closed', 'ticket_close');
        }
        return new Ticket(this.id, this.authorId, this.assigneeId, this.title, this.messages, TicketStatus.CLOSE);
    }
    /**
     * Переоткрывает закрытый тикет.
     *
     * @returns Новый экземпляр Ticket со статусом OPEN
     * @throws Error если тикет не закрыт
     */
    reopen() {
        if (this.status !== TicketStatus.CLOSE) {
            throw new errors_1.BusinessRuleViolationError('Can only reopen closed tickets', 'ticket_reopen');
        }
        return new Ticket(this.id, this.authorId, this.assigneeId, this.title, this.messages, TicketStatus.OPEN);
    }
    /**
     * Добавляет сообщение к тикету.
     *
     * @param message - Новое сообщение
     * @returns Новый экземпляр Ticket с добавленным сообщением
     * @throws Error если тикет закрыт
     */
    addMessage(message) {
        if (this.status === TicketStatus.CLOSE) {
            throw new errors_1.BusinessRuleViolationError('Cannot add message to closed ticket', 'message_add');
        }
        if (message.ticketId !== this.id) {
            throw new errors_1.ValidationError('Message does not belong to this ticket', 'ticketId', message.ticketId);
        }
        return new Ticket(this.id, this.authorId, this.assigneeId, this.title, [...this.messages, message], this.status);
    }
    /**
     * Проверяет, может ли пользователь закрыть тикет.
     * Тикет может закрыть автор или исполнитель.
     *
     * @param userId - ID пользователя
     * @returns true если пользователь может закрыть тикет
     */
    canBeClosedBy(userId) {
        return userId === this.authorId || userId === this.assigneeId;
    }
    /**
     * Проверяет, назначен ли тикет конкретному пользователю.
     *
     * @param userId - ID пользователя
     * @returns true если тикет назначен этому пользователю
     */
    isAssignedTo(userId) {
        return this.assigneeId === userId && this.assigneeId !== 0;
    }
    /**
     * Проверяет, является ли пользователь автором тикета.
     *
     * @param userId - ID пользователя
     * @returns true если пользователь является автором
     */
    isAuthor(userId) {
        return this.authorId === userId;
    }
    /**
     * Проверяет, назначен ли тикет кому-либо.
     *
     * @returns true если тикет назначен
     */
    isAssigned() {
        return this.assigneeId !== 0;
    }
    /**
     * Проверяет, открыт ли тикет.
     *
     * @returns true если статус OPEN
     */
    isOpen() {
        return this.status === TicketStatus.OPEN;
    }
    /**
     * Проверяет, в работе ли тикет.
     *
     * @returns true если статус IN_PROGRESS
     */
    isInProgress() {
        return this.status === TicketStatus.IN_PROGRESS;
    }
    /**
     * Проверяет, закрыт ли тикет.
     *
     * @returns true если статус CLOSE
     */
    isClosed() {
        return this.status === TicketStatus.CLOSE;
    }
    /**
     * Возвращает количество сообщений в тикете.
     *
     * @returns Количество сообщений
     */
    getMessageCount() {
        return this.messages.length;
    }
    /**
     * Возвращает последнее сообщение тикета.
     *
     * @returns Последнее сообщение или null если сообщений нет
     */
    getLastMessage() {
        if (this.messages.length === 0) {
            return null;
        }
        return this.messages[this.messages.length - 1];
    }
}
exports.Ticket = Ticket;
//# sourceMappingURL=ticket.entity.js.map