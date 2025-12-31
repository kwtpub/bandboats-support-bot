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
/**
 * @class TicketService
 * @brief Application Service для управления тикетами.
 */
export declare class TicketService {
    private readonly ticketRepository;
    private readonly ticketMessageRepository;
    private readonly userRepository;
    constructor(ticketRepository: TicketRepository, ticketMessageRepository: TicketMessageRepository, userRepository: UserRepository);
    /**
     * Создаёт новый тикет.
     *
     * @param authorId - ID автора тикета
     * @param title - Заголовок тикета
     * @param initialMessage - Первое сообщение в тикете (необязательно)
     * @returns Созданный тикет
     * @throws Error если пользователь не найден или данные невалидны
     */
    createTicket(authorId: number, title: string, initialMessage?: string): Promise<Ticket>;
    /**
     * Получает тикет по ID.
     *
     * @param ticketId - ID тикета
     * @returns Тикет или null если не найден
     */
    getTicketById(ticketId: number): Promise<Ticket | null>;
    /**
     * Получает все тикеты автора.
     *
     * @param authorId - ID автора
     * @returns Массив тикетов
     */
    getTicketsByAuthor(authorId: number): Promise<Ticket[]>;
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
    assignTicket(ticketId: number, assigneeId: number, requesterId: number): Promise<Ticket>;
    /**
     * Изменяет статус тикета.
     *
     * @param ticketId - ID тикета
     * @param newStatus - Новый статус
     * @param requesterId - ID пользователя, выполняющего изменение
     * @returns Обновлённый тикет
     * @throws Error если тикет не найден, пользователь не найден или нет прав
     */
    changeTicketStatus(ticketId: number, newStatus: TicketStatus, requesterId: number): Promise<Ticket>;
    /**
     * Закрывает тикет.
     * Автор или исполнитель могут закрыть тикет.
     *
     * @param ticketId - ID тикета
     * @param requesterId - ID пользователя, выполняющего закрытие
     * @returns Обновлённый тикет
     * @throws Error если тикет не найден, пользователь не найден или нет прав
     */
    closeTicket(ticketId: number, requesterId: number): Promise<Ticket>;
    /**
     * Переоткрывает закрытый тикет.
     * Только администраторы могут переоткрывать тикеты.
     *
     * @param ticketId - ID тикета
     * @param requesterId - ID пользователя, выполняющего переоткрытие
     * @returns Обновлённый тикет
     * @throws Error если тикет не найден, пользователь не найден или нет прав
     */
    reopenTicket(ticketId: number, requesterId: number): Promise<Ticket>;
    /**
     * Добавляет сообщение к тикету.
     *
     * @param ticketId - ID тикета
     * @param authorId - ID автора сообщения
     * @param content - Содержание сообщения
     * @returns Обновлённый тикет с новым сообщением
     * @throws Error если тикет не найден, пользователь не найден, нет прав или содержание невалидно
     */
    addMessageToTicket(ticketId: number, authorId: number, content: string): Promise<Ticket>;
    /**
     * Получает все сообщения тикета.
     *
     * @param ticketId - ID тикета
     * @param requesterId - ID пользователя, запрашивающего сообщения
     * @returns Массив сообщений
     * @throws Error если тикет не найден, пользователь не найден или нет прав
     */
    getTicketMessages(ticketId: number, requesterId: number): Promise<TicketMessage[]>;
    /**
     * Проверяет, может ли пользователь просматривать тикет.
     *
     * @param ticketId - ID тикета
     * @param userId - ID пользователя
     * @returns true если пользователь может просматривать тикет
     * @throws Error если тикет или пользователь не найдены
     */
    canUserViewTicket(ticketId: number, userId: number): Promise<boolean>;
    /**
     * Получает количество сообщений в тикете.
     *
     * @param ticketId - ID тикета
     * @returns Количество сообщений
     * @throws Error если тикет не найден
     */
    getTicketMessageCount(ticketId: number): Promise<number>;
    /**
     * Проверяет, открыт ли тикет.
     *
     * @param ticketId - ID тикета
     * @returns true если тикет открыт
     * @throws Error если тикет не найден
     */
    isTicketOpen(ticketId: number): Promise<boolean>;
    /**
     * Проверяет, в работе ли тикет.
     *
     * @param ticketId - ID тикета
     * @returns true если тикет в работе
     * @throws Error если тикет не найден
     */
    isTicketInProgress(ticketId: number): Promise<boolean>;
    /**
     * Проверяет, закрыт ли тикет.
     *
     * @param ticketId - ID тикета
     * @returns true если тикет закрыт
     * @throws Error если тикет не найден
     */
    isTicketClosed(ticketId: number): Promise<boolean>;
}
//# sourceMappingURL=ticket.service.d.ts.map