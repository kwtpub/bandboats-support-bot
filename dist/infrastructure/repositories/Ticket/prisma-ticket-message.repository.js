"use strict";
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
exports.PrismaTicketMessageRepository = void 0;
const tsyringe_1 = require("tsyringe");
const client_1 = require("@prisma/client");
const ticketMessage_entity_1 = require("../../../domain/entities/Ticket/ticketMessage.entity");
/**
 * @class PrismaTicketMessageRepository
 * @brief Реализация TicketMessageRepository через Prisma ORM.
 */
let PrismaTicketMessageRepository = class PrismaTicketMessageRepository {
    constructor(prismaClient) {
        this.prismaClient = prismaClient;
    }
    /**
     * Сохраняет сообщение тикета в базе данных.
     * Если сообщение с таким ID существует - обновляет, иначе создаёт новое.
     */
    async save(message) {
        // If message has no ID (new message), create without specifying ID
        if (message.id === null) {
            await this.prismaClient.ticketMessage.create({
                data: {
                    ticketId: message.ticketId,
                    authorId: message.authorId,
                    content: message.content,
                    createdAt: message.createAt,
                },
            });
        }
        else {
            // If message has ID, use upsert to update or create
            await this.prismaClient.ticketMessage.upsert({
                where: { id: message.id },
                update: {
                    ticketId: message.ticketId,
                    authorId: message.authorId,
                    content: message.content,
                },
                create: {
                    id: message.id,
                    ticketId: message.ticketId,
                    authorId: message.authorId,
                    content: message.content,
                    createdAt: message.createAt,
                },
            });
        }
    }
    /**
     * Находит сообщение по ID.
     */
    async findById(id) {
        const prismaMessage = await this.prismaClient.ticketMessage.findUnique({
            where: { id },
        });
        if (!prismaMessage) {
            return null;
        }
        return new ticketMessage_entity_1.TicketMessage(prismaMessage.id, prismaMessage.ticketId, prismaMessage.authorId, prismaMessage.content, prismaMessage.createdAt);
    }
    /**
     * Находит все сообщения тикета, отсортированные по дате создания.
     */
    async findByTicketId(ticketId) {
        const prismaMessages = await this.prismaClient.ticketMessage.findMany({
            where: { ticketId },
            orderBy: {
                createdAt: 'asc',
            },
        });
        return prismaMessages.map((prismaMessage) => new ticketMessage_entity_1.TicketMessage(prismaMessage.id, prismaMessage.ticketId, prismaMessage.authorId, prismaMessage.content, prismaMessage.createdAt));
    }
};
exports.PrismaTicketMessageRepository = PrismaTicketMessageRepository;
exports.PrismaTicketMessageRepository = PrismaTicketMessageRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('PrismaClient')),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], PrismaTicketMessageRepository);
//# sourceMappingURL=prisma-ticket-message.repository.js.map