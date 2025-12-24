/**
 * @file ticket.entity.ts
 * @brief Entity тикета.
 * 
 * Представляет тикет в системе техподдержки.
 * Содержит информацию об авторе, назначенном исполнителе,
 * заголовок, сообщения и статус тикета.
 * 
 * @remarks
 * Это сущность доменного слоя. Может содержать несколько сообщений
 * и использоваться как агрегат для управления сообщениями и статусом.
 */
import { TicketMessage } from './ticketMessage.entity';

export enum TicketStatus {
  OPEN,
  IN_PROGRESS,
  CLOSE,
}

/**
 * @class Ticket
 * @brief Entity тикета.
 */
export class Ticket {
  /**
   * Создаёт новый тикет.
   * 
   * @param id - Уникальный идентификатор тикета.
   * @param authorId - Идентификатор пользователя, создавшего тикет.
   * @param assigneeId - Идентификатор пользователя, которому назначен тикет.
   * @param title - Заголовок тикета.
   * @param messages - Список сообщений, относящихся к тикету.
   * @param status - Статус тикета.
   */
  constructor(
    readonly id: number,
    readonly authorId: number,
    readonly assigneeId: number,
    readonly title: string,
    readonly messages: TicketMessage[],
    readonly status: TicketStatus,
  ) {}
}
