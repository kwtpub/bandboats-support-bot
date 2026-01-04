#!/bin/sh
set -e

echo "🚀 Starting Bandboats Support Bot..."

# Ждем готовности базы данных
echo "⏳ Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Применяем миграции базы данных
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Генерируем Prisma Client (на всякий случай)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Запускаем приложение
echo "✨ Starting application..."
exec node dist/index.js
