/**
 * @file user.repository.ts
 * @brief Репозиторий для работы с пользователями.
 *
 * Интерфейс определяет методы для сохранения, поиска и получения пользователей
 * в системе техподдержки.
 *
 * @remarks
 * Интерфейс находится в Application/Domain слое. Реализация методов выполняется
 * в Infrastructure слое.
 */
import { ROLE, User } from '../../../domain/entities/User/user.entity';
/**
 * @interface UserRepository
 * @brief Репозиторий пользователей.
 */
export interface UserRepository {
    /**
     * Сохраняет пользователя.
     *
     * @param user - Entity пользователя
     */
    save(user: User): Promise<void>;
    /**
     * Возвращает пользователя по идентификатору.
     *
     * @param id - Уникальный идентификатор пользователя
     * @return User или null, если не найден
     */
    findById(id: number): Promise<User | null>;
    /**
     * Возвращает пользователя по Telegram ID.
     *
     * @param telegramId - Идентификатор пользователя в Telegram
     * @return User или null, если не найден
     */
    findByTelegramId(telegramId: string): Promise<User | null>;
    /**
     * Возвращает всех пользователей с указанной ролью.
     *
     * @param role - Роль пользователя (ADMIN или CLIENT)
     * @return Массив пользователей
     */
    findByRole(role: ROLE): Promise<User[]>;
}
//# sourceMappingURL=user.repository.d.ts.map