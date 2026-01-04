# Развертывание Bandboats Support Bot на VPS

## Требования

- VPS с Ubuntu 20.04+ или Debian 11+
- Docker и Docker Compose установлены
- Минимум 1GB RAM
- 10GB свободного места на диске

## Установка Docker на VPS

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Устанавливаем Docker Compose
sudo apt install docker-compose -y

# Добавляем текущего пользователя в группу docker
sudo usermod -aG docker $USER

# Перезаходим или выполняем
newgrp docker
```

## Развертывание бота

### 1. Клонируем репозиторий

```bash
git clone https://github.com/your-repo/bandboats-support-bot.git
cd bandboats-support-bot
```

### 2. Настраиваем переменные окружения

```bash
# Копируем пример
cp .env.example .env

# Редактируем .env
nano .env
```

Заполните необходимые переменные:
- `TELEGRAM_BOT_TOKEN` - токен бота от @BotFather
- `POSTGRES_PASSWORD` - надежный пароль для базы данных
- Остальные можно оставить по умолчанию

### 3. Запускаем бота

```bash
# Собираем и запускаем контейнеры
docker-compose up -d

# Проверяем логи
docker-compose logs -f bot
```

## Управление

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Только бот
docker-compose logs -f bot

# Только база данных
docker-compose logs -f postgres
```

### Перезапуск

```bash
# Перезапустить все сервисы
docker-compose restart

# Перезапустить только бота
docker-compose restart bot
```

### Остановка

```bash
# Остановить все сервисы
docker-compose stop

# Полностью удалить контейнеры (данные БД сохранятся)
docker-compose down

# Удалить контейнеры и данные БД
docker-compose down -v
```

### Обновление

```bash
# Останавливаем бота
docker-compose down

# Получаем обновления
git pull

# Пересобираем образ
docker-compose build --no-cache

# Запускаем
docker-compose up -d
```

## Миграции базы данных

Миграции применяются автоматически при запуске бота.

Для ручного применения:

```bash
docker-compose exec bot npx prisma migrate deploy
```

## Резервное копирование

### Создание бэкапа базы данных

```bash
# Создать бэкап
docker-compose exec postgres pg_dump -U bandboats bandboats_support > backup_$(date +%Y%m%d_%H%M%S).sql

# Или с помощью скрипта
mkdir -p backups
docker-compose exec postgres pg_dump -U bandboats bandboats_support | gzip > backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Восстановление из бэкапа

```bash
# Остановить бота
docker-compose stop bot

# Восстановить базу
gunzip < backups/backup_20240101_120000.sql.gz | docker-compose exec -T postgres psql -U bandboats bandboats_support

# Запустить бота
docker-compose start bot
```

## Автоматические бэкапы (опционально)

Создайте cron задачу для автоматических бэкапов:

```bash
# Редактируем crontab
crontab -e

# Добавляем задачу (каждый день в 3:00)
0 3 * * * cd /path/to/bandboats-support-bot && docker-compose exec postgres pg_dump -U bandboats bandboats_support | gzip > backups/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz

# Удаление старых бэкапов (старше 30 дней)
0 4 * * * find /path/to/bandboats-support-bot/backups -name "*.sql.gz" -mtime +30 -delete
```

## Мониторинг

### Проверка статуса

```bash
# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats
```

### Настройка автозапуска

Контейнеры настроены на автозапуск (`restart: unless-stopped`), они автоматически запустятся после перезагрузки сервера.

## Безопасность

### Рекомендации

1. **Firewall**: Откройте только необходимые порты
```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

2. **Обновления**: Регулярно обновляйте систему
```bash
sudo apt update && sudo apt upgrade -y
```

3. **Пароли**: Используйте сложные пароли для базы данных

4. **SSH**: Настройте доступ по ключу и отключите вход по паролю

5. **Резервные копии**: Настройте автоматические бэкапы

## Troubleshooting

### Бот не запускается

```bash
# Проверяем логи
docker-compose logs bot

# Проверяем переменные окружения
docker-compose config
```

### База данных недоступна

```bash
# Проверяем статус PostgreSQL
docker-compose ps postgres

# Проверяем логи
docker-compose logs postgres

# Проверяем соединение
docker-compose exec bot npx prisma db push
```

### Проблемы с миграциями

```bash
# Сбросить и применить заново
docker-compose exec bot npx prisma migrate reset
```

## Контакты и поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs`
2. Проверьте `.env` файл
3. Убедитесь, что все сервисы запущены: `docker-compose ps`
