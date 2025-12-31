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
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../../../domain/repositories/User/user.repository';
import { User, ROLE } from '../../../domain/entities/User/user.entity';
/**
 * @class PrismaUserRepository
 * @brief Реализация UserRepository через Prisma ORM.
 */
export declare class PrismaUserRepository implements UserRepository {
    private prismaClient;
    constructor(prismaClient?: PrismaClient);
    /**
     * Маппинг Prisma Role в доменный ROLE
     */
    private mapPrismaRoleToDomain;
    /**
     * Маппинг доменного ROLE в Prisma Role
     */
    private mapDomainRoleToPrisma;
    /**
     * Сохраняет пользователя в базе данных.
     * Если пользователь с таким ID существует - обновляет, иначе создаёт нового.
     */
    save(user: User): Promise<void>;
    /**
     * Находит пользователя по ID.
     */
    findById(id: number): Promise<User | null>;
    /**
     * Находит пользователя по Telegram ID.
     */
    findByTelegramId(telegramId: string): Promise<User | null>;
    /**
     * Находит всех пользователей с указанной ролью.
     */
    findByRole(role: ROLE): Promise<User[]>;
}
//# sourceMappingURL=prisma-user.repository.d.ts.map