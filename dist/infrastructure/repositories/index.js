"use strict";
/**
 * @file index.ts
 * @brief Экспорт всех Prisma репозиториев.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTicketMessageRepository = exports.PrismaTicketRepository = exports.PrismaUserRepository = void 0;
var prisma_user_repository_1 = require("./User/prisma-user.repository");
Object.defineProperty(exports, "PrismaUserRepository", { enumerable: true, get: function () { return prisma_user_repository_1.PrismaUserRepository; } });
var prisma_ticket_repository_1 = require("./Ticket/prisma-ticket.repository");
Object.defineProperty(exports, "PrismaTicketRepository", { enumerable: true, get: function () { return prisma_ticket_repository_1.PrismaTicketRepository; } });
var prisma_ticket_message_repository_1 = require("./Ticket/prisma-ticket-message.repository");
Object.defineProperty(exports, "PrismaTicketMessageRepository", { enumerable: true, get: function () { return prisma_ticket_message_repository_1.PrismaTicketMessageRepository; } });
//# sourceMappingURL=index.js.map