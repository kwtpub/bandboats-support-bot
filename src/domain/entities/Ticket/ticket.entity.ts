/**
 * @file ticket.entity.ts
 * @brief Rich Domain Entity тикета с бизнес-логикой.
 *
 * Представляет тикет в системе техподдержки как Rich Domain Model.
 * Содержит бизнес-правила и инварианты для управления состоянием тикета.
 *
 * @remarks
 * Это агрегат в терминах DDD. Управляет своим состоянием и сообщениями.
 * Все изменения происходят через методы, гарантирующие консистентность.
 */
import { TicketMessage } from './ticketMessage.entity';
import {
  ValidationError,
  BusinessRuleViolationError,
  InvalidStateTransitionError,
} from '../../errors';

export enum TicketStatus {
  OPEN,
  IN_PROGRESS,
  CLOSE,
}

/**
 * @class Ticket
 * @brief Rich Domain Entity тикета с бизнес-логикой.
 */
export class Ticket {
  /**
   * Создаёт новый тикет.
   *
   * @param id - Уникальный идентификатор тикета (null для новых тикетов).
   * @param authorId - Идентификатор пользователя, создавшего тикет.
   * @param assigneeId - Идентификатор пользователя, которому назначен тикет (null если не назначен).
   * @param title - Заголовок тикета.
   * @param messages - Список сообщений, относящихся к тикету.
   * @param status - Статус тикета.
   */
  constructor(
    readonly id: number | null,
    readonly authorId: number,
    readonly assigneeId: number | null,
    readonly title: string,
    readonly messages: TicketMessage[],
    readonly status: TicketStatus,
  ) {
    this.validateInvariants();
  }

