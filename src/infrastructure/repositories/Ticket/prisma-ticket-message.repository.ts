/**
 * @file prisma-ticket-message.repository.ts
 * @brief Реализация TicketMessageRepository с использованием Prisma ORM.
 *
 * Реализует интерфейс TicketMessageRepository для работы с сообщениями тикетов
 * через Prisma Client и PostgreSQL.
 *
 * @remarks
 * Это Infrastructure слой - конкретная реализация репозитория.
 */

import { PrismaClient } from '@prisma/client';
import { TicketMessageRepository } from '../../../domain/repositories/Ticket/ticketMessage.repository';
import { TicketMessage } from '../../../domain/entities/Ticket/ticketMessage.entity';
import { prisma } from '../../database/prisma.client';

/**
 * @class PrismaTicketMessageRepository
 * @brief Реализация TicketMessageRepository через Prisma ORM.
 */
export class PrismaTicketMessageRepository implements TicketMessageRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prismaClient = prismaClient;
  }

  /**
   * Сохраняет сообщение тикета в базе данных.
   * Если сообщение с таким ID существует - обновляет, иначе создаёт новое.
   */
  async save(message: TicketMessage): Promise<void> {
    await this.prismaClient.ticketMessage.upsert({
      where: { id: message.id },
      update: {
        ticketId: message.ticketId,
        authorId: message.authorId,
        content: message.content,
      },
      create: {
        id: message.id,
        ticketId: message.ticketId,
        authorId: message.authorId,
        content: message.content,
        createdAt: message.createAt,
      },
    });
  }

  /**
   * Находит сообщение по ID.
   */
  async findById(id: number): Promise<TicketMessage | null> {
    const prismaMessage = await this.prismaClient.ticketMessage.findUnique({
      where: { id },
    });

    if (!prismaMessage) {
      return null;
    }

    return new TicketMessage(
      prismaMessage.id,
      prismaMessage.ticketId,
      prismaMessage.authorId,
      prismaMessage.content,
      prismaMessage.createdAt,
    );
  }

  /**
   * Находит все сообщения тикета, отсортированные по дате создания.
   */
  async findByTicketId(ticketId: number): Promise<TicketMessage[]> {
    const prismaMessages = await this.prismaClient.ticketMessage.findMany({
      where: { ticketId },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return prismaMessages.map(
      (prismaMessage) =>
        new TicketMessage(
          prismaMessage.id,
          prismaMessage.ticketId,
          prismaMessage.authorId,
          prismaMessage.content,
          prismaMessage.createdAt,
        ),
    );
  }
}
