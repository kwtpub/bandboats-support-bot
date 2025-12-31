"use strict";
/**
 * @file container.ts
 * @brief Настройка Dependency Injection контейнера.
 *
 * Конфигурирует и регистрирует все зависимости приложения:
 * - Repositories (инфраструктура)
 * - Services (доменные сервисы)
 * - Database clients
 *
 * @remarks
 * Использует tsyringe для управления зависимостями.
 * Все зависимости регистрируются как синглтоны для эффективного использования ресурсов.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
exports.setupContainer = setupContainer;
exports.getService = getService;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
Object.defineProperty(exports, "container", { enumerable: true, get: function () { return tsyringe_1.container; } });
// Database
const prisma_client_1 = require("../database/prisma.client");
const prisma_user_repository_1 = require("../repositories/User/prisma-user.repository");
const prisma_ticket_repository_1 = require("../repositories/Ticket/prisma-ticket.repository");
const prisma_ticket_message_repository_1 = require("../repositories/Ticket/prisma-ticket-message.repository");
// Services
const user_service_1 = require("../../domain/services/UserService/user.service");
const ticket_service_1 = require("../../domain/services/TicketService/ticket.service");
/**
 * Регистрирует все зависимости в DI контейнере.
 */
function setupContainer() {
    // Регистрация Prisma Client как синглтон
    tsyringe_1.container.registerInstance('PrismaClient', prisma_client_1.prisma);
    // Регистрация репозиториев
    tsyringe_1.container.registerSingleton('UserRepository', prisma_user_repository_1.PrismaUserRepository);
    tsyringe_1.container.registerSingleton('TicketRepository', prisma_ticket_repository_1.PrismaTicketRepository);
    tsyringe_1.container.registerSingleton('TicketMessageRepository', prisma_ticket_message_repository_1.PrismaTicketMessageRepository);
    // Регистрация сервисов
    tsyringe_1.container.register('UserService', {
        useFactory: (c) => {
            return new user_service_1.UserService(c.resolve('UserRepository'));
        },
    });
    tsyringe_1.container.register('TicketService', {
        useFactory: (c) => {
            return new ticket_service_1.TicketService(c.resolve('TicketRepository'), c.resolve('TicketMessageRepository'), c.resolve('UserRepository'));
        },
    });
}
/**
 * Получает экземпляр зависимости из контейнера.
 *
 * @param token - Токен зависимости
 * @returns Экземпляр зависимости
 */
function getService(token) {
    return tsyringe_1.container.resolve(token);
}
//# sourceMappingURL=container.js.map