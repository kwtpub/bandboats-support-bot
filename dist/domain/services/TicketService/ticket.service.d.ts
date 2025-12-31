import { TicketRepository } from '../../repositories/Ticket/ticket.repository';
import { TicketMessageRepository } from '../../repositories/Ticket/ticketMessage.repository';
import { UserRepository } from '../../repositories/User/user.repository';
export declare class TicketService {
    private readonly ticketRepository;
    private readonly ticketMessageRepository;
    private readonly userRepository;
    constructor(ticketRepository: TicketRepository, ticketMessageRepository: TicketMessageRepository, userRepository: UserRepository);
}
//# sourceMappingURL=ticket.service.d.ts.map