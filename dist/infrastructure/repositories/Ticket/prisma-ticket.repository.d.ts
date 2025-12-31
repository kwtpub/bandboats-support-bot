/**
 * @file prisma-ticket.repository.ts
 * @brief Реализация TicketRepository с использованием Prisma ORM.
 *
 * Реализует интерфейс TicketRepository для работы с тикетами
 * через Prisma Client и PostgreSQL.
 *
 * @remarks
 * Это Infrastructure слой - конкретная реализация репозитория.
 */
import { PrismaClient } from '@prisma/client';
import { TicketRepository } from '../../../domain/repositories/Ticket/ticket.repository';
import { Ticket } from '../../../domain/entities/Ticket/ticket.entity';
/**
 * @class PrismaTicketRepository
 * @brief Реализация TicketRepository через Prisma ORM.
 */
export declare class PrismaTicketRepository implements TicketRepository {
    private readonly prismaClient;
    constructor(prismaClient: PrismaClient);
    /**
     * Маппинг Prisma TicketStatus в доменный TicketStatus
     */
    private mapPrismaStatusToDomain;
    /**
     * Маппинг доменного TicketStatus в Prisma TicketStatus
     */
    private mapDomainStatusToPrisma;
    /**
     * Сохраняет тикет в базе данных.
     * Если тикет с таким ID существует - обновляет, иначе создаёт новый.
     */
    save(ticket: Ticket): Promise<void>;
    /**
     * Находит тикет по ID вместе со всеми сообщениями.
     */
    findById(id: number): Promise<Ticket | null>;
    /**
     * Находит все тикеты автора с сообщениями.
     */
    findByAuthorId(authorId: number): Promise<Ticket[]>;
}
//# sourceMappingURL=prisma-ticket.repository.d.ts.map