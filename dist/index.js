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
const errors_1 = require("./infrastructure/errors");
const bot_1 = require("./presentation/telegram/bot");
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
    // Шаг 2: Инициализация обработчика ошибок
    console.log('⚠️  Initializing error handler...');
    (0, errors_1.initializeErrorHandler)();
    console.log('✅ Error handler initialized');
    // Шаг 3: Настройка DI контейнера
    console.log('📦 Setting up Dependency Injection...');
    (0, di_1.setupContainer)();
    console.log('✅ Dependency Injection container configured');
    // Шаг 4: Получение сервисов
    const userService = (0, di_1.getService)('UserService');
    const ticketService = (0, di_1.getService)('TicketService');
    console.log('✅ Services resolved from DI container');
    console.log(`   - ${userService.constructor.name}`);
    console.log(`   - ${ticketService.constructor.name}`);
    // Шаг 5: Инициализация и запуск Telegram бота
    console.log('🤖 Initializing Telegram Bot...');
    const bot = (0, bot_1.createBot)(config.telegram.botToken, userService, ticketService);
    console.log('✅ Telegram Bot configured');
    console.log('🚀 Starting Telegram Bot...');
    await (0, bot_1.startBot)(bot);
    console.log('\n✅ Application ready!');
    console.log(`🤖 Bandboats Support Bot is running in ${config.nodeEnv} mode`);
    console.log(`📱 Bot is listening for messages...`);
}
// Запуск приложения
main().catch((error) => {
    console.error('❌ Application failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map