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

import { Ticket, TicketStatus } from '../../entities/Ticket/ticket.entity';
import { TicketMessage } from '../../entities/Ticket/ticketMessage.entity';
import { TicketRepository } from '../../repositories/Ticket/ticket.repository';
import { TicketMessageRepository } from '../../repositories/Ticket/ticketMessage.repository';
import { UserRepository } from '../../repositories/User/user.repository';
import { NotFoundError, ForbiddenError, ValidationError } from '../../errors';

/**
 * @class TicketService
 * @brief Application Service для управления тикетами.
 */
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly ticketMessageRepository: TicketMessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Создаёт новый тикет.
   *
   * @param authorId - ID автора тикета
   * @param title - Заголовок тикета
   * @param initialMessage - Первое сообщение в тикете (необязательно)
   * @returns Созданный тикет
   * @throws Error если пользователь не найден или данные невалидны
   */
  async createTicket(authorId: number, title: string, initialMessage?: string): Promise<Ticket> {
    // Проверяем существование автора
    const author = await this.userRepository.findById(authorId);
    if (!author) {
      throw new NotFoundError('User', authorId);
    }

    // Создаём новую доменную сущность
    const ticket = new Ticket(
      null, // null означает, что ID будет сгенерирован БД
      authorId,
      null, // Не назначен
      title,
      [],
      TicketStatus.OPEN,
    );

    await this.ticketRepository.save(ticket);

    // Получаем сохранённый тикет с правильным ID
    const tickets = await this.ticketRepository.findByAuthorId(authorId);
    const savedTicket = tickets.find((t) => t.title === title);
    if (!savedTicket) {
      throw new Error('Failed to create ticket');
    }

    // Если есть начальное сообщение, добавляем его
    if (initialMessage) {
      const message = new TicketMessage(
        null,
        savedTicket.getId(),
        authorId,
        initialMessage,
        new Date(),
      );
      await this.ticketMessageRepository.save(message);

      // Получаем обновлённый тикет с сообщением
      const updatedTicket = await this.ticketRepository.findById(savedTicket.getId());
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
  async getTicketById(ticketId: number): Promise<Ticket | null> {
    return this.ticketRepository.findById(ticketId);
  }

  /**
   * Получает все тикеты автора.
   *
   * @param authorId - ID автора
   * @returns Массив тикетов
   */
  async getTicketsByAuthor(authorId: number): Promise<Ticket[]> {
    return this.ticketRepository.findByAuthorId(authorId);
  }

  /**
   * Получает все тикеты по статусу.
   *
   * @param status - Статус тикета
   * @returns Массив тикетов с указанным статусом
   */
  async getTicketsByStatus(status: TicketStatus): Promise<Ticket[]> {
    return this.ticketRepository.findByStatus(status);
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
  async assignTicket(ticketId: number, assigneeId: number, requesterId: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('User', requesterId);
    }

    // Проверяем права на назначение тикетов
    if (!requester.canAssignTickets()) {
      throw new ForbiddenError('Only administrators can assign tickets', 'assign', 'ticket');
    }

    const assignee = await this.userRepository.findById(assigneeId);
    if (!assignee) {
      throw new NotFoundError('User', assigneeId);
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
  async changeTicketStatus(
    ticketId: number,
    newStatus: TicketStatus,
    requesterId: number,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('User', requesterId);
    }

    // Проверяем права на управление тикетом
    if (!requester.canManageTicket(ticket)) {
      throw new ForbiddenError(
        'You do not have permission to change this ticket status',
        'changeStatus',
        'ticket',
      );
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
  async closeTicket(ticketId: number, requesterId: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('User', requesterId);
    }

    // Проверяем права на закрытие тикета
    if (!requester.canCloseTicket(ticket)) {
      throw new ForbiddenError(
        'You do not have permission to close this ticket',
        'close',
        'ticket',
      );
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
  async reopenTicket(ticketId: number, requesterId: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('User', requesterId);
    }

    // Проверяем права на переоткрытие тикетов
    if (!requester.canReopenTickets()) {
      throw new ForbiddenError('Only administrators can reopen tickets', 'reopen', 'ticket');
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
  async addMessageToTicket(ticketId: number, authorId: number, content: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const author = await this.userRepository.findById(authorId);
    if (!author) {
      throw new NotFoundError('User', authorId);
    }

    // Проверяем права на добавление сообщения
    if (!author.canAddMessageToTicket(ticket)) {
      throw new ForbiddenError(
        'You do not have permission to add messages to this ticket',
        'addMessage',
        'ticket',
      );
    }

    // Валидация содержания сообщения
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Message content cannot be empty', 'content');
    }
    if (content.length > 2000) {
      throw new ValidationError(
        'Message content cannot exceed 2000 characters',
        'content',
        content.length,
      );
    }

    // Создаём новое сообщение
    const message = new TicketMessage(
      null, // null означает, что ID будет сгенерирован БД
      ticketId,
      authorId,
      content,
      new Date(),
    );

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
  async getTicketMessages(ticketId: number, requesterId: number): Promise<TicketMessage[]> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('User', requesterId);
    }

    // Проверяем права на просмотр тикета
    if (!requester.canViewTicket(ticket)) {
      throw new ForbiddenError('You do not have permission to view this ticket', 'view', 'ticket');
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
  async canUserViewTicket(ticketId: number, userId: number): Promise<boolean> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
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
  async getTicketMessageCount(ticketId: number): Promise<number> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
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
  async isTicketOpen(ticketId: number): Promise<boolean> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
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
  async isTicketInProgress(ticketId: number): Promise<boolean> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
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
  async isTicketClosed(ticketId: number): Promise<boolean> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    return ticket.isClosed();
  }

  /**
   * Обновляет заголовок тикета.
   *
   * @param ticketId - ID тикета
   * @param newTitle - Новый заголовок
   * @param requesterId - ID пользователя, выполняющего обновление
   * @returns Обновлённый тикет
   * @throws Error если тикет не найден, пользователь не найден или нет прав
   */
  async updateTicketTitle(
    ticketId: number,
    newTitle: string,
    requesterId: number,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('User', requesterId);
    }

    // Проверяем права на редактирование тикета (автор или админ)
    if (!requester.canManageTicket(ticket)) {
      throw new ForbiddenError(
        'You do not have permission to update this ticket',
        'update',
        'ticket',
      );
    }

    // Создаём новый экземпляр тикета с обновлённым заголовком
    const updatedTicket = new Ticket(
      ticket.id,
      ticket.authorId,
      ticket.assigneeId,
      newTitle,
      ticket.messages,
      ticket.status,
    );

    await this.ticketRepository.save(updatedTicket);

    return updatedTicket;
  }

  /**
   * Обновляет описание тикета (первое сообщение).
   *
   * @param ticketId - ID тикета
   * @param newDescription - Новое описание
   * @param requesterId - ID пользователя, выполняющего обновление
   * @returns Обновлённый тикет
   * @throws Error если тикет не найден, пользователь не найден, нет прав или нет сообщений
   */
  async updateTicketDescription(
    ticketId: number,
    newDescription: string,
    requesterId: number,
  ): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new NotFoundError('User', requesterId);
    }

    // Проверяем права на редактирование тикета (автор или админ)
    if (!requester.canManageTicket(ticket)) {
      throw new ForbiddenError(
        'You do not have permission to update this ticket',
        'update',
        'ticket',
      );
    }

    if (ticket.messages.length === 0) {
      throw new ValidationError('Cannot update description: ticket has no messages', 'messages');
    }

    // Валидация содержания описания
    if (!newDescription || newDescription.trim().length === 0) {
      throw new ValidationError('Description cannot be empty', 'description');
    }
    if (newDescription.length > 2000) {
      throw new ValidationError(
        'Description cannot exceed 2000 characters',
        'description',
        newDescription.length,
      );
    }

    // Получаем первое сообщение
    const firstMessage = ticket.messages[0];

    // Создаём обновлённое сообщение
    const updatedMessage = new TicketMessage(
      firstMessage.id,
      firstMessage.ticketId,
      firstMessage.authorId,
      newDescription,
      firstMessage.createAt,
    );

    // Сохраняем обновлённое сообщение
    await this.ticketMessageRepository.save(updatedMessage);

    // Получаем обновлённый тикет
    const updatedTicket = await this.ticketRepository.findById(ticketId);
    if (!updatedTicket) {
      throw new Error('Failed to update ticket description');
    }

    return updatedTicket;
  }
}
