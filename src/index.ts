/**
 * @file index.ts
 * @brief Точка входа приложения.
 *
 * Инициализирует Dependency Injection контейнер и запускает приложение.
 *
 * @remarks
 * Этот файл должен быть первым, что запускается в приложении.
 * Он настраивает все зависимости перед запуском основной логики.
 */

import 'reflect-metadata';
import { setupContainer, getService } from './infrastructure/di';
import { UserService } from './domain/services/UserService/user.service';
import { TicketService } from './domain/services/TicketService/ticket.service';

/**
 * Главная функция приложения.
 */
async function main(): Promise<void> {
  console.log('🚀 Initializing Bandboats Support Bot...');

  // Настройка DI контейнера
  setupContainer();
  console.log('✅ Dependency Injection container configured');

  // Пример использования сервисов через DI
  const userService = getService<UserService>('UserService');
  const ticketService = getService<TicketService>('TicketService');

  console.log('✅ Services resolved from DI container');
  console.log('📦 UserService:', userService.constructor.name);
  console.log('📦 TicketService:', ticketService.constructor.name);

  // TODO: Здесь будет инициализация Telegram бота
  console.log('⏳ Telegram Bot initialization pending...');

  console.log('✅ Application ready!');
}

// Запуск приложения
main().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
