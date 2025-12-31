# Проверка DDD архитектуры

Проанализируй код проекта на соблюдение принципов Domain-Driven Design:

## Что проверить:

### 1. Структура слоёв
Проверь правильность организации слоёв:

**Domain Layer (src/domain/):**
- ✅ Содержит entities, aggregates, value objects
- ✅ Определяет интерфейсы репозиториев
- ✅ НЕ зависит от других слоёв
- ✅ НЕ импортирует ничего из infrastructure, application, presentation

**Application Layer (src/application/):**
- ✅ Содержит Use Cases
- ✅ Использует Domain Layer
- ✅ Определяет DTO
- ✅ НЕ содержит бизнес-логику
- ✅ НЕ зависит от Presentation или Infrastructure implementation

**Infrastructure Layer (src/infrastructure/):**
- ✅ Реализует Repository интерфейсы
- ✅ Содержит работу с БД, внешними API
- ✅ Зависит от Domain Layer (реализует интерфейсы)

**Presentation Layer (src/presentation/):**
- ✅ Содержит handlers, controllers
- ✅ Использует Use Cases из Application
- ✅ НЕ обращается напрямую к Domain или Infrastructure

### 2. Domain Layer - богатая модель

Проверь entities и aggregates:

**Entity должна содержать:**
- ❌ НЕ просто геттеры/сеттеры (анемичная модель)
- ✅ Методы для изменения состояния
- ✅ Валидацию бизнес-правил
- ✅ Защиту инвариантов

Примеры проверки:
```typescript
// ❌ Анемичная модель
class Ticket {
  status: TicketStatus;
  assigneeId: number;
}

// ✅ Богатая модель
class Ticket {
  private status: TicketStatus;
  
  close() {
    if (this.status === TicketStatus.CLOSE) {
      throw new DomainError("Already closed");
    }
    this.status = TicketStatus.CLOSE;
  }
}
```

### 3. Aggregates

Проверь:
- ✅ Определён Aggregate Root?
- ✅ Изменения только через Root?
- ✅ Границы агрегата правильные?
- ✅ Нет прямого доступа к вложенным entities?

Например, для Ticket aggregate:
- Ticket — это Aggregate Root
- TicketMessage — часть aggregate или отдельная entity?
- Все изменения через Ticket.addMessage(), а не напрямую к messages

### 4. Repositories

Проверь:
- ✅ Интерфейсы в domain/repositories/
- ✅ Реализации в infrastructure/persistence/
- ✅ Работают с целыми aggregates, а не с полями
- ✅ Методы возвращают domain entities, а не DB models

```typescript
// ✅ Правильно
interface TicketRepository {
  save(ticket: Ticket): Promise<void>;
  findById(id: number): Promise<Ticket | null>;
}

// ❌ Неправильно (утечка деталей БД)
interface TicketRepository {
  executeQuery(sql: string): Promise<any>;
  update(fields: Partial<DbTicket>): Promise<void>;
}
```

### 5. Domain Services vs Use Cases

Проверь правильное разделение:

**Domain Service:**
- Логика между несколькими aggregates
- Находится в domain/services/
- НЕ зависит от Infrastructure

**Use Case (Application Service):**
- Оркестрация операций
- Находится в application/use-cases/
- Использует repositories, domain services
- НЕ содержит бизнес-логику

Пример:
```typescript
// ✅ Domain Service
class TicketAssignmentService {
  canAssign(ticket: Ticket, user: User): boolean {
    return user.isAdmin() && !ticket.isClosed();
  }
}

// ✅ Use Case
class AssignTicketUseCase {
  async execute(dto: AssignTicketDto) {
    const ticket = await this.ticketRepo.findById(dto.ticketId);
    const user = await this.userRepo.findById(dto.userId);
    
    // Проверка через domain service
    if (!this.assignmentService.canAssign(ticket, user)) {
      throw new Error("Cannot assign");
    }
    
    // Изменение через aggregate
    ticket.assign(user.id);
    
    await this.ticketRepo.save(ticket);
  }
}
```

### 6. Направление зависимостей

Проверь, что зависимости идут ВНУТРЬ к Domain:

```
Presentation → Application → Domain ← Infrastructure
```

Проверь:
- ❌ Domain НЕ импортирует Application
- ❌ Domain НЕ импортирует Infrastructure
- ❌ Domain НЕ импортирует Presentation
- ✅ Application импортирует Domain
- ✅ Infrastructure реализует интерфейсы Domain
- ✅ Presentation использует Application

### 7. Анти-паттерны

Найди и укажи:

**Анемичная модель:**
- Entities без методов, только данные
- Вся логика в сервисах

**Transaction Script:**
- Процедурный код вместо объектно-ориентированного
- Use Cases содержат всю логику

**Feature Envy:**
- Код постоянно обращается к полям другого объекта
- Логика находится не в том классе

**God Object:**
- Один класс делает слишком много
- Огромные Use Cases или Services

### 8. Value Objects

Проверь, есть ли Value Objects для:
- Email, Phone (если есть пользователи)
- Money (если есть цены)
- Status (обёртка над enum с валидацией)
- ID (типобезопасные идентификаторы)

```typescript
// ✅ Value Object
class TicketId {
  constructor(private readonly value: number) {
    if (value <= 0) throw new Error("Invalid ID");
  }
  
  getValue(): number { return this.value; }
  equals(other: TicketId): boolean { 
    return this.value === other.value; 
  }
}
```

## Формат ответа:

Для каждого раздела укажи:
- ✅ Соблюдается / ⚠️ Частично / ❌ Нарушается
- Конкретные файлы и строки с проблемами
- Рекомендации по исправлению

## Приоритеты проверки:

1. Структура слоёв и зависимости
2. Богатая vs анемичная модель
3. Правильное использование Aggregates
4. Разделение Domain Service vs Use Case
5. Repositories корректны
6. Отсутствие анти-паттернов

Начни проверку со структуры проекта и импортов, затем проанализируй ключевые классы.
