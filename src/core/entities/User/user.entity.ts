/**
 * @file user.entity.ts
 * @brief Entity пользователя.
 * 
 * Представляет пользователя в системе техподдержки.
 * Содержит идентификатор, имя, роль и дату создания.
 * 
 * @remarks
 * Это сущность доменного слоя, используется в логике приложения и сервисах.
 */
export enum ROLE {
  ADMIN,
  CLIENT,
}

/**
 * @class User
 * @brief Entity пользователя.
 */
export class User {
  /**
   * Создаёт нового пользователя.
   * 
   * @param id - Уникальный идентификатор пользователя.
   * @param telegramId - Идентификатор пользователя в Telegram.
   * @param name - Имя пользователя.
   * @param role - Роль пользователя в системе.
   * @param createAt - Дата создания пользователя.
   */
  constructor(
    readonly id: number,
    readonly telegramId: string,
    readonly name: string,
    readonly role: ROLE,
    readonly createAt: Date,
  ) {}
}
