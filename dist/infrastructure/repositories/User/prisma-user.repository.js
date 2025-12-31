"use strict";
/**
 * @file prisma-user.repository.ts
 * @brief Реализация UserRepository с использованием Prisma ORM.
 *
 * Реализует интерфейс UserRepository для работы с пользователями
 * через Prisma Client и PostgreSQL.
 *
 * @remarks
 * Это Infrastructure слой - конкретная реализация репозитория.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const client_1 = require("@prisma/client");
const user_entity_1 = require("../../../domain/entities/User/user.entity");
const prisma_client_1 = require("../../database/prisma.client");
/**
 * @class PrismaUserRepository
 * @brief Реализация UserRepository через Prisma ORM.
 */
class PrismaUserRepository {
    constructor(prismaClient = prisma_client_1.prisma) {
        this.prismaClient = prismaClient;
    }
    /**
     * Маппинг Prisma Role в доменный ROLE
     */
    mapPrismaRoleToDomain(prismaRole) {
        return prismaRole === client_1.Role.ADMIN ? user_entity_1.ROLE.ADMIN : user_entity_1.ROLE.CLIENT;
    }
    /**
     * Маппинг доменного ROLE в Prisma Role
     */
    mapDomainRoleToPrisma(domainRole) {
        return domainRole === user_entity_1.ROLE.ADMIN ? client_1.Role.ADMIN : client_1.Role.CLIENT;
    }
    /**
     * Сохраняет пользователя в базе данных.
     * Если пользователь с таким ID существует - обновляет, иначе создаёт нового.
     */
    async save(user) {
        await this.prismaClient.user.upsert({
            where: { id: user.id },
            update: {
                telegramId: user.telegramId,
                name: user.name,
                role: this.mapDomainRoleToPrisma(user.role),
            },
            create: {
                id: user.id,
                telegramId: user.telegramId,
                name: user.name,
                role: this.mapDomainRoleToPrisma(user.role),
                createdAt: user.createAt,
            },
        });
    }
    /**
     * Находит пользователя по ID.
     */
    async findById(id) {
        const prismaUser = await this.prismaClient.user.findUnique({
            where: { id },
        });
        if (!prismaUser) {
            return null;
        }
        return new user_entity_1.User(prismaUser.id, prismaUser.telegramId, prismaUser.name, this.mapPrismaRoleToDomain(prismaUser.role), prismaUser.createdAt);
    }
    /**
     * Находит пользователя по Telegram ID.
     */
    async findByTelegramId(telegramId) {
        const prismaUser = await this.prismaClient.user.findUnique({
            where: { telegramId },
        });
        if (!prismaUser) {
            return null;
        }
        return new user_entity_1.User(prismaUser.id, prismaUser.telegramId, prismaUser.name, this.mapPrismaRoleToDomain(prismaUser.role), prismaUser.createdAt);
    }
    /**
     * Находит всех пользователей с указанной ролью.
     */
    async findByRole(role) {
        const prismaUsers = await this.prismaClient.user.findMany({
            where: { role: this.mapDomainRoleToPrisma(role) },
        });
        return prismaUsers.map((prismaUser) => new user_entity_1.User(prismaUser.id, prismaUser.telegramId, prismaUser.name, this.mapPrismaRoleToDomain(prismaUser.role), prismaUser.createdAt));
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=prisma-user.repository.js.map