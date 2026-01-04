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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTicketRepository = void 0;
const tsyringe_1 = require("tsyringe");
const client_1 = require("@prisma/client");
const ticket_entity_1 = require("../../../domain/entities/Ticket/ticket.entity");
const ticketMessage_entity_1 = require("../../../domain/entities/Ticket/ticketMessage.entity");
/**
 * @class PrismaTicketRepository
 * @brief Реализация TicketRepository через Prisma ORM.
 */
let PrismaTicketRepository = class PrismaTicketRepository {
    constructor(prismaClient) {
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
        // If ticket has no ID (new ticket), create without specifying ID
        if (ticket.id === null) {
            await this.prismaClient.ticket.create({
                data: {
                    authorId: ticket.authorId,
                    assigneeId: ticket.assigneeId,
                    title: ticket.title,
                    status: this.mapDomainStatusToPrisma(ticket.status),
                },
            });
        }
        else {
            // If ticket has ID, use upsert to update or create
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
        return new ticket_entity_1.Ticket(prismaTicket.id, prismaTicket.authorId, prismaTicket.assigneeId, prismaTicket.title, messages, this.mapPrismaStatusToDomain(prismaTicket.status));
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
            return new ticket_entity_1.Ticket(prismaTicket.id, prismaTicket.authorId, prismaTicket.assigneeId, prismaTicket.title, messages, this.mapPrismaStatusToDomain(prismaTicket.status));
        });
    }
    /**
     * Находит все тикеты по статусу.
     */
    async findByStatus(status) {
        const prismaTickets = await this.prismaClient.ticket.findMany({
            where: { status: this.mapDomainStatusToPrisma(status) },
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
            return new ticket_entity_1.Ticket(prismaTicket.id, prismaTicket.authorId, prismaTicket.assigneeId, prismaTicket.title, messages, this.mapPrismaStatusToDomain(prismaTicket.status));
        });
    }
};
exports.PrismaTicketRepository = PrismaTicketRepository;
exports.PrismaTicketRepository = PrismaTicketRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('PrismaClient')),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], PrismaTicketRepository);
//# sourceMappingURL=prisma-ticket.repository.js.map