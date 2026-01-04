#!/bin/sh
set -e

echo "Starting Bandboats Support Bot..."
echo "DATABASE_URL: ${DATABASE_URL}"

# Ждем готовности базы данных
echo "Waiting for database to be ready..."
sleep 5

# Применяем миграции
echo "Running database migrations..."
npx prisma migrate deploy

# Запускаем бота
echo "Starting bot..."
exec node dist/index.js
