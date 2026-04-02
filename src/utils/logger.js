const winston = require('winston');
const { Log } = require('../models'); // импортируем модель Log для записи в БД

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // включаем стек ошибок
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

/**
 * Асинхронная запись лога в таблицу `logs`
 * @param {Object} data - данные для записи
 * @param {number} [data.userId] - ID пользователя
 * @param {string} data.action - действие (например, 'CREATE_USER')
 * @param {string} data.module - модуль (например, 'users')
 * @param {string} data.ipAddress - IP-адрес
 * @param {string} data.userAgent - User-Agent
 * @param {string} data.status - статус ('success', 'error', 'warning')
 * @param {Object} data.details - дополнительные детали (JSON)
 */
logger.logToDb = async (data) => {
  try {
    await Log.create(data);
  } catch (err) {
    logger.error('Failed to write log to DB:', err);
  }
};

module.exports = logger;