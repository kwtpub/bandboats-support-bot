# Руководство по деплою Bandboats Support Bot на VPS

Полное руководство по развертыванию Telegram бота для системы техподдержки на VPS сервере с использованием Docker Compose.

## Содержание

1. [Требования](#требования)
2. [Подготовка VPS](#подготовка-vps)
3. [Установка Docker](#установка-docker)
4. [Деплой бота](#деплой-бота)
5. [Управление и мониторинг](#управление-и-мониторинг)
6. [Резервное копирование](#резервное-копирование)
7. [Обновление бота](#обновление-бота)
8. [Решение проблем](#решение-проблем)

---

## Требования

### Минимальные требования к VPS

- **ОС**: Ubuntu 22.04/24.04 LTS или Debian 11/12
- **RAM**: минимум 512 MB (рекомендуется 1 GB)
- **Disk**: минимум 10 GB свободного места
- **CPU**: 1 vCore
- **Сеть**: Доступ к интернету, открытые порты для SSH (22)

### Необходимые учетные данные

- SSH доступ к VPS (пользователь с sudo правами)
- Telegram Bot Token (получить у [@BotFather](https://t.me/BotFather))
- Telegram ID администратора (узнать у [@userinfobot](https://t.me/userinfobot))

---

## Подготовка VPS

### 1. Подключение к серверу

```bash
ssh username@your-server-ip
```

### 2. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Установка базовых пакетов

```bash
sudo apt install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  git \
  postgresql-client
```

### 4. Настройка файрвола (опционально, но рекомендуется)

```bash
# Установка UFW
sudo apt install -y ufw

# Разрешение SSH
sudo ufw allow 22/tcp

# Включение файрвола
sudo ufw --force enable

# Проверка статуса
sudo ufw status
```

---

## Установка Docker

### 1. Установка Docker Engine

#### Для Ubuntu/Debian

```bash
# Удаление старых версий
sudo apt remove -y docker docker-engine docker.io containerd runc

# Добавление официального GPG ключа Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Добавление репозитория Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 2. Настройка прав для Docker

```bash
# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Применение изменений (или перелогиньтесь)
newgrp docker

# Проверка работы Docker
docker --version
docker compose version
```

### 3. Включение автозапуска Docker

```bash
sudo systemctl enable docker
sudo systemctl enable containerd
```

---

## Деплой бота

### 1. Клонирование репозитория

```bash
# Создание директории для проекта
mkdir -p ~/projects
cd ~/projects

# Клонирование репозитория
git clone https://github.com/your-username/bandboats-support-bot.git
cd bandboats-support-bot
```

### 2. Настройка переменных окружения

```bash
# Копирование примера .env файла
cp .env.example .env

# Редактирование .env файла
nano .env
```

#### Содержимое `.env` файла:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz12345678

# Database Configuration
POSTGRES_USER=bandboats
POSTGRES_PASSWORD=your_very_secure_password_here_change_me
POSTGRES_DB=bandboats_support

# Database URL (автоматически формируется в docker-compose)
DATABASE_URL=postgresql://bandboats:your_very_secure_password_here_change_me@postgres:5432/bandboats_support?schema=public

# Node Environment
NODE_ENV=production
```

**Важно:**
- Замените `TELEGRAM_BOT_TOKEN` на токен вашего бота от @BotFather
- Замените `POSTGRES_PASSWORD` на надежный пароль (используйте генератор паролей)
- `DATABASE_URL` должен соответствовать настройкам `POSTGRES_*`

**Генерация безопасного пароля:**

```bash
openssl rand -base64 32
```

### 3. Создание директорий

```bash
# Создание директории для логов
mkdir -p logs

# Создание директории для бэкапов
mkdir -p backups

# Установка прав
chmod 755 logs backups
```

### 4. Запуск с помощью docker-compose

```bash
# Сборка и запуск контейнеров
docker compose up -d --build

# Просмотр логов
docker compose logs -f
```

**Ожидаемый вывод:**

```
✅ PostgreSQL is ready!
📦 Running database migrations...
✨ Starting application...
Bot started successfully
```

### 5. Использование скрипта автоматического деплоя

Для упрощения процесса используйте скрипт `deploy.sh`:

```bash
# Сделать скрипт исполняемым
chmod +x deploy.sh

# Запустить деплой
./deploy.sh
```

---

## Управление и мониторинг

### Основные команды Docker Compose

```bash
# Запуск контейнеров
docker compose up -d

# Остановка контейнеров
docker compose down

# Перезапуск контейнеров
docker compose restart

# Перезапуск только бота
docker compose restart bot

# Просмотр логов
docker compose logs -f

# Просмотр логов конкретного сервиса
docker compose logs -f bot
docker compose logs -f postgres

# Просмотр статуса контейнеров
docker compose ps

# Просмотр использования ресурсов
docker stats
```

### Просмотр логов

```bash
# Все логи
docker compose logs -f

# Последние 100 строк логов бота
docker compose logs --tail=100 bot

# Логи за последний час
docker compose logs --since 1h bot

# Логи с временными метками
docker compose logs -f -t bot
```

### Проверка здоровья контейнеров

```bash
# Статус всех контейнеров
docker compose ps

# Детальная информация о контейнере
docker inspect bandboats-bot

# Проверка здоровья PostgreSQL
docker exec bandboats-postgres pg_isready -U bandboats
```

### Мониторинг ресурсов

```bash
# Использование ресурсов в реальном времени
docker stats

# Использование диска
docker system df

# Детальная информация об использовании диска
docker system df -v
```

### Очистка неиспользуемых ресурсов

```bash
# Очистка всех неиспользуемых образов, контейнеров, томов
docker system prune -a --volumes

# Только образы
docker image prune -a

# Только контейнеры
docker container prune
```

---

## Резервное копирование

### Автоматическое резервное копирование

#### 1. Использование скрипта backup.sh

```bash
# Сделать скрипт исполняемым
chmod +x backup.sh

# Создать бэкап вручную
./backup.sh
```

#### 2. Настройка автоматических бэкапов через cron

```bash
# Открыть crontab
crontab -e

# Добавить задачи (выберите нужные):

# Бэкап каждый день в 3:00 ночи
0 3 * * * cd /home/username/projects/bandboats-support-bot && ./backup.sh >> /home/username/projects/bandboats-support-bot/logs/backup.log 2>&1

# Бэкап каждые 12 часов
0 */12 * * * cd /home/username/projects/bandboats-support-bot && ./backup.sh >> /home/username/projects/bandboats-support-bot/logs/backup.log 2>&1

# Очистка старых бэкапов (старше 30 дней) каждый день в 4:00
0 4 * * * find /home/username/projects/bandboats-support-bot/backups -name "*.sql.gz" -mtime +30 -delete

# Очистка старых логов (старше 7 дней)
0 5 * * * find /home/username/projects/bandboats-support-bot/logs -name "*.log" -mtime +7 -delete
```

**Важно:** Замените `/home/username/projects/bandboats-support-bot` на актуальный путь к проекту.

### Ручное резервное копирование

```bash
# Создание бэкапа базы данных
docker exec bandboats-postgres pg_dump -U bandboats -d bandboats_support | gzip > backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Проверка созданного бэкапа
ls -lh backups/

# Копирование бэкапа на локальный компьютер
scp username@your-server-ip:~/projects/bandboats-support-bot/backups/backup_*.sql.gz ./
```

### Восстановление из бэкапа

```bash
# 1. Остановить бота
docker compose stop bot

# 2. Распаковать и восстановить базу данных
gunzip -c backups/backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i bandboats-postgres psql -U bandboats -d bandboats_support

# 3. Запустить бота
docker compose start bot

# 4. Проверить логи
docker compose logs -f bot
```

### Копирование бэкапов на удаленный сервер

```bash
# Установка rsync
sudo apt install -y rsync

# Добавить в crontab для копирования бэкапов на удаленный сервер
0 6 * * * rsync -avz --delete /home/username/projects/bandboats-support-bot/backups/ remote-user@remote-server:/path/to/backups/
```

---

## Обновление бота

### Обновление до новой версии

```bash
cd ~/projects/bandboats-support-bot

# 1. Создать бэкап перед обновлением
./backup.sh

# 2. Остановить контейнеры
docker compose down

# 3. Сохранить текущие изменения (если есть)
git stash

# 4. Получить последнюю версию
git pull origin main

# 5. Вернуть сохраненные изменения (если нужно)
git stash pop

# 6. Пересобрать и запустить контейнеры
docker compose up -d --build

# 7. Проверить логи
docker compose logs -f bot
```

### Быстрое обновление с помощью скрипта

```bash
# Использовать deploy.sh для автоматического обновления
./deploy.sh
```

### Откат к предыдущей версии

```bash
# 1. Остановить контейнеры
docker compose down

# 2. Откатиться к предыдущему коммиту
git log --oneline  # Найти нужный коммит
git checkout <commit-hash>

# 3. Запустить контейнеры
docker compose up -d --build

# 4. Или восстановить из бэкапа (см. раздел "Восстановление из бэкапа")
```

---

## Решение проблем

### Бот не запускается

#### 1. Проверка логов

```bash
docker compose logs bot
docker compose logs postgres
```

#### 2. Проверка переменных окружения

```bash
# Проверить .env файл
cat .env

# Проверить переменные в контейнере
docker exec bandboats-bot env | grep TELEGRAM
docker exec bandboats-bot env | grep DATABASE
```

#### 3. Проверка подключения к базе данных

```bash
# Проверка статуса PostgreSQL
docker exec bandboats-postgres pg_isready -U bandboats

# Подключение к базе данных
docker exec -it bandboats-postgres psql -U bandboats -d bandboats_support

# Внутри psql:
\dt  # Список таблиц
\q   # Выход
```

### Проблемы с миграциями

```bash
# Ручной запуск миграций
docker exec -it bandboats-bot npx prisma migrate deploy

# Сброс базы данных (ОСТОРОЖНО: удалит все данные)
docker exec -it bandboats-bot npx prisma migrate reset
```

### Проблемы с памятью

```bash
# Проверка использования памяти
docker stats

# Увеличение swap (если RAM мало)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Сделать swap постоянным
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### База данных не отвечает

```bash
# Перезапуск PostgreSQL
docker compose restart postgres

# Проверка логов PostgreSQL
docker compose logs postgres

# Проверка места на диске
df -h
```

### Бот теряет соединение с Telegram

```bash
# Проверка интернет-соединения
ping -c 4 api.telegram.org

# Проверка DNS
nslookup api.telegram.org

# Перезапуск бота
docker compose restart bot
```

### Проблемы с правами доступа

```bash
# Проверка прав на директории
ls -la logs/ backups/

# Исправление прав
sudo chown -R $USER:$USER logs/ backups/
chmod 755 logs/ backups/
```

### Контейнер постоянно перезапускается

```bash
# Проверка причины
docker compose ps
docker compose logs --tail=50 bot

# Остановка автоматического перезапуска
docker compose stop bot

# Запуск без фонового режима для отладки
docker compose up bot
```

### Очистка и полный перезапуск

```bash
# ОСТОРОЖНО: Удалит все данные!

# 1. Остановка и удаление контейнеров
docker compose down -v

# 2. Удаление образов
docker rmi bandboats-support-bot-bot

# 3. Очистка всего
docker system prune -a --volumes

# 4. Новый запуск
docker compose up -d --build
```

---

## Дополнительные настройки

### Настройка логирования

Для ротации логов Docker используйте следующую конфигурацию в `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Затем перезапустите Docker:

```bash
sudo systemctl restart docker
```

### Мониторинг с помощью Portainer (опционально)

```bash
# Установка Portainer
docker volume create portainer_data

docker run -d \
  -p 9000:9000 \
  --name=portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# Открыть порт в файрволе
sudo ufw allow 9000/tcp

# Доступ через браузер: http://your-server-ip:9000
```

### Настройка HTTPS (для будущих webhook)

Если планируете использовать webhooks вместо polling:

```bash
# Установка certbot
sudo apt install -y certbot

# Получение SSL сертификата
sudo certbot certonly --standalone -d your-domain.com

# Добавление в docker-compose.yml
# volumes:
#   - /etc/letsencrypt:/etc/letsencrypt:ro
```

### Мониторинг работоспособности

Создайте простой скрипт для проверки работы бота:

```bash
# /usr/local/bin/check-bot.sh
#!/bin/bash

if ! docker ps | grep -q bandboats-bot; then
    echo "Bot is not running! Restarting..."
    cd /home/username/projects/bandboats-support-bot
    docker compose up -d bot
    echo "Bot restarted at $(date)" >> /var/log/bot-restart.log
fi
```

Добавьте в crontab:

```bash
*/5 * * * * /usr/local/bin/check-bot.sh
```

---

## Безопасность

### Рекомендации по безопасности

1. **Используйте SSH ключи вместо паролей:**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id username@your-server-ip
```

2. **Отключите вход по паролю SSH:**
```bash
sudo nano /etc/ssh/sshd_config
# Установите: PasswordAuthentication no
sudo systemctl restart sshd
```

3. **Регулярно обновляйте систему:**
```bash
sudo apt update && sudo apt upgrade -y
```

4. **Используйте fail2ban для защиты от брутфорса:**
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

5. **Не храните .env в Git:**
```bash
# Убедитесь, что .env в .gitignore
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

---

## Проверочный список деплоя

- [ ] VPS создан и доступен по SSH
- [ ] Система обновлена
- [ ] Docker и Docker Compose установлены
- [ ] Репозиторий склонирован
- [ ] Файл `.env` создан и настроен
- [ ] Telegram Bot Token добавлен
- [ ] Пароли изменены на безопасные
- [ ] Директории `logs/` и `backups/` созданы
- [ ] Контейнеры запущены: `docker compose up -d --build`
- [ ] Бот отвечает в Telegram
- [ ] Автоматические бэкапы настроены в crontab
- [ ] Файрвол настроен
- [ ] SSH доступ защищен

---

## Полезные ссылки

- [Официальная документация Docker](https://docs.docker.com/)
- [Docker Compose документация](https://docs.docker.com/compose/)
- [Prisma документация](https://www.prisma.io/docs/)
- [Telegraf документация](https://telegraf.js.org/)
- [PostgreSQL документация](https://www.postgresql.org/docs/)

---

## Контакты и поддержка

При возникновении проблем:
1. Проверьте раздел [Решение проблем](#решение-проблем)
2. Изучите логи: `docker compose logs -f`
3. Создайте issue в репозитории проекта

---

**Успешного деплоя!** 🚀
