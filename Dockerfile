FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (только production)
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаём папки для uploads и logs
RUN mkdir -p uploads logs

# Открываем порт
EXPOSE 5000

# Команда запуска
CMD ["npm", "run", "start:prod"]