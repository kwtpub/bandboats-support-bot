# Используем официальный образ Node.js
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev)
RUN npm ci

# Копируем prisma схему
COPY prisma ./prisma/

# Генерируем Prisma Client
RUN npm run prisma:generate || npx prisma generate

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production

# Копируем prisma схему
COPY prisma ./prisma/

# Генерируем Prisma Client в production
RUN npx prisma generate

# Копируем собранный код из builder
COPY --from=builder /app/dist ./dist

# Удаляем ненужное
RUN rm -rf src tsconfig.json

# Открываем порт (если нужен для webhooks)
# EXPOSE 3000

# Запускаем приложение
CMD ["node", "dist/index.js"]
