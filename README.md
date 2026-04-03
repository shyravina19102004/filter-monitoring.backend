Система мониторинга фильтрующих элементов – Бэкенд

Требования к серверу

- Node.js v18+ (рекомендуется v20)
- PostgreSQL v14+ (рекомендуется v17)
- Git, npm или yarn
- PM2 (для production) – опционально
- Nginx (для проксирования и SSL) – опционально

---

Установка и запуск

1. Клонирование репозитория

```bash
git clone https://github.com/shyravina19102004/filter-monitoring.backend.git
cd filter-monitoring.backend
```

2. Установка зависимостей

```bash
npm install
```

3. Настройка переменных окружения
Скопируйте .env.example в .env и отредактируйте:
```bash
# Общие
NODE_ENV=production
PORT=5000
LOG_LEVEL=info
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=filter_monitoring
DB_USER=postgres
DB_PASSWORD=your_secure_password
# JWT
JWT_SECRET=your_super_secret_key_change_me
JWT_EXPIRES_IN=7d
# Планировщик (cron)
CRON_SCHEDULE=0 * * * *
# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_TO=
# Интеграция с ТОИР
TOIR_API_URL=
TOIR_API_KEY=
TOIR_SYNC_CRON=0 2 * * *
```

4. Подготовка папок для файлов и логов
```bash
mkdir -p uploads logs
chmod 755 uploads logs
```

5. Создание базы данных и выполнение миграций
```bash
npx sequelize-cli db:create --config src/config/database.js
npm run migrate
npm run seed
```
Начальный администратор:
email: admin@example.com
пароль: admin123 (обязательно смените после первого входа).

6. Шрифт для PDF-документов
Скачайте шрифт DejaVuSans.ttf и поместите в папку fonts/ в корне проекта:

```bash
mkdir fonts
```
скопируйте DejaVuSans.ttf в папку fonts

7. Запуск сервера
Режим разработки:
```bash
npm run dev
```
Production через PM2:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

8. Настройка Nginx (опционально)
Пример конфигурации (/etc/nginx/sites-available/filter-monitoring):
```bash
nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Для HTTPS используйте Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Проверка работоспособности
1. Health check
```bash
curl http://localhost:5000/health
```
Ожидаемый ответ: {"status":"ok","timestamp":"..."}

2. Получение JWT-токена
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
  ```
В ответе придёт token. Сохраните его – он нужен для всех следующих запросов.

3. Просмотр документации API (Swagger)
Откройте в браузере:
http://localhost:5000/api-docs (или ваш домен, если настроен Nginx)

4. Пример запроса к защищённому API
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <ваш_токен>"
```
