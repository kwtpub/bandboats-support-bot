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
export declare enum TicketStatus {
    OPEN = 0,
    IN_PROGRESS = 1,
    CLOSE = 2
}
/**
 * @class Ticket
 * @brief Rich Domain Entity тикета с бизнес-логикой.
 */
export declare class Ticket {
    readonly id: number | null;
    readonly authorId: number;
    readonly assigneeId: number | null;
    readonly title: string;
    readonly messages: TicketMessage[];
    readonly status: TicketStatus;
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
    constructor(id: number | null, authorId: number, assigneeId: number | null, title: string, messages: TicketMessage[], status: TicketStatus);
    /**
     * Валидация инвариантов тикета.
     * @throws Error если нарушены бизнес-правила
     */
    private validateInvariants;
    /**
     * Назначает тикет исполнителю.
     * Переводит статус в IN_PROGRESS если тикет был OPEN.
     *
     * @param assigneeId - ID пользователя-исполнителя
     * @returns Новый экземпляр Ticket с обновлённым assigneeId и статусом
     * @throws Error если assigneeId невалиден или тикет закрыт
     */
    assign(assigneeId: number): Ticket;
    /**
     * Изменяет статус тикета.
     *
     * @param newStatus - Новый статус тикета
     * @returns Новый экземпляр Ticket с обновлённым статусом
     * @throws Error если переход статуса невалиден
     */
    changeStatus(newStatus: TicketStatus): Ticket;
    /**
     * Закрывает тикет.
     *
     * @returns Новый экземпляр Ticket со статусом CLOSE
     * @throws Error если тикет уже закрыт
     */
    close(): Ticket;
    /**
     * Переоткрывает закрытый тикет.
     *
     * @returns Новый экземпляр Ticket со статусом OPEN
     * @throws Error если тикет не закрыт
     */
    reopen(): Ticket;
    /**
     * Добавляет сообщение к тикету.
     *
     * @param message - Новое сообщение
     * @returns Новый экземпляр Ticket с добавленным сообщением
     * @throws Error если тикет закрыт
     */
    addMessage(message: TicketMessage): Ticket;
    /**
     * Проверяет, может ли пользователь закрыть тикет.
     * Тикет может закрыть автор или исполнитель.
     *
     * @param userId - ID пользователя
     * @returns true если пользователь может закрыть тикет
     */
    canBeClosedBy(userId: number): boolean;
    /**
     * Проверяет, назначен ли тикет конкретному пользователю.
     *
     * @param userId - ID пользователя
     * @returns true если тикет назначен этому пользователю
     */
    isAssignedTo(userId: number): boolean;
    /**
     * Проверяет, является ли пользователь автором тикета.
     *
     * @param userId - ID пользователя
     * @returns true если пользователь является автором
     */
    isAuthor(userId: number): boolean;
    /**
     * Проверяет, назначен ли тикет кому-либо.
     *
     * @returns true если тикет назначен
     */
    isAssigned(): boolean;
    /**
     * Проверяет, открыт ли тикет.
     *
     * @returns true если статус OPEN
     */
    isOpen(): boolean;
    /**
     * Проверяет, в работе ли тикет.
     *
     * @returns true если статус IN_PROGRESS
     */
    isInProgress(): boolean;
    /**
     * Проверяет, закрыт ли тикет.
     *
     * @returns true если статус CLOSE
     */
    isClosed(): boolean;
    /**
     * Возвращает количество сообщений в тикете.
     *
     * @returns Количество сообщений
     */
    getMessageCount(): number;
    /**
     * Возвращает последнее сообщение тикета.
     *
     * @returns Последнее сообщение или null если сообщений нет
     */
    getLastMessage(): TicketMessage | null;
    /**
     * Получает ID тикета. Бросает ошибку если тикет не сохранён в БД.
     *
     * @returns ID тикета
     * @throws Error если ID равен null
     */
    getId(): number;
    /**
     * Проверяет, сохранён ли тикет в БД.
     *
     * @returns true если тикет имеет ID
     */
    isPersisted(): boolean;
}
//# sourceMappingURL=ticket.entity.d.ts.map