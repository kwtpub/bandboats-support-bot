#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Bandboats Support Bot - Deployment${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен!${NC}"
    echo "Установите Docker: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose не установлен!${NC}"
    echo "Установите Docker Compose: sudo apt install docker-compose -y"
    exit 1
fi

# Проверка .env файла
if [ ! -f .env ]; then
    echo -e "${YELLOW}.env файл не найден. Создаем из .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}Пожалуйста, отредактируйте .env файл и запустите скрипт снова${NC}"
        echo "nano .env"
        exit 1
    else
        echo -e "${RED}.env.example не найден!${NC}"
        exit 1
    fi
fi

# Проверка TELEGRAM_BOT_TOKEN
if ! grep -q "TELEGRAM_BOT_TOKEN=.*[0-9]" .env; then
    echo -e "${RED}TELEGRAM_BOT_TOKEN не настроен в .env файле!${NC}"
    echo "Отредактируйте .env и добавьте токен бота"
    exit 1
fi

echo -e "${GREEN}✓ Проверки пройдены${NC}"
echo ""

# Создаем директорию для логов
mkdir -p logs
mkdir -p backups

echo -e "${YELLOW}Останавливаем старые контейнеры (если есть)...${NC}"
docker-compose down

echo -e "${YELLOW}Собираем Docker образ...${NC}"
docker-compose build

echo -e "${YELLOW}Запускаем сервисы...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Развертывание завершено!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "Проверить логи: docker-compose logs -f bot"
echo "Остановить: docker-compose stop"
echo "Перезапустить: docker-compose restart"
echo ""