  /**
   * Валидация инвариантов тикета.
   * @throws Error если нарушены бизнес-правила
   */
  private validateInvariants(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new ValidationError('Ticket title cannot be empty', 'title');
    }
    if (this.title.length > 200) {
      throw new ValidationError(
        'Ticket title cannot exceed 200 characters',
        'title',
        this.title.length,
      );
    }
    if (this.authorId <= 0) {
      throw new ValidationError('Invalid author ID', 'authorId', this.authorId);
    }
    // ID can be null for new tickets (before saving to DB)
    if (this.id !== null && this.id <= 0) {
      throw new ValidationError('Invalid ticket ID', 'id', this.id);
    }
    // assigneeId can be null (unassigned) but if present must be valid
    if (this.assigneeId !== null && this.assigneeId <= 0) {
      throw new ValidationError('Invalid assignee ID', 'assigneeId', this.assigneeId);
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
  assign(assigneeId: number): Ticket {
    if (assigneeId <= 0) {
      throw new ValidationError('Invalid assignee ID', 'assigneeId', assigneeId);
    }
    if (this.status === TicketStatus.CLOSE) {
      throw new BusinessRuleViolationError('Cannot assign closed ticket', 'ticket_assignment');
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
  changeStatus(newStatus: TicketStatus): Ticket {
    // Бизнес-правила переходов статусов
    if (this.status === TicketStatus.CLOSE && newStatus !== TicketStatus.OPEN) {
      throw new InvalidStateTransitionError(
        TicketStatus[this.status],
        TicketStatus[newStatus],
        'Ticket',
      );
    }

    if (newStatus === TicketStatus.IN_PROGRESS && this.assigneeId === null) {
      throw new BusinessRuleViolationError(
        'Cannot set IN_PROGRESS status without assignee',
        'status_change',
      );
    }

    return new Ticket(
      this.id,
      this.authorId,
      this.assigneeId,
      this.title,
      this.messages,
      newStatus,
    );
  }

  /**
   * Закрывает тикет.
   *
   * @returns Новый экземпляр Ticket со статусом CLOSE
   * @throws Error если тикет уже закрыт
   */
  close(): Ticket {
    if (this.status === TicketStatus.CLOSE) {
      throw new BusinessRuleViolationError('Ticket is already closed', 'ticket_close');
    }

    return new Ticket(
      this.id,
      this.authorId,
      this.assigneeId,
      this.title,
      this.messages,
      TicketStatus.CLOSE,
    );
  }

  /**
   * Переоткрывает закрытый тикет.
   *
   * @returns Новый экземпляр Ticket со статусом OPEN
   * @throws Error если тикет не закрыт
   */
  reopen(): Ticket {
    if (this.status !== TicketStatus.CLOSE) {
      throw new BusinessRuleViolationError('Can only reopen closed tickets', 'ticket_reopen');
    }

    return new Ticket(
      this.id,
      this.authorId,
      this.assigneeId,
      this.title,
      this.messages,
      TicketStatus.OPEN,
    );
  }

  /**
   * Добавляет сообщение к тикету.
   *
   * @param message - Новое сообщение
   * @returns Новый экземпляр Ticket с добавленным сообщением
   * @throws Error если тикет закрыт
   */
  addMessage(message: TicketMessage): Ticket {
    if (this.status === TicketStatus.CLOSE) {
      throw new BusinessRuleViolationError('Cannot add message to closed ticket', 'message_add');
    }

    if (message.ticketId !== this.id) {
      throw new ValidationError(
        'Message does not belong to this ticket',
        'ticketId',
        message.ticketId,
      );
    }

    return new Ticket(
      this.id,
      this.authorId,
      this.assigneeId,
      this.title,
      [...this.messages, message],
      this.status,
    );
  }

  /**
   * Проверяет, может ли пользователь закрыть тикет.
   * Тикет может закрыть автор или исполнитель.
   *
   * @param userId - ID пользователя
   * @returns true если пользователь может закрыть тикет
   */
  canBeClosedBy(userId: number): boolean {
    return userId === this.authorId || (this.assigneeId !== null && userId === this.assigneeId);
  }

  /**
   * Проверяет, назначен ли тикет конкретному пользователю.
   *
   * @param userId - ID пользователя
   * @returns true если тикет назначен этому пользователю
   */
  isAssignedTo(userId: number): boolean {
    return this.assigneeId !== null && this.assigneeId === userId;
  }

  /**
   * Проверяет, является ли пользователь автором тикета.
   *
   * @param userId - ID пользователя
   * @returns true если пользователь является автором
   */
  isAuthor(userId: number): boolean {
    return this.authorId === userId;
  }

  /**
   * Проверяет, назначен ли тикет кому-либо.
   *
   * @returns true если тикет назначен
   */
  isAssigned(): boolean {
    return this.assigneeId !== null;
  }

  /**
   * Проверяет, открыт ли тикет.
   *
   * @returns true если статус OPEN
   */
  isOpen(): boolean {
    return this.status === TicketStatus.OPEN;
  }

  /**
   * Проверяет, в работе ли тикет.
   *
   * @returns true если статус IN_PROGRESS
   */
  isInProgress(): boolean {
    return this.status === TicketStatus.IN_PROGRESS;
  }

  /**
   * Проверяет, закрыт ли тикет.
   *
   * @returns true если статус CLOSE
   */
  isClosed(): boolean {
    return this.status === TicketStatus.CLOSE;
  }

  /**
   * Возвращает количество сообщений в тикете.
   *
   * @returns Количество сообщений
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Возвращает последнее сообщение тикета.
   *
   * @returns Последнее сообщение или null если сообщений нет
   */
  getLastMessage(): TicketMessage | null {
    if (this.messages.length === 0) {
      return null;
    }
    return this.messages[this.messages.length - 1];
  }

  /**
   * Получает ID тикета. Бросает ошибку если тикет не сохранён в БД.
   *
   * @returns ID тикета
   * @throws Error если ID равен null
   */
  getId(): number {
    if (this.id === null) {
      throw new ValidationError('Ticket must be saved to database before accessing ID', 'id');
    }
    return this.id;
  }

  /**
   * Проверяет, сохранён ли тикет в БД.
   *
   * @returns true если тикет имеет ID
   */
  isPersisted(): boolean {
    return this.id !== null;
  }
}
