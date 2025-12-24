# Bandboats Support Bot - Контекст проекта

## Общее описание

**Bandboats Support Bot** — это Telegram-бот для системы технической поддержки, разработанный на TypeScript с использованием библиотеки Telegraf. Проект следует принципам Clean Architecture и Domain-Driven Design (DDD), обеспечивая разделение ответственности между слоями приложения.

## Технологический стек

- **Язык**: TypeScript 5.9.3
- **Платформа**: Node.js (ES2020, ESM модули)
- **Фреймворк**: Telegraf 4.16.3 (Telegram Bot API)
- **Сборка**: TypeScript Compiler
- **Разработка**: 
  - Nodemon для hot-reload
  - ts-node для выполнения TypeScript
- **Качество кода**:
  - ESLint 9.39.2 с TypeScript ESLint
  - Prettier 3.7.4 для форматирования
- **Документация**: Doxygen (настроен для TypeScript)

## Архитектура проекта

Проект использует **Clean Architecture** с разделением на слои:

```
src/
├── core/                    # Ядро приложения (Domain + Application)
│   ├── entities/            # Доменные сущности (Domain Layer)
│   │   ├── Ticket/
│   │   │   ├── ticket.entity.ts
│   │   │   └── ticketMessage.entity.ts
│   │   └── User/
│   │       └── user.entity.ts
│   ├── repositories/        # Интерфейсы репозиториев (Application Layer)
│   │   ├── Ticket/
│   │   │   ├── ticket.repository.ts
│   │   │   └── ticketMessage.repository.ts
│   │   └── User/
│   │       └── user.repository.ts
│   └── service/            # Сервисы приложения (Application Layer)
│       ├── TicketService/
│       └── UserService/
└── interface/              # Интерфейсы (Presentation Layer)
    └── (Telegram Bot handlers)
```

## Доменная модель

### 1. Ticket (Тикет)

**Файл**: `src/core/entities/Ticket/ticket.entity.ts`

Сущность тикета в системе техподдержки. Является агрегатом, содержащим сообщения.

**Поля**:
- `id: number` - Уникальный идентификатор
- `authorId: number` - ID пользователя-автора
- `assigneeId: number` - ID назначенного исполнителя
- `title: string` - Заголовок тикета
- `messages: TicketMessage[]` - Список сообщений
- `status: TicketStatus` - Статус тикета

**Статусы** (enum `TicketStatus`):
- `OPEN` - Открыт
- `IN_PROGRESS` - В работе
- `CLOSE` - Закрыт

### 2. TicketMessage (Сообщение тикета)

**Файл**: `src/core/entities/Ticket/ticketMessage.entity.ts`

Сущность сообщения в рамках тикета.

**Поля**:
- `id: number` - Уникальный идентификатор
- `ticketId: number` - ID тикета
- `authorId: number` - ID автора сообщения
- `content: string` - Текст сообщения
- `createAt: Date` - Дата создания

### 3. User (Пользователь)

**Файл**: `src/core/entities/User/user.entity.ts`

Сущность пользователя системы.

**Поля**:
- `id: number` - Уникальный идентификатор
- `telegramId: string` - ID пользователя в Telegram
- `name: string` - Имя пользователя
- `role: ROLE` - Роль в системе
- `createAt: Date` - Дата регистрации

**Роли** (enum `ROLE`):
- `ADMIN` - Администратор
- `CLIENT` - Клиент

## Репозитории (Application Layer)

### TicketRepository

**Файл**: `src/core/repositories/Ticket/ticket.repository.ts`

Интерфейс для работы с агрегатом Ticket.

**Методы**:
- `save(ticket: Ticket): Promise<void>` - Сохранить тикет
- `findById(id: number): Promise<Ticket | null>` - Найти по ID
- `findByAuthorId(authorId: number): Promise<Ticket[]>` - Найти тикеты автора

### TicketMessageRepository

**Файл**: `src/core/repositories/Ticket/ticketMessage.repository.ts`

Интерфейс для работы с сообщениями тикетов.

**Методы**:
- `save(message: TicketMessage): Promise<void>` - Сохранить сообщение
- `findById(id: number): Promise<TicketMessage | null>` - Найти по ID
- `findByTicketId(ticketId: number): Promise<TicketMessage[]>` - Найти все сообщения тикета

### UserRepository

**Файл**: `src/core/repositories/User/user.repository.ts`

Интерфейс для работы с пользователями.

**Методы**:
- `save(user: User): Promise<void>` - Сохранить пользователя
- `findById(id: number): Promise<User | null>` - Найти по ID
- `findByTelegramId(telegramId: string): Promise<User | null>` - Найти по Telegram ID
- `findByRole(role: ROLE): Promise<User[]>` - Найти всех пользователей с ролью

## Сервисы (Application Layer)

Папки для сервисов созданы, но файлы еще не реализованы:
- `src/core/service/TicketService/` - Бизнес-логика работы с тикетами
- `src/core/service/UserService/` - Бизнес-логика работы с пользователями

## Интерфейс (Presentation Layer)

Папка `src/interface/` предназначена для:
- Обработчиков команд Telegram бота
- Валидации входящих данных
- Преобразования DTO в доменные сущности
- Обработки ошибок и формирования ответов

## Конфигурация проекта

### TypeScript (tsconfig.json)

