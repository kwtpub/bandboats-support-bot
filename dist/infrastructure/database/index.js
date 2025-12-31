"use strict";
/**
 * @file index.ts
 * @brief Экспорт Prisma Client и утилит для работы с БД.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPrisma = exports.prisma = void 0;
var prisma_client_1 = require("./prisma.client");
Object.defineProperty(exports, "prisma", { enumerable: true, get: function () { return prisma_client_1.prisma; } });
Object.defineProperty(exports, "disconnectPrisma", { enumerable: true, get: function () { return prisma_client_1.disconnectPrisma; } });
//# sourceMappingURL=index.js.map