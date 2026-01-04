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
export class TicketMessage {
  /**
   * Создаёт новое сообщение тикета.
   *
   * @param id - Уникальный идентификатор сообщения (null для новых сообщений).
   * @param ticketId - Идентификатор тикета, к которому относится сообщение.
   * @param authorId - Идентификатор автора сообщения.
   * @param content - Текст сообщения.
   * @param createAt - Дата создания сообщения.
   */
  constructor(
    readonly id: number | null,
    readonly ticketId: number,
    readonly authorId: number,
    readonly content: string,
    readonly createAt: Date,
  ) {}
}
