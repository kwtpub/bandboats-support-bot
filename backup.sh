#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Директория для бэкапов
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Имя файла с датой
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz"

echo -e "${GREEN}Создание резервной копии базы данных...${NC}"

# Создаем бэкап
docker-compose exec -T postgres pg_dump -U bandboats bandboats_support | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Резервная копия создана: $BACKUP_FILE${NC}"

    # Показываем размер файла
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${YELLOW}Размер: $SIZE${NC}"

    # Удаляем старые бэкапы (старше 30 дней)
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
    echo -e "${YELLOW}Старые бэкапы (>30 дней) удалены${NC}"
else
    echo -e "${RED}✗ Ошибка при создании резервной копии${NC}"
    exit 1
fi
