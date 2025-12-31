# Конфигурация приложения

## Обзор

Приложение использует переменные окружения для конфигурации. Все переменные загружаются из файла `.env` и валидируются при старте.

## Быстрый старт

1. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Откройте `.env` и заполните необходимые значения:
   - `DATABASE_URL` - строка подключения к PostgreSQL
   - `BOT_TOKEN` - токен Telegram бота от @BotFather

3. Запустите приложение:
   ```bash
   npm start
   ```

## Переменные окружения

### Обязательные переменные

#### `DATABASE_URL`
Строка подключения к PostgreSQL базе данных.

**Формат:**
```
postgresql://[USER[:PASSWORD]@][HOST][:PORT]/DATABASE[?schema=SCHEMA]
```

**Примеры:**
```bash
# Локальная база без пароля
DATABASE_URL="postgresql://myuser@localhost:5432/bandboats_support?schema=public"

# Локальная база с паролем
DATABASE_URL="postgresql://myuser:mypass@localhost:5432/bandboats_support?schema=public"

# Удалённая база
DATABASE_URL="postgresql://user:pass@db.example.com:5432/bandboats_support?schema=public"
```

**Валидация:**
- Должна начинаться с `postgresql://`
- Проверяется при старте приложения

---

#### `BOT_TOKEN`
Токен Telegram бота, полученный от @BotFather.

**Как получить:**
1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям
4. Скопируйте предоставленный токен

**Формат:**
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Валидация:**
- Должен содержать двоеточие (`:`)
- Минимальная длина: 20 символов
- Не должен быть равен `your_telegram_bot_token_here`

---

### Опциональные переменные

#### `NODE_ENV`
Окружение приложения.

**Допустимые значения:**
- `development` - режим разработки (по умолчанию)
- `production` - продакшн режим
- `test` - тестовый режим

**Влияние:**
- В `development`: подробные логи, stack traces в ошибках
- В `production`: минимальные логи, скрытие деталей ошибок

**По умолчанию:** `development`

---

#### `LOG_LEVEL`
Уровень детализации логирования.

**Допустимые значения (от меньшего к большему):**
- `error` - только ошибки
- `warn` - ошибки и предупреждения
- `info` - ошибки, предупреждения и информационные сообщения
- `debug` - все сообщения включая отладочные

**Рекомендации:**
- `development`: `debug`
- `production`: `info` или `warn`

**По умолчанию:** `info`

---

#### `PORT`
Порт для HTTP сервера (будущий функционал).

**Формат:** число

**По умолчанию:** `3000`

---

## Валидация конфигурации

Приложение автоматически валидирует все переменные окружения при старте:

### Что проверяется:
- ✅ Наличие обязательных переменных
- ✅ Формат значений
- ✅ Допустимые значения для enum-типов
- ✅ Типы данных (строки, числа)

### При ошибке:
Приложение **не запустится** и выдаст понятное сообщение об ошибке:

```
❌ Application failed to start: ConfigurationError: BOT_TOKEN must be set to a valid Telegram bot token. Get it from @BotFather
```

---

## Примеры конфигураций

### Development (разработка)
```bash
NODE_ENV="development"
DATABASE_URL="postgresql://dev@localhost:5432/bandboats_dev?schema=public"
BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
LOG_LEVEL="debug"
PORT=3000
```

### Production (продакшн)
```bash
NODE_ENV="production"
DATABASE_URL="postgresql://produser:securepass@db.prod.com:5432/bandboats_prod?schema=public"
BOT_TOKEN="987654321:XYZwvuTSRqpONMlkJIHgfeDCBA"
LOG_LEVEL="info"
PORT=8080
```

### Testing (тестирование)
```bash
NODE_ENV="test"
DATABASE_URL="postgresql://test@localhost:5432/bandboats_test?schema=public"
BOT_TOKEN="111222333:TEST-TOKEN-FOR-TESTING-ONLY"
LOG_LEVEL="warn"
PORT=3001
```

---

## Использование в коде

```typescript
import { getConfig } from './infrastructure/config';

// Получить конфигурацию
const config = getConfig();

// Использовать значения
console.log(config.nodeEnv);           // Environment
console.log(config.database.url);      // string
console.log(config.telegram.botToken); // string
console.log(config.logging.level);     // LogLevel
console.log(config.port);              // number
```

---

## Безопасность

### ⚠️ Важно:
- **Никогда** не коммитьте `.env` файл в git
- `.env` файл уже добавлен в `.gitignore`
- Используйте разные токены для разработки и продакшна
- В продакшне используйте надёжные пароли для БД
- Регулярно меняйте токены и пароли

### Рекомендации:
- Храните production переменные в безопасном месте (1Password, vault и т.д.)
- Используйте переменные окружения на CI/CD платформах
- Не передавайте `.env` файлы по незащищённым каналам

---

## Troubleshooting

### Проблема: Приложение не находит `.env` файл
**Решение:**
1. Убедитесь что `.env` находится в корне проекта
2. Проверьте права доступа к файлу
3. Перезапустите приложение

### Проблема: Ошибка "Required environment variable not set"
**Решение:**
1. Откройте `.env` файл
2. Добавьте отсутствующую переменную
3. Убедитесь что значение не пустое

### Проблема: Ошибка "Invalid DATABASE_URL"
**Решение:**
1. Проверьте формат строки подключения
2. Убедитесь что она начинается с `postgresql://`
3. Проверьте имя пользователя, хост и порт

### Проблема: Ошибка "Invalid BOT_TOKEN"
**Решение:**
1. Проверьте что токен скопирован полностью
2. Убедитесь что токен содержит двоеточие
3. Получите новый токен от @BotFather если нужно
