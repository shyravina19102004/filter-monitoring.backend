const dotenv = require('dotenv');
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });

require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Подключение Swagger
const setupSwagger = require('./config/swagger');
setupSwagger(app);

// Импорты для обработки ошибок и логирования
const ApiError = require('./utils/ApiError');
const logger = require('./utils/logger');

// Базовые middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Простой тестовый маршрут
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Подключение тестовых маршрутов
const testRoutes = require('./routes/testRoutes');
app.use('/api/test', testRoutes);

// Аутентификация
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Пользователи
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Роли и разрешения
const roleRoutes = require('./routes/roleRoutes');
app.use('/api/roles', roleRoutes);

// Локации (иерархия объектов)
const locationRoutes = require('./routes/locationRoutes');
app.use('/api/locations', locationRoutes);

// Модели фильтров
const filterModelRoutes = require('./routes/filterModelRoutes');
app.use('/api/filter-models', filterModelRoutes);

// Экземпляры фильтров (склад)
const filterInstanceRoutes = require('./routes/filterInstanceRoutes');
app.use('/api/filter-instances', filterInstanceRoutes);

// Корпуса фильтров
const filterHousingRoutes = require('./routes/filterHousingRoutes');
app.use('/api/filter-housings', filterHousingRoutes);

// Счётчики
const meterRoutes = require('./routes/meterRoutes');
app.use('/api/meters', meterRoutes);

// Показания счётчиков
const meterReadingRoutes = require('./routes/meterReadingRoutes');
app.use('/api/meter-readings', meterReadingRoutes);

// Правила обслуживания
const ruleRoutes = require('./routes/ruleRoutes');
app.use('/api/rules', ruleRoutes);

// Установки фильтров
const installationRoutes = require('./routes/installationRoutes');
app.use('/api/installations', installationRoutes);

// Оповещения
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Акты работ
const workOrderRoutes = require('./routes/workOrderRoutes');
app.use('/api/work-orders', workOrderRoutes);

// Отчёты
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

// Дашборд
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Конфигурация уведомлений
const notificationConfigRoutes = require('./routes/notificationConfigRoutes');
app.use('/api/notification-configs', notificationConfigRoutes);

// Логи
const logRoutes = require('./routes/logRoutes');
app.use('/api/logs', logRoutes);

// Шаблоны документов
const documentTemplateRoutes = require('./routes/documentTemplateRoutes');
app.use('/api/document-templates', documentTemplateRoutes);

// Интеграции
const integrationRoutes = require('./routes/integrationRoutes');
app.use('/api/integrations', integrationRoutes);

// Файлы
const fileRoutes = require('./routes/fileRoutes');
app.use('/api/files', fileRoutes);

// Типы локаций (справочник)
const locationTypeRoutes = require('./routes/locationTypeRoutes');
app.use('/api/location-types', locationTypeRoutes);

// Производители
const manufacturerRoutes = require('./routes/manufacturerRoutes');
app.use('/api/manufacturers', manufacturerRoutes);

// Типы фильтров
const filterTypeRoutes = require('./routes/filterTypeRoutes');
app.use('/api/filter-types', filterTypeRoutes);

// Единицы измерения
const unitRoutes = require('./routes/unitRoutes');
app.use('/api/units', unitRoutes);

// Настройки системы
const settingRoutes = require('./routes/settingRoutes');
app.use('/api/settings', settingRoutes);

// Используется для мониторинга работоспособности сервера
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== Обработка ошибок ==========

// Обработка 404 (ресурс не найден)
app.use((req, res, next) => {
  next(new ApiError(404, 'Ресурс не найден'));
});

// Центральный обработчик ошибок
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  // Логируем ошибку
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (!err.isOperational) {
      logger.error(err.stack);
    }
  } else {
    logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  // Отправляем ответ клиенту
  res.status(statusCode).json({
    error: {
      code: statusCode,
      message: statusCode === 500 && !err.isOperational ? 'Внутренняя ошибка сервера' : message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

module.exports = app;