- **Целевая версия**: ES2020
- **Модули**: ESM (nodenext)
- **Строгий режим**: включен
- **Дополнительные проверки**:
  - `noUnusedLocals` - неиспользуемые переменные
  - `noUnusedParameters` - неиспользуемые параметры
  - `noImplicitReturns` - обязательный return
  - `noFallthroughCasesInSwitch` - проверка switch
- **Генерация**: source maps, declaration files

### ESLint (eslint.config.mts)

- Использует TypeScript ESLint
- Рекомендуемые правила для JavaScript и TypeScript

### Nodemon (nodemon.json)

- Отслеживает изменения в `src/`
- Запускает `ts-node ./src/index.ts` при изменениях
- Игнорирует папку `dist/`

### Doxygen (Doxyfile)

- Настроен для TypeScript проекта
- Язык документации: Русский
- Выходная папка: `docs/`
- Обрабатывает только файлы из `src/`
- Исключает: `node_modules`, `dist`, `*.d.ts`

## Скрипты npm

- `npm run start` - Запуск скомпилированного приложения
- `npm run build` - Компиляция TypeScript в JavaScript
- `npm run dev` - Запуск в режиме разработки (nodemon)
- `npm run lint` - Проверка кода ESLint
- `npm run format` - Форматирование кода Prettier
- `npm run docs` - Генерация документации Doxygen
- `npm run docs:open` - Открытие документации в браузере

## Зависимости

### Production
- `telegraf` - Фреймворк для Telegram ботов
- `dotenv` - Загрузка переменных окружения

### Development
- `typescript` - Компилятор TypeScript
- `ts-node` - Выполнение TypeScript без компиляции
- `nodemon` - Автоперезагрузка при разработке
- `eslint` + `typescript-eslint` - Линтинг
- `prettier` - Форматирование кода

## Текущее состояние проекта

### Реализовано
✅ Доменные сущности (Entities):
- Ticket с enum TicketStatus
- TicketMessage
- User с enum ROLE

✅ Интерфейсы репозиториев:
- TicketRepository
- TicketMessageRepository
- UserRepository

✅ Инфраструктура:
- Настроен TypeScript
- Настроен ESLint и Prettier
- Настроен Doxygen для документации
- Настроен nodemon для разработки

### Не реализовано
❌ Сервисы приложения (TicketService, UserService)
❌ Реализация репозиториев (Infrastructure слой)
❌ Обработчики Telegram бота (Presentation слой)
❌ Точка входа приложения (src/index.ts)
❌ Конфигурация базы данных
❌ DTO для входящих данных
❌ Обработка ошибок
❌ Валидация данных

## Принципы разработки

1. **Clean Architecture**: Четкое разделение слоев
2. **DDD**: Доменные сущности содержат бизнес-логику
3. **Dependency Inversion**: Зависимости направлены внутрь (к Domain)
4. **Immutability**: Все поля сущностей readonly
5. **Type Safety**: Строгая типизация TypeScript
6. **Documentation**: Комментарии в формате Doxygen

## Следующие шаги разработки

1. **Создать точку входа** (`src/index.ts`):
   - Инициализация Telegraf бота
   - Загрузка переменных окружения
   - Регистрация обработчиков

2. **Реализовать сервисы**:
   - TicketService: создание, назначение, закрытие тикетов
   - UserService: регистрация, авторизация, управление ролями

3. **Реализовать репозитории** (Infrastructure):
   - Выбрать БД (SQLite/PostgreSQL/MySQL)
   - Реализовать интерфейсы репозиториев
   - Настроить миграции

4. **Создать обработчики бота** (`src/interface/`):
   - Команды: /start, /help, /newticket
   - Callback handlers для кнопок
   - Middleware для авторизации

5. **Добавить DTO**:
   - Валидация входящих данных
   - Преобразование в доменные сущности

6. **Обработка ошибок**:
   - Кастомные исключения
   - Логирование
   - Пользовательские сообщения об ошибках

## Структура файлов

```
bandboats-support-bot/
├── src/
│   ├── core/
│   │   ├── entities/
│   │   │   ├── Ticket/
│   │   │   │   ├── ticket.entity.ts
│   │   │   │   └── ticketMessage.entity.ts
│   │   │   └── User/
│   │   │       └── user.entity.ts
│   │   ├── repositories/
│   │   │   ├── Ticket/
│   │   │   │   ├── ticket.repository.ts
│   │   │   │   └── ticketMessage.repository.ts
│   │   │   └── User/
│   │   │       └── user.repository.ts
│   │   └── service/
│   │       ├── TicketService/
│   │       └── UserService/
│   └── interface/
├── docs/                    # Сгенерированная документация Doxygen
├── dist/                    # Скомпилированный JavaScript
├── node_modules/
├── .prettierrc
├── Doxyfile
├── eslint.config.mts
├── nodemon.json
├── package.json
├── tsconfig.json
└── context.md              # Этот файл
```

## Примечания

- Проект использует ESM модули (import/export)
- Все сущности immutable (readonly поля)
- Репозитории определены как интерфейсы (Dependency Inversion)
- Документация генерируется автоматически из JSDoc комментариев
- Код форматируется автоматически через Prettier
- Линтинг настроен для строгой проверки TypeScript

## Контакты и документация

- Документация API: `docs/html/index.html` (после `npm run docs`)
- Исходный код: `src/`
- Конфигурация: файлы в корне проекта

