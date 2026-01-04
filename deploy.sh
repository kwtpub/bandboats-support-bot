#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Bandboats Bot Deployment${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo -e "${RED}❌ Ошибка: .env файл не найден!${NC}"
    echo -e "${YELLOW}Создайте .env файл на основе .env.example${NC}"
    echo -e "${YELLOW}cp .env.example .env${NC}"
    exit 1
fi

# Проверка наличия TELEGRAM_BOT_TOKEN
if ! grep -q "TELEGRAM_BOT_TOKEN=.*[^[:space:]]" .env; then
    echo -e "${RED}❌ Ошибка: TELEGRAM_BOT_TOKEN не настроен в .env${NC}"
    echo -e "${YELLOW}Отредактируйте .env файл и добавьте токен бота${NC}"
    exit 1
fi

# Создание необходимых директорий
echo -e "${YELLOW}📁 Создание необходимых директорий...${NC}"
mkdir -p logs backups
chmod 755 logs backups

# Создание бэкапа перед обновлением (если БД уже существует)
if docker ps | grep -q bandboats-postgres; then
    echo -e "${YELLOW}💾 Создание бэкапа базы данных...${NC}"
    ./backup.sh 2>/dev/null || echo -e "${YELLOW}⚠️  Пропущено (БД может быть недоступна)${NC}"
fi

# Остановка контейнеров
echo -e "${YELLOW}🛑 Остановка контейнеров...${NC}"
docker compose down

# Получение последних изменений из Git (если это Git репозиторий)
if [ -d .git ]; then
    echo -e "${YELLOW}📥 Получение последних изменений из Git...${NC}"
    git pull origin main 2>/dev/null || echo -e "${YELLOW}⚠️  Не удалось обновить из Git${NC}"
fi

# Сборка и запуск контейнеров
echo -e "${YELLOW}🏗️  Сборка Docker образов...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}🚀 Запуск контейнеров...${NC}"
docker compose up -d

# Ожидание запуска
echo -e "${YELLOW}⏳ Ожидание запуска сервисов...${NC}"
sleep 5

# Проверка статуса
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Статус контейнеров${NC}"
echo -e "${GREEN}================================${NC}"
docker compose ps

# Проверка логов
echo ""
echo -e "${YELLOW}📋 Последние логи бота:${NC}"
docker compose logs --tail=20 bot

# Проверка работы
echo ""
if docker ps | grep -q bandboats-bot; then
    echo -e "${GREEN}✅ Деплой завершен успешно!${NC}"
    echo -e "${GREEN}Бот запущен и работает${NC}"
    echo ""
    echo -e "${YELLOW}Полезные команды:${NC}"
    echo -e "  docker compose logs -f bot     # Просмотр логов"
    echo -e "  docker compose restart bot     # Перезапуск бота"
    echo -e "  docker compose down            # Остановка"
    echo -e "  ./backup.sh                    # Создать бэкап"
else
    echo -e "${RED}❌ Ошибка: Бот не запустился${NC}"
    echo -e "${YELLOW}Проверьте логи: docker compose logs bot${NC}"
    exit 1
fi
