"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPrisma = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
/**
 * Создаём пул подключений PostgreSQL
 */
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
/**
 * Создаём адаптер для Prisma
 */
const adapter = new adapter_pg_1.PrismaPg(pool);
/**
 * Глобальная переменная для хранения PrismaClient в режиме разработки
 */
const globalForPrisma = globalThis;
/**
 * Singleton экземпляр PrismaClient
 */
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
/**
 * Отключение Prisma Client при завершении приложения
 */
const disconnectPrisma = async () => {
    await exports.prisma.$disconnect();
};
exports.disconnectPrisma = disconnectPrisma;
//# sourceMappingURL=prisma.client.js.map