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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTicketMessageRepository = void 0;
const ticketMessage_entity_1 = require("../../../domain/entities/Ticket/ticketMessage.entity");
const prisma_client_1 = require("../../database/prisma.client");
/**
 * @class PrismaTicketMessageRepository
 * @brief Реализация TicketMessageRepository через Prisma ORM.
 */
class PrismaTicketMessageRepository {
    constructor(prismaClient = prisma_client_1.prisma) {
        this.prismaClient = prismaClient;
    }
    /**
     * Сохраняет сообщение тикета в базе данных.
     * Если сообщение с таким ID существует - обновляет, иначе создаёт новое.
     */
    async save(message) {
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
}
exports.PrismaTicketMessageRepository = PrismaTicketMessageRepository;
//# sourceMappingURL=prisma-ticket-message.repository.js.map