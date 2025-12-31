"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
class TicketService {
    constructor(ticketRepository, ticketMessageRepository, userRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketMessageRepository = ticketMessageRepository;
        this.userRepository = userRepository;
    }
}
exports.TicketService = TicketService;
//# sourceMappingURL=ticket.service.js.map