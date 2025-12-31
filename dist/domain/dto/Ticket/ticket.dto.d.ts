export interface CreateTicketDto {
    authorId: number;
    title: string;
    content: string;
}
export interface AssignTicketDto {
    ticketId: number;
    assigneeId: number;
}
export interface CloseTicketDto {
    ticketId: number;
}
//# sourceMappingURL=ticket.dto.d.ts.map