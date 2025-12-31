import { TicketRepository } from '../../repositories/Ticket/ticket.repository';
import { TicketMessageRepository } from '../../repositories/Ticket/ticketMessage.repository';
import { UserRepository } from '../../repositories/User/user.repository';

export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly ticketMessageRepository: TicketMessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // Методы будут реализованы позже
}
