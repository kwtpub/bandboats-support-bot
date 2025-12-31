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

import 'reflect-metadata';
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

// Database
import { prisma } from '../database/prisma.client';

// Repositories
import { UserRepository } from '../../domain/repositories/User/user.repository';
import { TicketRepository } from '../../domain/repositories/Ticket/ticket.repository';
import { TicketMessageRepository } from '../../domain/repositories/Ticket/ticketMessage.repository';
import { PrismaUserRepository } from '../repositories/User/prisma-user.repository';
import { PrismaTicketRepository } from '../repositories/Ticket/prisma-ticket.repository';
import { PrismaTicketMessageRepository } from '../repositories/Ticket/prisma-ticket-message.repository';

// Services
import { UserService } from '../../domain/services/UserService/user.service';
import { TicketService } from '../../domain/services/TicketService/ticket.service';

/**
 * Регистрирует все зависимости в DI контейнере.
 */
export function setupContainer(): void {
  // Регистрация Prisma Client как синглтон
  container.registerInstance<PrismaClient>('PrismaClient', prisma);

  // Регистрация репозиториев
  container.registerSingleton<UserRepository>(
    'UserRepository',
    PrismaUserRepository,
  );

  container.registerSingleton<TicketRepository>(
    'TicketRepository',
    PrismaTicketRepository,
  );

  container.registerSingleton<TicketMessageRepository>(
    'TicketMessageRepository',
    PrismaTicketMessageRepository,
  );

  // Регистрация сервисов
  container.register<UserService>('UserService', {
    useFactory: (c) => {
      return new UserService(c.resolve<UserRepository>('UserRepository'));
    },
  });

  container.register<TicketService>('TicketService', {
    useFactory: (c) => {
      return new TicketService(
        c.resolve<TicketRepository>('TicketRepository'),
        c.resolve<TicketMessageRepository>('TicketMessageRepository'),
        c.resolve<UserRepository>('UserRepository'),
      );
    },
  });
}

/**
 * Получает экземпляр зависимости из контейнера.
 *
 * @param token - Токен зависимости
 * @returns Экземпляр зависимости
 */
export function getService<T>(token: string): T {
  return container.resolve<T>(token);
}

/**
 * Экспортируем контейнер для прямого использования при необходимости.
 */
export { container };
