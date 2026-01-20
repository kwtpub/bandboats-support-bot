#!/bin/bash

# Скрипт для выдачи админских прав пользователю
# Использование: ./make-admin.sh <TELEGRAM_ID>

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка аргументов
if [ -z "$1" ]; then
    echo -e "${RED}❌ Ошибка: не указан Telegram ID${NC}"
    echo ""
    echo "Использование: ./make-admin.sh <TELEGRAM_ID>"
    echo ""
    echo "Пример: ./make-admin.sh 123456789"
    echo ""
    echo "Как узнать свой Telegram ID:"
    echo "  1. Напишите @userinfobot в Telegram"
    echo "  2. Или сначала запустите бота и посмотрите в базе:"
    echo "     docker-compose exec postgres psql -U bandboats -d bandboats_support -c \"SELECT * FROM users ORDER BY created_at DESC LIMIT 5;\""
    exit 1
fi

TELEGRAM_ID="$1"

# Проверяем наличие docker-compose
if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не найден${NC}"
    exit 1
fi

# Определяем команду docker-compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

# Проверяем что контейнеры запущены
if ! $DOCKER_COMPOSE ps | grep -q "bandboats-db.*Up"; then
    echo -e "${RED}❌ Контейнер базы данных не запущен${NC}"
    echo "Запустите контейнеры: docker-compose up -d"
    exit 1
fi

echo -e "${YELLOW}🔍 Ищу пользователя с Telegram ID: $TELEGRAM_ID${NC}"

# Проверяем существует ли пользователь
USER_EXISTS=$($DOCKER_COMPOSE exec -T postgres psql -U bandboats -d bandboats_support -tAc "SELECT COUNT(*) FROM users WHERE telegram_id = '$TELEGRAM_ID';" 2>/dev/null | tr -d '[:space:]')

if [ "$USER_EXISTS" = "0" ]; then
    echo -e "${RED}❌ Пользователь с Telegram ID $TELEGRAM_ID не найден в базе данных${NC}"
    echo ""
    echo "Возможные причины:"
    echo "  1. Вы еще не запустили бота и не отправили команду /start"
    echo "  2. Telegram ID указан неверно"
    echo ""
    echo "Список всех пользователей:"
    $DOCKER_COMPOSE exec -T postgres psql -U bandboats -d bandboats_support -c "SELECT id, telegram_id, name, role FROM users;" 2>/dev/null
    exit 1
fi

# Проверяем текущую роль
CURRENT_ROLE=$($DOCKER_COMPOSE exec -T postgres psql -U bandboats -d bandboats_support -tAc "SELECT role FROM users WHERE telegram_id = '$TELEGRAM_ID';" 2>/dev/null | tr -d '[:space:]')

if [ "$CURRENT_ROLE" = "ADMIN" ]; then
    echo -e "${YELLOW}⚠️  У пользователя уже есть роль ADMIN${NC}"
    exit 0
fi

# Выдаем админку
echo -e "${YELLOW}🔧 Выдаю админские права...${NC}"
$DOCKER_COMPOSE exec -T postgres psql -U bandboats -d bandboats_support -c "UPDATE users SET role = 'ADMIN' WHERE telegram_id = '$TELEGRAM_ID';" > /dev/null 2>&1

# Проверяем результат
UPDATED_ROLE=$($DOCKER_COMPOSE exec -T postgres psql -U bandboats -d bandboats_support -tAc "SELECT role FROM users WHERE telegram_id = '$TELEGRAM_ID';" 2>/dev/null | tr -d '[:space:]')

if [ "$UPDATED_ROLE" = "ADMIN" ]; then
    USER_INFO=$($DOCKER_COMPOSE exec -T postgres psql -U bandboats -d bandboats_support -tAc "SELECT id, name, role FROM users WHERE telegram_id = '$TELEGRAM_ID';" 2>/dev/null)
    echo -e "${GREEN}✅ Админские права успешно выданы!${NC}"
    echo ""
    echo "Информация о пользователе:"
    echo "$USER_INFO" | awk -F'|' '{print "  ID: " $1 "\n  Имя: " $2 "\n  Роль: " $3}'
    echo ""
    echo "Теперь вы можете использовать команды администратора в боте!"
else
    echo -e "${RED}❌ Ошибка при обновлении роли${NC}"
    exit 1
fi

