import { TicketMessage } from '../../../domain/entities/Ticket/ticketMessage.entity';

/**
 * @file ticketMessage.repository.ts
 * @brief Репозиторий для работы с сообщениями тикетов.
 *
 * Интерфейс определяет методы для сохранения, поиска и получения сообщений
 * в рамках тикета.
 *
 * @remarks
 * Интерфейс находится в Application/Domain слое. Реализация методов выполняется
 * в Infrastructure слое.
 */
export interface TicketMessageRepository {
  /**
   * Сохраняет сообщение тикета.
   *
   * @param message - Entity сообщения тикета
   */
  save(message: TicketMessage): Promise<void>;

  /**
   * Возвращает сообщение по идентификатору.
   *
   * @param id - Уникальный идентификатор сообщения
   * @return TicketMessage или null, если не найден
   */
  findById(id: number): Promise<TicketMessage | null>;

  /**
   * Возвращает все сообщения тикета.
   *
   * @param ticketId - Идентификатор тикета
   * @return Массив сообщений тикета
   */
  findByTicketId(ticketId: number): Promise<TicketMessage[]>;
}
