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

import { PrismaClient, Role as PrismaRole } from '@prisma/client';
import { UserRepository } from '../../../domain/repositories/User/user.repository';
import { User, ROLE } from '../../../domain/entities/User/user.entity';
import { prisma } from '../../database/prisma.client';

/**
 * @class PrismaUserRepository
 * @brief Реализация UserRepository через Prisma ORM.
 */
export class PrismaUserRepository implements UserRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prismaClient = prismaClient;
  }

  /**
   * Маппинг Prisma Role в доменный ROLE
   */
  private mapPrismaRoleToDomain(prismaRole: PrismaRole): ROLE {
    return prismaRole === PrismaRole.ADMIN ? ROLE.ADMIN : ROLE.CLIENT;
  }

  /**
   * Маппинг доменного ROLE в Prisma Role
   */
  private mapDomainRoleToPrisma(domainRole: ROLE): PrismaRole {
    return domainRole === ROLE.ADMIN ? PrismaRole.ADMIN : PrismaRole.CLIENT;
  }

  /**
   * Сохраняет пользователя в базе данных.
   * Если пользователь с таким ID существует - обновляет, иначе создаёт нового.
   */
  async save(user: User): Promise<void> {
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
  async findById(id: number): Promise<User | null> {
    const prismaUser = await this.prismaClient.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      return null;
    }

    return new User(
      prismaUser.id,
      prismaUser.telegramId,
      prismaUser.name,
      this.mapPrismaRoleToDomain(prismaUser.role),
      prismaUser.createdAt,
    );
  }

  /**
   * Находит пользователя по Telegram ID.
   */
  async findByTelegramId(telegramId: string): Promise<User | null> {
    const prismaUser = await this.prismaClient.user.findUnique({
      where: { telegramId },
    });

    if (!prismaUser) {
      return null;
    }

    return new User(
      prismaUser.id,
      prismaUser.telegramId,
      prismaUser.name,
      this.mapPrismaRoleToDomain(prismaUser.role),
      prismaUser.createdAt,
    );
  }

  /**
   * Находит всех пользователей с указанной ролью.
   */
  async findByRole(role: ROLE): Promise<User[]> {
    const prismaUsers = await this.prismaClient.user.findMany({
      where: { role: this.mapDomainRoleToPrisma(role) },
    });

    return prismaUsers.map(
      (prismaUser) =>
        new User(
          prismaUser.id,
          prismaUser.telegramId,
          prismaUser.name,
          this.mapPrismaRoleToDomain(prismaUser.role),
          prismaUser.createdAt,
        ),
    );
  }
}
