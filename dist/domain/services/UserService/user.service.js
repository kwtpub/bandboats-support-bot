"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_entity_1 = require("../../entities/User/user.entity");
const errors_1 = require("../../errors");
/**
 * @class UserService
 * @brief Application Service для управления пользователями.
 */
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    /**
     * Создаёт нового пользователя в системе.
     *
     * @param telegramId - Telegram ID пользователя
     * @param name - Имя пользователя
     * @param role - Роль пользователя (по умолчанию CLIENT)
     * @returns Созданный пользователь
     * @throws Error если пользователь с таким Telegram ID уже существует
     */
    async createUser(telegramId, name, role = user_entity_1.ROLE.CLIENT) {
        // Проверяем, не существует ли уже пользователь с таким Telegram ID
        const existingUser = await this.userRepository.findByTelegramId(telegramId);
        if (existingUser) {
            throw new errors_1.ConflictError(`User with Telegram ID ${telegramId} already exists`, 'telegramId');
        }
        // Создаём новую доменную сущность
        // ID будет сгенерирован базой данных, поэтому используем null
        const user = new user_entity_1.User(null, // null означает, что ID будет сгенерирован БД
        telegramId, name, role, new Date());
        await this.userRepository.save(user);
        // Получаем сохранённого пользователя с правильным ID
        const savedUser = await this.userRepository.findByTelegramId(telegramId);
        if (!savedUser) {
            throw new Error('Failed to create user'); // Internal error
        }
        return savedUser;
    }
    /**
     * Получает пользователя по ID.
     *
     * @param userId - ID пользователя
     * @returns Пользователь или null если не найден
     */
    async getUserById(userId) {
        return this.userRepository.findById(userId);
    }
    /**
     * Получает пользователя по Telegram ID.
     *
     * @param telegramId - Telegram ID пользователя
     * @returns Пользователь или null если не найден
     */
    async getUserByTelegramId(telegramId) {
        return this.userRepository.findByTelegramId(telegramId);
    }
    /**
     * Получает или создаёт пользователя по Telegram ID.
     * Если пользователь не существует, создаёт нового с ролью CLIENT.
     *
     * @param telegramId - Telegram ID пользователя
     * @param name - Имя пользователя
     * @returns Существующий или новый пользователь
     */
    async getOrCreateUser(telegramId, name) {
        const existingUser = await this.userRepository.findByTelegramId(telegramId);
        if (existingUser) {
            return existingUser;
        }
        return this.createUser(telegramId, name, user_entity_1.ROLE.CLIENT);
    }
    /**
     * Обновляет имя пользователя.
     *
     * @param userId - ID пользователя
     * @param newName - Новое имя
     * @returns Обновлённый пользователь
     * @throws Error если пользователь не найден или имя невалидно
     */
    async updateUserName(userId, newName) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User', userId);
        }
        // Используем доменную логику для изменения имени (с валидацией)
        const updatedUser = user.changeName(newName);
        await this.userRepository.save(updatedUser);
        return updatedUser;
    }
    /**
     * Повышает пользователя до администратора.
     *
     * @param userId - ID пользователя
     * @returns Обновлённый пользователь
     * @throws Error если пользователь не найден или уже админ
     */
    async promoteToAdmin(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User', userId);
        }
        // Используем доменную логику для повышения роли
        const promotedUser = user.promoteToAdmin();
        await this.userRepository.save(promotedUser);
        return promotedUser;
    }
    /**
     * Понижает администратора до клиента.
     *
     * @param userId - ID пользователя
     * @returns Обновлённый пользователь
     * @throws Error если пользователь не найден или уже клиент
     */
    async demoteToClient(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User', userId);
        }
        // Используем доменную логику для понижения роли
        const demotedUser = user.demoteToClient();
        await this.userRepository.save(demotedUser);
        return demotedUser;
    }
    /**
     * Изменяет роль пользователя.
     *
     * @param userId - ID пользователя
     * @param newRole - Новая роль
     * @returns Обновлённый пользователь
     * @throws Error если пользователь не найден
     */
    async changeUserRole(userId, newRole) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User', userId);
        }
        // Используем доменную логику для изменения роли
        const updatedUser = user.changeRole(newRole);
        await this.userRepository.save(updatedUser);
        return updatedUser;
    }
    /**
     * Получает всех администраторов.
     *
     * @returns Массив пользователей с ролью ADMIN
     */
    async getAllAdmins() {
        return this.userRepository.findByRole(user_entity_1.ROLE.ADMIN);
    }
    /**
     * Получает всех клиентов.
     *
     * @returns Массив пользователей с ролью CLIENT
     */
    async getAllClients() {
        return this.userRepository.findByRole(user_entity_1.ROLE.CLIENT);
    }
    /**
     * Проверяет, может ли пользователь управлять тикетом.
     *
     * @param userId - ID пользователя
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может управлять тикетом
     * @throws Error если пользователь не найден
     */
    async canUserManageTicket(userId, ticket) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User', userId);
        }
        // Делегируем проверку доменной логике
        return user.canManageTicket(ticket);
    }
    /**
     * Проверяет, может ли пользователь закрыть тикет.
     *
     * @param userId - ID пользователя
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может закрыть тикет
     * @throws Error если пользователь не найден
     */
    async canUserCloseTicket(userId, ticket) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User', userId);
        }
        // Делегируем проверку доменной логике
        return user.canCloseTicket(ticket);
    }
    /**
     * Проверяет, может ли пользователь просматривать тикет.
     *
     * @param userId - ID пользователя
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может просматривать тикет
     * @throws Error если пользователь не найден
     */
    async canUserViewTicket(userId, ticket) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User', userId);
        }
        // Делегируем проверку доменной логике
        return user.canViewTicket(ticket);
    }
    /**
     * Проверяет, может ли пользователь добавлять сообщения в тикет.
     *
     * @param userId - ID пользователя
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может добавлять сообщения
     * @throws Error если пользователь не найден
     */
    async canUserAddMessageToTicket(userId, ticket) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User', userId);
        }
        // Делегируем проверку доменной логике
        return user.canAddMessageToTicket(ticket);
    }
    /**
     * Проверяет, является ли пользователь администратором.
     *
     * @param userId - ID пользователя
     * @returns true если пользователь администратор
     * @throws Error если пользователь не найден
     */
    async isUserAdmin(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User', userId);
        }
        return user.isAdmin();
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map