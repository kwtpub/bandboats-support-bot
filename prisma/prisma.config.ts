/**
 * @file prisma.config.ts
 * @brief Конфигурация Prisma для версии 7.x
 *
 * В Prisma 7 конфигурация datasource URL вынесена в отдельный файл.
 */

import { defineConfig } from '@prisma/client/runtime/config';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
