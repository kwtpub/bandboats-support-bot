/**
 * @file container.ts
 * @brief Настройка Dependency Injection контейнера.
 *
 * Конфигурирует и регистрирует все зависимости приложения:
 * - Repositories (инфраструктура)
 * - Services (доменные сервисы)
 * - Database clients
 *
 * @remarks
 * Использует tsyringe для управления зависимостями.
 * Все зависимости регистрируются как синглтоны для эффективного использования ресурсов.
 */
import 'reflect-metadata';
import { container } from 'tsyringe';
/**
 * Регистрирует все зависимости в DI контейнере.
 */
export declare function setupContainer(): void;
/**
 * Получает экземпляр зависимости из контейнера.
 *
 * @param token - Токен зависимости
 * @returns Экземпляр зависимости
 */
export declare function getService<T>(token: string): T;
/**
 * Экспортируем контейнер для прямого использования при необходимости.
 */
export { container };
//# sourceMappingURL=container.d.ts.map