"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.ROLE = void 0;
const errors_1 = require("../../errors");
var ROLE;
(function (ROLE) {
    ROLE[ROLE["ADMIN"] = 0] = "ADMIN";
    ROLE[ROLE["CLIENT"] = 1] = "CLIENT";
})(ROLE || (exports.ROLE = ROLE = {}));
/**
 * @class User
 * @brief Rich Domain Entity пользователя с бизнес-логикой.
 */
class User {
    /**
     * Создаёт нового пользователя.
     *
     * @param id - Уникальный идентификатор пользователя.
     * @param telegramId - Идентификатор пользователя в Telegram.
     * @param name - Имя пользователя.
     * @param role - Роль пользователя в системе.
     * @param createAt - Дата создания пользователя.
     */
    constructor(id, telegramId, name, role, createAt) {
        this.id = id;
        this.telegramId = telegramId;
        this.name = name;
        this.role = role;
        this.createAt = createAt;
        this.validateInvariants();
    }
    /**
     * Валидация инвариантов пользователя.
     * @throws Error если нарушены бизнес-правила
     */
    validateInvariants() {
        if (!this.name || this.name.trim().length === 0) {
            throw new errors_1.ValidationError('User name cannot be empty', 'name');
        }
        if (this.name.length > 100) {
            throw new errors_1.ValidationError('User name cannot exceed 100 characters', 'name', this.name.length);
        }
        if (!this.telegramId || this.telegramId.trim().length === 0) {
            throw new errors_1.ValidationError('Telegram ID cannot be empty', 'telegramId');
        }
        if (this.id <= 0) {
            throw new errors_1.ValidationError('Invalid user ID', 'id', this.id);
        }
    }
    /**
     * Проверяет, является ли пользователь администратором.
     *
     * @returns true если роль ADMIN
     */
    isAdmin() {
        return this.role === ROLE.ADMIN;
    }
    /**
     * Проверяет, является ли пользователь клиентом.
     *
     * @returns true если роль CLIENT
     */
    isClient() {
        return this.role === ROLE.CLIENT;
    }
    /**
     * Проверяет, имеет ли пользователь указанную роль.
     *
     * @param role - Роль для проверки
     * @returns true если пользователь имеет эту роль
     */
    hasRole(role) {
        return this.role === role;
    }
    /**
     * Проверяет, может ли пользователь управлять тикетом.
     * Админы могут управлять всеми тикетами.
     * Клиенты могут управлять только своими тикетами.
     *
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может управлять тикетом
     */
    canManageTicket(ticket) {
        if (this.isAdmin()) {
            return true;
        }
        return ticket.isAuthor(this.id) || ticket.isAssignedTo(this.id);
    }
    /**
     * Проверяет, может ли пользователь назначать тикеты.
     * Только админы могут назначать тикеты.
     *
     * @returns true если пользователь может назначать тикеты
     */
    canAssignTickets() {
        return this.isAdmin();
    }
    /**
     * Проверяет, может ли пользователь закрыть тикет.
     * Админы могут закрывать любые тикеты.
     * Клиенты могут закрывать только свои тикеты или назначенные им.
     *
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может закрыть тикет
     */
    canCloseTicket(ticket) {
        if (this.isAdmin()) {
            return true;
        }
        return ticket.canBeClosedBy(this.id);
    }
    /**
     * Проверяет, может ли пользователь просматривать тикет.
     * Админы видят все тикеты.
     * Клиенты видят только свои тикеты или назначенные им.
     *
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может просматривать тикет
     */
    canViewTicket(ticket) {
        if (this.isAdmin()) {
            return true;
        }
        return ticket.isAuthor(this.id) || ticket.isAssignedTo(this.id);
    }
    /**
     * Проверяет, может ли пользователь создавать тикеты.
     * Все пользователи могут создавать тикеты.
     *
     * @returns true всегда
     */
    canCreateTickets() {
        return true;
    }
    /**
     * Проверяет, может ли пользователь добавлять сообщения в тикет.
     * Админы могут добавлять сообщения в любые тикеты.
     * Клиенты могут добавлять сообщения только в свои тикеты или назначенные им.
     *
     * @param ticket - Тикет для проверки
     * @returns true если пользователь может добавлять сообщения
     */
    canAddMessageToTicket(ticket) {
        if (this.isAdmin()) {
            return true;
        }
        return ticket.isAuthor(this.id) || ticket.isAssignedTo(this.id);
    }
    /**
     * Проверяет, может ли пользователь переоткрыть тикет.
     * Только админы могут переоткрывать закрытые тикеты.
     *
     * @returns true если пользователь может переоткрывать тикеты
     */
    canReopenTickets() {
        return this.isAdmin();
    }
    /**
     * Изменяет роль пользователя.
     * Возвращает новый экземпляр User с обновлённой ролью.
     *
     * @param newRole - Новая роль
     * @returns Новый экземпляр User с обновлённой ролью
     */
    changeRole(newRole) {
        return new User(this.id, this.telegramId, this.name, newRole, this.createAt);
    }
    /**
     * Обновляет имя пользователя.
     * Возвращает новый экземпляр User с обновлённым именем.
     *
     * @param newName - Новое имя
     * @returns Новый экземпляр User с обновлённым именем
     * @throws Error если имя невалидно
     */
    changeName(newName) {
        if (!newName || newName.trim().length === 0) {
            throw new errors_1.ValidationError('User name cannot be empty', 'name');
        }
        if (newName.length > 100) {
            throw new errors_1.ValidationError('User name cannot exceed 100 characters', 'name', newName.length);
        }
        return new User(this.id, this.telegramId, newName, this.role, this.createAt);
    }
    /**
     * Повышает клиента до администратора.
     *
     * @returns Новый экземпляр User с ролью ADMIN
     * @throws Error если пользователь уже админ
     */
    promoteToAdmin() {
        if (this.isAdmin()) {
            throw new errors_1.BusinessRuleViolationError('User is already an admin', 'promotion');
        }
        return this.changeRole(ROLE.ADMIN);
    }
    /**
     * Понижает администратора до клиента.
     *
     * @returns Новый экземпляр User с ролью CLIENT
     * @throws Error если пользователь уже клиент
     */
    demoteToClient() {
        if (this.isClient()) {
            throw new errors_1.BusinessRuleViolationError('User is already a client', 'demotion');
        }
        return this.changeRole(ROLE.CLIENT);
    }
    /**
     * Возвращает строковое представление роли.
     *
     * @returns Название роли
     */
    getRoleName() {
        return this.role === ROLE.ADMIN ? 'Administrator' : 'Client';
    }
    /**
     * Проверяет, совпадает ли ID с данным пользователем.
     *
     * @param userId - ID для проверки
     * @returns true если ID совпадает
     */
    hasId(userId) {
        return this.id === userId;
    }
    /**
     * Проверяет равенство двух пользователей по ID.
     *
     * @param other - Другой пользователь
     * @returns true если пользователи имеют одинаковый ID
     */
    equals(other) {
        return this.id === other.id;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map