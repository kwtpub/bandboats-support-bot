"use strict";
/**
 * @file ticket.service.ts
 * @brief Application Service для управления тикетами.
 *
 * Содержит бизнес-логику и use cases для работы с тикетами и сообщениями
 * в системе техподдержки.
 *
 * @remarks
 * Этот сервис координирует операции между доменным слоем и слоем инфраструктуры.
 * Использует Rich Domain Model (Ticket entity) для бизнес-логики.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const ticket_entity_1 = require("../../entities/Ticket/ticket.entity");
const ticketMessage_entity_1 = require("../../entities/Ticket/ticketMessage.entity");
/**
 * @class TicketService
 * @brief Application Service для управления тикетами.
 */
class TicketService {
    constructor(ticketRepository, ticketMessageRepository, userRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketMessageRepository = ticketMessageRepository;
        this.userRepository = userRepository;
    }
    /**
     * Создаёт новый тикет.
     *
     * @param authorId - ID автора тикета
     * @param title - Заголовок тикета
     * @param initialMessage - Первое сообщение в тикете (необязательно)
     * @returns Созданный тикет
     * @throws Error если пользователь не найден или данные невалидны
     */
    async createTicket(authorId, title, initialMessage) {
        // Проверяем существование автора
        const author = await this.userRepository.findById(authorId);
        if (!author) {
            throw new Error(`User with ID ${authorId} not found`);
        }
        // Создаём новую доменную сущность
        const ticket = new ticket_entity_1.Ticket(0, // Временный ID, будет заменён после сохранения
        authorId, 0, // Не назначен
        title, [], ticket_entity_1.TicketStatus.OPEN);
        await this.ticketRepository.save(ticket);
        // Получаем сохранённый тикет с правильным ID
        const tickets = await this.ticketRepository.findByAuthorId(authorId);
        const savedTicket = tickets.find((t) => t.title === title);
        if (!savedTicket) {
            throw new Error('Failed to create ticket');
        }
        // Если есть начальное сообщение, добавляем его
        if (initialMessage) {
            const message = new ticketMessage_entity_1.TicketMessage(0, savedTicket.id, authorId, initialMessage, new Date());
            await this.ticketMessageRepository.save(message);
            // Получаем обновлённый тикет с сообщением
            const updatedTicket = await this.ticketRepository.findById(savedTicket.id);
            if (updatedTicket) {
                return updatedTicket;
            }
        }
        return savedTicket;
    }
    /**
     * Получает тикет по ID.
     *
     * @param ticketId - ID тикета
     * @returns Тикет или null если не найден
     */
    async getTicketById(ticketId) {
        return this.ticketRepository.findById(ticketId);
    }
    /**
     * Получает все тикеты автора.
     *
     * @param authorId - ID автора
     * @returns Массив тикетов
     */
    async getTicketsByAuthor(authorId) {
        return this.ticketRepository.findByAuthorId(authorId);
    }
    /**
     * Назначает тикет исполнителю.
     * Только администраторы могут назначать тикеты.
     *
     * @param ticketId - ID тикета
     * @param assigneeId - ID исполнителя
     * @param requesterId - ID пользователя, выполняющего назначение
     * @returns Обновлённый тикет
     * @throws Error если тикет не найден, пользователи не найдены или нет прав
     */
    async assignTicket(ticketId, assigneeId, requesterId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        const requester = await this.userRepository.findById(requesterId);
        if (!requester) {
            throw new Error(`User with ID ${requesterId} not found`);
        }
        // Проверяем права на назначение тикетов
        if (!requester.canAssignTickets()) {
            throw new Error('Only administrators can assign tickets');
        }
        const assignee = await this.userRepository.findById(assigneeId);
        if (!assignee) {
            throw new Error(`Assignee with ID ${assigneeId} not found`);
        }
        // Используем доменную логику для назначения
        const assignedTicket = ticket.assign(assigneeId);
        await this.ticketRepository.save(assignedTicket);
        return assignedTicket;
    }
    /**
     * Изменяет статус тикета.
     *
     * @param ticketId - ID тикета
     * @param newStatus - Новый статус
     * @param requesterId - ID пользователя, выполняющего изменение
     * @returns Обновлённый тикет
     * @throws Error если тикет не найден, пользователь не найден или нет прав
     */
    async changeTicketStatus(ticketId, newStatus, requesterId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        const requester = await this.userRepository.findById(requesterId);
        if (!requester) {
            throw new Error(`User with ID ${requesterId} not found`);
        }
        // Проверяем права на управление тикетом
        if (!requester.canManageTicket(ticket)) {
            throw new Error('You do not have permission to change this ticket status');
        }
        // Используем доменную логику для изменения статуса
        const updatedTicket = ticket.changeStatus(newStatus);
        await this.ticketRepository.save(updatedTicket);
        return updatedTicket;
    }
    /**
     * Закрывает тикет.
     * Автор или исполнитель могут закрыть тикет.
     *
     * @param ticketId - ID тикета
     * @param requesterId - ID пользователя, выполняющего закрытие
     * @returns Обновлённый тикет
     * @throws Error если тикет не найден, пользователь не найден или нет прав
     */
    async closeTicket(ticketId, requesterId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        const requester = await this.userRepository.findById(requesterId);
        if (!requester) {
            throw new Error(`User with ID ${requesterId} not found`);
        }
        // Проверяем права на закрытие тикета
        if (!requester.canCloseTicket(ticket)) {
            throw new Error('You do not have permission to close this ticket');
        }
        // Используем доменную логику для закрытия
        const closedTicket = ticket.close();
        await this.ticketRepository.save(closedTicket);
        return closedTicket;
    }
    /**
     * Переоткрывает закрытый тикет.
     * Только администраторы могут переоткрывать тикеты.
     *
     * @param ticketId - ID тикета
     * @param requesterId - ID пользователя, выполняющего переоткрытие
     * @returns Обновлённый тикет
     * @throws Error если тикет не найден, пользователь не найден или нет прав
     */
    async reopenTicket(ticketId, requesterId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        const requester = await this.userRepository.findById(requesterId);
        if (!requester) {
            throw new Error(`User with ID ${requesterId} not found`);
        }
        // Проверяем права на переоткрытие тикетов
        if (!requester.canReopenTickets()) {
            throw new Error('Only administrators can reopen tickets');
        }
        // Используем доменную логику для переоткрытия
        const reopenedTicket = ticket.reopen();
        await this.ticketRepository.save(reopenedTicket);
        return reopenedTicket;
    }
    /**
     * Добавляет сообщение к тикету.
     *
     * @param ticketId - ID тикета
     * @param authorId - ID автора сообщения
     * @param content - Содержание сообщения
     * @returns Обновлённый тикет с новым сообщением
     * @throws Error если тикет не найден, пользователь не найден, нет прав или содержание невалидно
     */
    async addMessageToTicket(ticketId, authorId, content) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        const author = await this.userRepository.findById(authorId);
        if (!author) {
            throw new Error(`User with ID ${authorId} not found`);
        }
        // Проверяем права на добавление сообщения
        if (!author.canAddMessageToTicket(ticket)) {
            throw new Error('You do not have permission to add messages to this ticket');
        }
        // Валидация содержания сообщения
        if (!content || content.trim().length === 0) {
            throw new Error('Message content cannot be empty');
        }
        if (content.length > 2000) {
            throw new Error('Message content cannot exceed 2000 characters');
        }
        // Создаём новое сообщение
        const message = new ticketMessage_entity_1.TicketMessage(0, // Временный ID
        ticketId, authorId, content, new Date());
        // Сохраняем сообщение
        await this.ticketMessageRepository.save(message);
        // Получаем обновлённый тикет с новым сообщением
        const updatedTicket = await this.ticketRepository.findById(ticketId);
        if (!updatedTicket) {
            throw new Error('Failed to update ticket with new message');
        }
        return updatedTicket;
    }
    /**
     * Получает все сообщения тикета.
     *
     * @param ticketId - ID тикета
     * @param requesterId - ID пользователя, запрашивающего сообщения
     * @returns Массив сообщений
     * @throws Error если тикет не найден, пользователь не найден или нет прав
     */
    async getTicketMessages(ticketId, requesterId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        const requester = await this.userRepository.findById(requesterId);
        if (!requester) {
            throw new Error(`User with ID ${requesterId} not found`);
        }
        // Проверяем права на просмотр тикета
        if (!requester.canViewTicket(ticket)) {
            throw new Error('You do not have permission to view this ticket');
        }
        return this.ticketMessageRepository.findByTicketId(ticketId);
    }
    /**
     * Проверяет, может ли пользователь просматривать тикет.
     *
     * @param ticketId - ID тикета
     * @param userId - ID пользователя
     * @returns true если пользователь может просматривать тикет
     * @throws Error если тикет или пользователь не найдены
     */
    async canUserViewTicket(ticketId, userId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }
        return user.canViewTicket(ticket);
    }
    /**
     * Получает количество сообщений в тикете.
     *
     * @param ticketId - ID тикета
     * @returns Количество сообщений
     * @throws Error если тикет не найден
     */
    async getTicketMessageCount(ticketId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        return ticket.getMessageCount();
    }
    /**
     * Проверяет, открыт ли тикет.
     *
     * @param ticketId - ID тикета
     * @returns true если тикет открыт
     * @throws Error если тикет не найден
     */
    async isTicketOpen(ticketId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        return ticket.isOpen();
    }
    /**
     * Проверяет, в работе ли тикет.
     *
     * @param ticketId - ID тикета
     * @returns true если тикет в работе
     * @throws Error если тикет не найден
     */
    async isTicketInProgress(ticketId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        return ticket.isInProgress();
    }
    /**
     * Проверяет, закрыт ли тикет.
     *
     * @param ticketId - ID тикета
     * @returns true если тикет закрыт
     * @throws Error если тикет не найден
     */
    async isTicketClosed(ticketId) {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }
        return ticket.isClosed();
    }
}
exports.TicketService = TicketService;
//# sourceMappingURL=ticket.service.js.map