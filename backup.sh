#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Директория для бэкапов
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# Загрузка переменных окружения
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Создание директории для бэкапов, если её нет
mkdir -p ${BACKUP_DIR}

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}  Database Backup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Проверка запущен ли контейнер с PostgreSQL
if ! docker ps | grep -q bandboats-postgres; then
    echo -e "${RED}❌ Ошибка: Контейнер PostgreSQL не запущен${NC}"
    echo -e "${YELLOW}Запустите контейнеры: docker compose up -d${NC}"
    exit 1
fi

# Создание бэкапа
echo -e "${YELLOW}💾 Создание бэкапа базы данных...${NC}"
echo -e "${YELLOW}Файл: ${BACKUP_FILE}${NC}"

docker exec bandboats-postgres pg_dump \
    -U ${POSTGRES_USER:-bandboats} \
    -d ${POSTGRES_DB:-bandboats_support} \
    --clean \
    --if-exists \
    --create \
    | gzip > ${BACKUP_FILE}

# Проверка успешности
if [ $? -eq 0 ] && [ -f ${BACKUP_FILE} ]; then
    BACKUP_SIZE=$(du -h ${BACKUP_FILE} | cut -f1)
    echo -e "${GREEN}✅ Бэкап создан успешно!${NC}"
    echo -e "${GREEN}Размер: ${BACKUP_SIZE}${NC}"
    echo -e "${GREEN}Путь: ${BACKUP_FILE}${NC}"

    # Список всех бэкапов
    echo ""
    echo -e "${YELLOW}📂 Список всех бэкапов:${NC}"
    ls -lh ${BACKUP_DIR}/*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

    # Подсчет количества бэкапов
    BACKUP_COUNT=$(ls -1 ${BACKUP_DIR}/*.sql.gz 2>/dev/null | wc -l)
    echo ""
    echo -e "${YELLOW}Всего бэкапов: ${BACKUP_COUNT}${NC}"

    # Предупреждение о старых бэкапах
    OLD_BACKUPS=$(find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 2>/dev/null | wc -l)
    if [ ${OLD_BACKUPS} -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Найдено ${OLD_BACKUPS} бэкапов старше 30 дней${NC}"
        echo -e "${YELLOW}Рекомендуется удалить старые бэкапы:${NC}"
        echo -e "${YELLOW}find ${BACKUP_DIR} -name '*.sql.gz' -mtime +30 -delete${NC}"
    fi
else
    echo -e "${RED}❌ Ошибка при создании бэкапа${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Для восстановления используйте:${NC}"
echo -e "${YELLOW}gunzip -c ${BACKUP_FILE} | \\${NC}"
echo -e "${YELLOW}  docker exec -i bandboats-postgres psql -U ${POSTGRES_USER:-bandboats} -d ${POSTGRES_DB:-bandboats_support}${NC}"
echo -e "${GREEN}================================${NC}"
