# Используем официальный образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем prisma схему
COPY prisma ./prisma/

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Удаляем dev зависимости и исходники для уменьшения размера
RUN npm prune --production && \
    rm -rf src tsconfig.json

# Открываем порт (если нужен для webhooks)
# EXPOSE 3000

# Запускаем приложение
CMD ["node", "dist/index.js"]
