/**
 * @file user.service.ts
 * @brief Application Service для управления пользователями.
 *
 * Содержит бизнес-логику и use cases для работы с пользователями
 * в системе техподдержки.
 *
 * @remarks
 * Этот сервис координирует операции между доменным слоем и слоем инфраструктуры.
 * Использует Rich Domain Model (User entity) для бизнес-логики.
 */
import { User, ROLE } from '../../entities/User/user.entity';
import { UserRepository } from '../../repositories/User/user.repository';
import { Ticket } from '../../entities/Ticket/ticket.entity';
/**
 * @class UserService
 * @brief Application Service для управления пользователями.
 */
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    /**
     * Создаёт нового пользователя в системе.
     *
     * @param telegramId - Telegram ID пользователя
     * @param name - Имя пользователя
     * @param role - Роль пользователя (по умолчанию CLIENT)
     * @returns Созданный пользователь
     * @throws Error если пользователь с таким Telegram ID уже существует
     */
    createUser(telegramId: string, name: string, role?: ROLE): Promise<User>;
    /**
     * Получает пользователя по ID.
     *
     * @param userId - ID пользователя
     * @returns Пользователь или null если не найден
     */
    getUserById(userId: number): Promise<User | null>;
    /**
     * Получает пользователя по Telegram ID.
     *
     * @param telegramId - Telegram ID пользователя
     * @returns Пользователь или null если не найден
     */
    getUserByTelegramId(telegramId: string): Promise<User | null>;
    /**
     * Получает или создаёт пользователя по Telegram ID.
     * Если пользователь не существует, создаёт нового с ролью CLIENT.
     *
     * @param telegramId - Telegram ID пользователя
     * @param name - Имя пользователя
     * @returns Существующий или новый пользователь
     */
    getOrCreateUser(telegramId: string, name: string): Promise<User>;
    /**
     * Обновляет имя пользователя.
     *
     * @param userId - ID пользователя
     * @param newName - Новое имя
     * @returns Обновлённый пользователь
     * @throws Error если пользователь не найден или имя невалидно
     */
    updateUserName(userId: number, newName: string): Promise<User>;
    /**
     * Повышает пользователя до администратора.
     *
     * @param userId - ID пользователя
     * @returns Обновлённый пользователь
     * @throws Error если пользователь не найден или уже админ
     */
    promoteToAdmin(userId: number): Promise<User>;
    /**
     * Понижает администратора до клиента.
     *
     * @param userId - ID пользователя
     * @returns Обновлённый пользователь
     * @throws Error если пользователь не найден или уже клиент
     */
    demoteToClient(userId: number): Promise<User>;
    /**
     * Изменяет роль пользователя.
     *
     * @param userId - ID пользователя
     * @param newRole - Новая роль
     * @returns Обновлённый пользователь
     * @throws Error если пользователь не найден
     */
    changeUserRole(userId: number, newRole: ROLE): Promise<User>;
    /**
     * Получает всех администраторов.
     *
     * @returns Массив пользователей с ролью ADMIN
     */
    getAllAdmins(): Promise<User[]>;
    /**
     * Получает всех клиентов.
     *
     * @returns Массив пользователей с ролью CLIENT
     */
    getAllClients(): Promise<User[]>;
    /**
     * Проверяет, может ли пользователь управлять тикетом.
     *
     * @param userId - ID пользователя
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может управлять тикетом
     * @throws Error если пользователь не найден
     */
    canUserManageTicket(userId: number, ticket: Ticket): Promise<boolean>;
    /**
     * Проверяет, может ли пользователь закрыть тикет.
     *
     * @param userId - ID пользователя
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может закрыть тикет
     * @throws Error если пользователь не найден
     */
    canUserCloseTicket(userId: number, ticket: Ticket): Promise<boolean>;
    /**
     * Проверяет, может ли пользователь просматривать тикет.
     *
     * @param userId - ID пользователя
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может просматривать тикет
     * @throws Error если пользователь не найден
     */
    canUserViewTicket(userId: number, ticket: Ticket): Promise<boolean>;
    /**
     * Проверяет, может ли пользователь добавлять сообщения в тикет.
     *
     * @param userId - ID пользователя
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может добавлять сообщения
     * @throws Error если пользователь не найден
     */
    canUserAddMessageToTicket(userId: number, ticket: Ticket): Promise<boolean>;
    /**
     * Проверяет, является ли пользователь администратором.
     *
     * @param userId - ID пользователя
     * @returns true если пользователь администратор
     * @throws Error если пользователь не найден
     */
    isUserAdmin(userId: number): Promise<boolean>;
}
//# sourceMappingURL=user.service.d.ts.map