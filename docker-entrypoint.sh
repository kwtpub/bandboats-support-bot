#!/bin/sh
set -e

echo "🚀 Starting Bandboats Support Bot..."

# Ждем готовности базы данных
echo "⏳ Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if PGPASSWORD=$POSTGRES_PASSWORD psql -h "postgres" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' 2>/dev/null; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "PostgreSQL is unavailable - sleeping (attempt $attempt/$max_attempts)..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Failed to connect to PostgreSQL after $max_attempts attempts"
  exit 1
fi

# Применяем миграции базы данных
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Генерируем Prisma Client (на всякий случай)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Запускаем приложение
echo "✨ Starting application..."
exec node dist/index.js
