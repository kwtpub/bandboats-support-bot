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
 */
import { PrismaClient } from '@prisma/client';
/**
 * Singleton экземпляр PrismaClient
 */
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/client").DefaultArgs>;
/**
 * Отключение Prisma Client при завершении приложения
 */
export declare const disconnectPrisma: () => Promise<void>;
//# sourceMappingURL=prisma.client.d.ts.map