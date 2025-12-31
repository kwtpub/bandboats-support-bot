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
import { initializeConfig } from './infrastructure/config';
import { setupContainer, getService } from './infrastructure/di';
import { initializeErrorHandler } from './infrastructure/errors';
import { UserService } from './domain/services/UserService/user.service';
import { TicketService } from './domain/services/TicketService/ticket.service';
import { createBot, startBot } from './presentation/telegram/bot';

/**
 * Главная функция приложения.
 */
async function main(): Promise<void> {
  console.log('🚀 Initializing Bandboats Support Bot...');

  // Шаг 1: Загрузка и валидация конфигурации
  console.log('📋 Loading configuration...');
  const config = initializeConfig();
  console.log(`✅ Configuration loaded (${config.nodeEnv} mode)`);
  console.log(`   - Database: ${config.database.url.split('@')[1] || 'configured'}`);
  console.log(`   - Log Level: ${config.logging.level}`);
  console.log(`   - Port: ${config.port}`);

  // Шаг 2: Инициализация обработчика ошибок
  console.log('⚠️  Initializing error handler...');
  initializeErrorHandler();
  console.log('✅ Error handler initialized');

  // Шаг 3: Настройка DI контейнера
  console.log('📦 Setting up Dependency Injection...');
  setupContainer();
  console.log('✅ Dependency Injection container configured');

  // Шаг 4: Получение сервисов
  const userService = getService<UserService>('UserService');
  const ticketService = getService<TicketService>('TicketService');
  console.log('✅ Services resolved from DI container');
  console.log(`   - ${userService.constructor.name}`);
  console.log(`   - ${ticketService.constructor.name}`);

  // Шаг 5: Инициализация и запуск Telegram бота
  console.log('🤖 Initializing Telegram Bot...');
  const bot = createBot(config.telegram.botToken, userService, ticketService);
  console.log('✅ Telegram Bot configured');

  console.log('🚀 Starting Telegram Bot...');
  await startBot(bot);

  console.log('\n✅ Application ready!');
  console.log(`🤖 Bandboats Support Bot is running in ${config.nodeEnv} mode`);
  console.log(`📱 Bot is listening for messages...`);
}

// Запуск приложения
main().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
