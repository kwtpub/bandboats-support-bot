/**
 * @file prisma-ticket-message.repository.ts
 * @brief Реализация TicketMessageRepository с использованием Prisma ORM.
 *
 * Реализует интерфейс TicketMessageRepository для работы с сообщениями тикетов
 * через Prisma Client и PostgreSQL.
 *
 * @remarks
 * Это Infrastructure слой - конкретная реализация репозитория.
 */
import { PrismaClient } from '@prisma/client';
import { TicketMessageRepository } from '../../../domain/repositories/Ticket/ticketMessage.repository';
import { TicketMessage } from '../../../domain/entities/Ticket/ticketMessage.entity';
/**
 * @class PrismaTicketMessageRepository
 * @brief Реализация TicketMessageRepository через Prisma ORM.
 */
export declare class PrismaTicketMessageRepository implements TicketMessageRepository {
    private prismaClient;
    constructor(prismaClient?: PrismaClient);
    /**
     * Сохраняет сообщение тикета в базе данных.
     * Если сообщение с таким ID существует - обновляет, иначе создаёт новое.
     */
    save(message: TicketMessage): Promise<void>;
    /**
     * Находит сообщение по ID.
     */
    findById(id: number): Promise<TicketMessage | null>;
    /**
     * Находит все сообщения тикета, отсортированные по дате создания.
     */
    findByTicketId(ticketId: number): Promise<TicketMessage[]>;
}
//# sourceMappingURL=prisma-ticket-message.repository.d.ts.map