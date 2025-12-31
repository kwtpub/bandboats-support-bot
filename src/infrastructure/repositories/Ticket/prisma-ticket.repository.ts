/**
 * @file prisma-ticket.repository.ts
 * @brief Реализация TicketRepository с использованием Prisma ORM.
 * 
 * Реализует интерфейс TicketRepository для работы с тикетами
 * через Prisma Client и PostgreSQL.
 * 
 * @remarks
 * Это Infrastructure слой - конкретная реализация репозитория.
 */

import { PrismaClient, TicketStatus as PrismaTicketStatus } from '@prisma/client';
import { TicketRepository } from '../../../core/repositories/Ticket/ticket.repository';
import { Ticket, TicketStatus } from '../../../domain/entities/Ticket/ticket.entity';
import { TicketMessage } from '../../../domain/entities/Ticket/ticketMessage.entity';
import { prisma } from '../../database/prisma.client';

/**
 * @class PrismaTicketRepository
 * @brief Реализация TicketRepository через Prisma ORM.
 */
export class PrismaTicketRepository implements TicketRepository {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient = prisma) {
    this.prismaClient = prismaClient;
  }

  /**
   * Маппинг Prisma TicketStatus в доменный TicketStatus
   */
  private mapPrismaStatusToDomain(prismaStatus: PrismaTicketStatus): TicketStatus {
    switch (prismaStatus) {
      case PrismaTicketStatus.OPEN:
        return TicketStatus.OPEN;
      case PrismaTicketStatus.IN_PROGRESS:
        return TicketStatus.IN_PROGRESS;
      case PrismaTicketStatus.CLOSE:
        return TicketStatus.CLOSE;
    }
  }

  /**
   * Маппинг доменного TicketStatus в Prisma TicketStatus
   */
  private mapDomainStatusToPrisma(domainStatus: TicketStatus): PrismaTicketStatus {
    switch (domainStatus) {
      case TicketStatus.OPEN:
        return PrismaTicketStatus.OPEN;
      case TicketStatus.IN_PROGRESS:
        return PrismaTicketStatus.IN_PROGRESS;
      case TicketStatus.CLOSE:
        return PrismaTicketStatus.CLOSE;
    }
  }

  /**
   * Сохраняет тикет в базе данных.
   * Если тикет с таким ID существует - обновляет, иначе создаёт новый.
   */
  async save(ticket: Ticket): Promise<void> {
    await this.prismaClient.ticket.upsert({
      where: { id: ticket.id },
      update: {
        authorId: ticket.authorId,
        assigneeId: ticket.assigneeId,
        title: ticket.title,
        status: this.mapDomainStatusToPrisma(ticket.status),
      },
      create: {
        id: ticket.id,
        authorId: ticket.authorId,
        assigneeId: ticket.assigneeId,
        title: ticket.title,
        status: this.mapDomainStatusToPrisma(ticket.status),
      },
    });
  }

  /**
   * Находит тикет по ID вместе со всеми сообщениями.
   */
  async findById(id: number): Promise<Ticket | null> {
    const prismaTicket = await this.prismaClient.ticket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!prismaTicket) {
      return null;
    }

    const messages = prismaTicket.messages.map(
      (msg) =>
        new TicketMessage(
          msg.id,
          msg.ticketId,
          msg.authorId,
          msg.content,
          msg.createdAt,
        ),
    );

    return new Ticket(
      prismaTicket.id,
      prismaTicket.authorId,
      prismaTicket.assigneeId ?? 0,
      prismaTicket.title,
      messages,
      this.mapPrismaStatusToDomain(prismaTicket.status),
    );
  }

  /**
   * Находит все тикеты автора с сообщениями.
   */
  async findByAuthorId(authorId: number): Promise<Ticket[]> {
    const prismaTickets = await this.prismaClient.ticket.findMany({
      where: { authorId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prismaTickets.map((prismaTicket) => {
      const messages = prismaTicket.messages.map(
        (msg) =>
          new TicketMessage(
            msg.id,
            msg.ticketId,
            msg.authorId,
            msg.content,
            msg.createdAt,
          ),
      );

      return new Ticket(
        prismaTicket.id,
        prismaTicket.authorId,
        prismaTicket.assigneeId ?? 0,
        prismaTicket.title,
        messages,
        this.mapPrismaStatusToDomain(prismaTicket.status),
      );
    });
  }
}
