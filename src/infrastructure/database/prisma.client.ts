/**
 * @file prisma.client.ts
 * @brief Singleton для Prisma Client.
 *
 * Создаёт единственный экземпляр PrismaClient для всего приложения,
 * предотвращая создание множественных подключений к базе данных.
 *
 * @remarks
 * В режиме разработки использует глобальную переменную для сохранения
 * экземпляра между hot-reload.
 * Использует @prisma/adapter-pg для Prisma 7.x
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * Создаём пул подключений PostgreSQL
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Создаём адаптер для Prisma
 */
const adapter = new PrismaPg(pool);

/**
 * Глобальная переменная для хранения PrismaClient в режиме разработки
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton экземпляр PrismaClient
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Отключение Prisma Client при завершении приложения
 */
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
};
