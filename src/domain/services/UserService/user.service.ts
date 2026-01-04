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
import { NotFoundError, ConflictError } from '../../errors';

/**
 * @class UserService
 * @brief Application Service для управления пользователями.
 */
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Создаёт нового пользователя в системе.
   *
   * @param telegramId - Telegram ID пользователя
   * @param name - Имя пользователя
   * @param role - Роль пользователя (по умолчанию CLIENT)
   * @returns Созданный пользователь
   * @throws Error если пользователь с таким Telegram ID уже существует
   */
  async createUser(telegramId: string, name: string, role: ROLE = ROLE.CLIENT): Promise<User> {
    // Проверяем, не существует ли уже пользователь с таким Telegram ID
    const existingUser = await this.userRepository.findByTelegramId(telegramId);
    if (existingUser) {
      throw new ConflictError(`User with Telegram ID ${telegramId} already exists`, 'telegramId');
    }

    // Создаём новую доменную сущность
    // ID будет сгенерирован базой данных, поэтому используем null
    const user = new User(
      null, // null означает, что ID будет сгенерирован БД
      telegramId,
      name,
      role,
      new Date(),
    );

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
  async getUserById(userId: number): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  /**
   * Получает пользователя по Telegram ID.
   *
   * @param telegramId - Telegram ID пользователя
   * @returns Пользователь или null если не найден
   */
  async getUserByTelegramId(telegramId: string): Promise<User | null> {
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
  async getOrCreateUser(telegramId: string, name: string): Promise<User> {
    const existingUser = await this.userRepository.findByTelegramId(telegramId);
    if (existingUser) {
      return existingUser;
    }

    return this.createUser(telegramId, name, ROLE.CLIENT);
  }

  /**
   * Обновляет имя пользователя.
   *
   * @param userId - ID пользователя
   * @param newName - Новое имя
   * @returns Обновлённый пользователь
   * @throws Error если пользователь не найден или имя невалидно
   */
  async updateUserName(userId: number, newName: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
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
  async promoteToAdmin(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
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
  async demoteToClient(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
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
  async changeUserRole(userId: number, newRole: ROLE): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
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
  async getAllAdmins(): Promise<User[]> {
    return this.userRepository.findByRole(ROLE.ADMIN);
  }

  /**
   * Получает всех клиентов.
   *
   * @returns Массив пользователей с ролью CLIENT
   */
  async getAllClients(): Promise<User[]> {
    return this.userRepository.findByRole(ROLE.CLIENT);
  }

  /**
   * Проверяет, может ли пользователь управлять тикетом.
   *
   * @param userId - ID пользователя
   * @param ticket - Тикет для проверки
   * @returns true если пользователь может управлять тикетом
   * @throws Error если пользователь не найден
   */
  async canUserManageTicket(userId: number, ticket: Ticket): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
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
  async canUserCloseTicket(userId: number, ticket: Ticket): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
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
  async canUserViewTicket(userId: number, ticket: Ticket): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
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
  async canUserAddMessageToTicket(userId: number, ticket: Ticket): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
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
  async isUserAdmin(userId: number): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user.isAdmin();
  }
}
