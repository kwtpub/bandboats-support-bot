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
exports.PrismaUserRepository = void 0;
const tsyringe_1 = require("tsyringe");
const client_1 = require("@prisma/client");
const user_entity_1 = require("../../../domain/entities/User/user.entity");
/**
 * @class PrismaUserRepository
 * @brief Реализация UserRepository через Prisma ORM.
 */
let PrismaUserRepository = class PrismaUserRepository {
    constructor(prismaClient) {
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
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('PrismaClient')),
    __metadata("design:paramtypes", [client_1.PrismaClient])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map