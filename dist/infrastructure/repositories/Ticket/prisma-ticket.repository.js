"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTicketRepository = void 0;
const client_1 = require("@prisma/client");
const ticket_entity_1 = require("../../../domain/entities/Ticket/ticket.entity");
const ticketMessage_entity_1 = require("../../../domain/entities/Ticket/ticketMessage.entity");
const prisma_client_1 = require("../../database/prisma.client");
/**
 * @class PrismaTicketRepository
 * @brief Реализация TicketRepository через Prisma ORM.
 */
class PrismaTicketRepository {
    constructor(prismaClient = prisma_client_1.prisma) {
        this.prismaClient = prismaClient;
    }
    /**
     * Маппинг Prisma TicketStatus в доменный TicketStatus
     */
    mapPrismaStatusToDomain(prismaStatus) {
        switch (prismaStatus) {
            case client_1.TicketStatus.OPEN:
                return ticket_entity_1.TicketStatus.OPEN;
            case client_1.TicketStatus.IN_PROGRESS:
                return ticket_entity_1.TicketStatus.IN_PROGRESS;
            case client_1.TicketStatus.CLOSE:
                return ticket_entity_1.TicketStatus.CLOSE;
        }
    }
    /**
     * Маппинг доменного TicketStatus в Prisma TicketStatus
     */
    mapDomainStatusToPrisma(domainStatus) {
        switch (domainStatus) {
            case ticket_entity_1.TicketStatus.OPEN:
                return client_1.TicketStatus.OPEN;
            case ticket_entity_1.TicketStatus.IN_PROGRESS:
                return client_1.TicketStatus.IN_PROGRESS;
            case ticket_entity_1.TicketStatus.CLOSE:
                return client_1.TicketStatus.CLOSE;
        }
    }
    /**
     * Сохраняет тикет в базе данных.
     * Если тикет с таким ID существует - обновляет, иначе создаёт новый.
     */
    async save(ticket) {
        await this.prismaClient.ticket.upsert({
            where: { id: ticket.id },
            update: {
                authorId: ticket.authorId,
                assigneeId: ticket.assigneeId,
                title: ticket.title,
                status: this.mapDomainStatusToPrisma(ticket.status),
            },
            create: {
                id: ticket.id,
                authorId: ticket.authorId,
                assigneeId: ticket.assigneeId,
                title: ticket.title,
                status: this.mapDomainStatusToPrisma(ticket.status),
            },
        });
    }
    /**
     * Находит тикет по ID вместе со всеми сообщениями.
     */
    async findById(id) {
        const prismaTicket = await this.prismaClient.ticket.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
        if (!prismaTicket) {
            return null;
        }
        const messages = prismaTicket.messages.map((msg) => new ticketMessage_entity_1.TicketMessage(msg.id, msg.ticketId, msg.authorId, msg.content, msg.createdAt));
        return new ticket_entity_1.Ticket(prismaTicket.id, prismaTicket.authorId, prismaTicket.assigneeId ?? 0, prismaTicket.title, messages, this.mapPrismaStatusToDomain(prismaTicket.status));
    }
    /**
     * Находит все тикеты автора с сообщениями.
     */
    async findByAuthorId(authorId) {
        const prismaTickets = await this.prismaClient.ticket.findMany({
            where: { authorId },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return prismaTickets.map((prismaTicket) => {
            const messages = prismaTicket.messages.map((msg) => new ticketMessage_entity_1.TicketMessage(msg.id, msg.ticketId, msg.authorId, msg.content, msg.createdAt));
            return new ticket_entity_1.Ticket(prismaTicket.id, prismaTicket.authorId, prismaTicket.assigneeId ?? 0, prismaTicket.title, messages, this.mapPrismaStatusToDomain(prismaTicket.status));
        });
    }
}
exports.PrismaTicketRepository = PrismaTicketRepository;
//# sourceMappingURL=prisma-ticket.repository.js.map