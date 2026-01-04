import { Ticket, TicketStatus } from '../../../domain/entities/Ticket/ticket.entity';
/**
 * @interface TicketRepository
 * @brief Репозиторий агрегата Ticket
 */
export interface TicketRepository {
    /**
     * Сохраняет агрегат Ticket.
     *
     * @param ticket Агрегат тикета
     */
    save(ticket: Ticket): Promise<void>;
    /**
     * Возвращает тикет по идентификатору.
     *
     * @param id Идентификатор тикета
     * @return Ticket или null, если не найден
     */
    findById(id: number): Promise<Ticket | null>;
    /**
     * Возвращает тикеты автора.
     *
     * @param authorId Идентификатор автора
     * @return Массив тикетов автора
     */
    findByAuthorId(authorId: number): Promise<Ticket[]>;
    /**
     * Возвращает тикеты по статусу.
     *
     * @param status Статус тикета
     * @return Массив тикетов с указанным статусом
     */
    findByStatus(status: TicketStatus): Promise<Ticket[]>;
}
//# sourceMappingURL=ticket.repository.d.ts.map