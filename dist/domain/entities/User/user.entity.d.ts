/**
 * @file user.entity.ts
 * @brief Rich Domain Entity пользователя с бизнес-логикой.
 *
 * Представляет пользователя в системе техподдержки как Rich Domain Model.
 * Содержит бизнес-правила и логику проверки прав доступа.
 *
 * @remarks
 * Это сущность доменного слоя с инкапсулированной бизнес-логикой.
 */
import { Ticket } from '../Ticket/ticket.entity';
export declare enum ROLE {
    ADMIN = 0,
    CLIENT = 1
}
/**
 * @class User
 * @brief Rich Domain Entity пользователя с бизнес-логикой.
 */
export declare class User {
    readonly id: number | null;
    readonly telegramId: string;
    readonly name: string;
    readonly role: ROLE;
    readonly createAt: Date;
    /**
     * Создаёт нового пользователя.
     *
     * @param id - Уникальный идентификатор пользователя (null для новых пользователей).
     * @param telegramId - Идентификатор пользователя в Telegram.
     * @param name - Имя пользователя.
     * @param role - Роль пользователя в системе.
     * @param createAt - Дата создания пользователя.
     */
    constructor(id: number | null, telegramId: string, name: string, role: ROLE, createAt: Date);
    /**
     * Валидация инвариантов пользователя.
     * @throws Error если нарушены бизнес-правила
     */
    private validateInvariants;
    /**
     * Проверяет, является ли пользователь администратором.
     *
     * @returns true если роль ADMIN
     */
    isAdmin(): boolean;
    /**
     * Проверяет, является ли пользователь клиентом.
     *
     * @returns true если роль CLIENT
     */
    isClient(): boolean;
    /**
     * Проверяет, имеет ли пользователь указанную роль.
     *
     * @param role - Роль для проверки
     * @returns true если пользователь имеет эту роль
     */
    hasRole(role: ROLE): boolean;
    /**
     * Проверяет, может ли пользователь управлять тикетом.
     * Админы могут управлять всеми тикетами.
     * Клиенты могут управлять только своими тикетами.
     *
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может управлять тикетом
     */
    canManageTicket(ticket: Ticket): boolean;
    /**
     * Проверяет, может ли пользователь назначать тикеты.
     * Только админы могут назначать тикеты.
     *
     * @returns true если пользователь может назначать тикеты
     */
    canAssignTickets(): boolean;
    /**
     * Проверяет, может ли пользователь закрыть тикет.
     * Админы могут закрывать любые тикеты.
     * Клиенты могут закрывать только свои тикеты или назначенные им.
     *
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может закрыть тикет
     */
    canCloseTicket(ticket: Ticket): boolean;
    /**
     * Проверяет, может ли пользователь просматривать тикет.
     * Админы видят все тикеты.
     * Клиенты видят только свои тикеты или назначенные им.
     *
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может просматривать тикет
     */
    canViewTicket(ticket: Ticket): boolean;
    /**
     * Проверяет, может ли пользователь создавать тикеты.
     * Все пользователи могут создавать тикеты.
     *
     * @returns true всегда
     */
    canCreateTickets(): boolean;
    /**
     * Проверяет, может ли пользователь добавлять сообщения в тикет.
     * Админы могут добавлять сообщения в любые тикеты.
     * Клиенты могут добавлять сообщения только в свои тикеты или назначенные им.
     *
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может добавлять сообщения
     */
    canAddMessageToTicket(ticket: Ticket): boolean;
    /**
     * Проверяет, может ли пользователь переоткрыть тикет.
     * Только админы могут переоткрывать закрытые тикеты.
     *
     * @returns true если пользователь может переоткрывать тикеты
     */
    canReopenTickets(): boolean;
    /**
     * Изменяет роль пользователя.
     * Возвращает новый экземпляр User с обновлённой ролью.
     *
     * @param newRole - Новая роль
     * @returns Новый экземпляр User с обновлённой ролью
     */
    changeRole(newRole: ROLE): User;
    /**
     * Обновляет имя пользователя.
     * Возвращает новый экземпляр User с обновлённым именем.
     *
     * @param newName - Новое имя
     * @returns Новый экземпляр User с обновлённым именем
     * @throws Error если имя невалидно
     */
    changeName(newName: string): User;
    /**
     * Повышает клиента до администратора.
     *
     * @returns Новый экземпляр User с ролью ADMIN
     * @throws Error если пользователь уже админ
     */
    promoteToAdmin(): User;
    /**
     * Понижает администратора до клиента.
     *
     * @returns Новый экземпляр User с ролью CLIENT
     * @throws Error если пользователь уже клиент
     */
    demoteToClient(): User;
    /**
     * Возвращает строковое представление роли.
     *
     * @returns Название роли
     */
    getRoleName(): string;
    /**
     * Проверяет, совпадает ли ID с данным пользователем.
     *
     * @param userId - ID для проверки
     * @returns true если ID совпадает
     */
    hasId(userId: number): boolean;
    /**
     * Проверяет равенство двух пользователей по ID.
     *
     * @param other - Другой пользователь
     * @returns true если пользователи имеют одинаковый ID
     */
    equals(other: User): boolean;
    /**
     * Получает ID пользователя. Бросает ошибку если пользователь не сохранён в БД.
     *
     * @returns ID пользователя
     * @throws Error если ID равен null
     */
    getId(): number;
    /**
     * Проверяет, сохранён ли пользователь в БД.
     *
     * @returns true если пользователь имеет ID
     */
    isPersisted(): boolean;
}
//# sourceMappingURL=user.entity.d.ts.map