"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const config_1 = require("./infrastructure/config");
const di_1 = require("./infrastructure/di");
/**
 * Главная функция приложения.
 */
async function main() {
    console.log('🚀 Initializing Bandboats Support Bot...');
    // Шаг 1: Загрузка и валидация конфигурации
    console.log('📋 Loading configuration...');
    const config = (0, config_1.initializeConfig)();
    console.log(`✅ Configuration loaded (${config.nodeEnv} mode)`);
    console.log(`   - Database: ${config.database.url.split('@')[1] || 'configured'}`);
    console.log(`   - Log Level: ${config.logging.level}`);
    console.log(`   - Port: ${config.port}`);
    // Шаг 2: Настройка DI контейнера
    console.log('📦 Setting up Dependency Injection...');
    (0, di_1.setupContainer)();
    console.log('✅ Dependency Injection container configured');
    // Шаг 3: Проверка сервисов
    const userService = (0, di_1.getService)('UserService');
    const ticketService = (0, di_1.getService)('TicketService');
    console.log('✅ Services resolved from DI container');
    console.log(`   - ${userService.constructor.name}`);
    console.log(`   - ${ticketService.constructor.name}`);
    // TODO: Шаг 4: Инициализация Telegram бота
    console.log('⏳ Telegram Bot initialization pending...');
    console.log(`   Bot Token: ${config.telegram.botToken.substring(0, 10)}...`);
    console.log('\n✅ Application ready!');
    console.log(`🤖 Bandboats Support Bot is running in ${config.nodeEnv} mode`);
}
// Запуск приложения
main().catch((error) => {
    console.error('❌ Application failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map