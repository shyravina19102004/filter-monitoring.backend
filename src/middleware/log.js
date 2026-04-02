const logger = require('../utils/logger');

// Поля, которые нельзя сохранять в логах
const SENSITIVE_FIELDS = ['password', 'currentPassword', 'newPassword', 'passwordHash'];

/**
 * Очищает объект от чувствительных полей
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  const cleaned = { ...body };
  for (const field of SENSITIVE_FIELDS) {
    if (field in cleaned) {
      cleaned[field] = '***';
    }
  }
  return cleaned;
}

/**
 * Middleware для логирования успешных действий пользователя в БД.
 * @param {string} action - Тип действия (например 'CREATE_USER')
 * @param {string} module - Модуль системы (например 'users')
 * @returns {Function} Middleware
 */
const logAction = (action, module) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
      res.locals.responseData = data;
      originalJson.call(this, data);
    };

    res.on('finish', async () => {
      // Логируем только успешные ответы (2xx) и только если пользователь авторизован
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        await logger.logToDb({
          userId: req.user.id,
          action,
          module,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          status: 'success',
          details: {
            method: req.method,
            url: req.originalUrl,
            body: sanitizeBody(req.body),       // безопасная версия тела
            response: res.locals.responseData
          }
        }).catch(err => logger.error('Ошибка при записи лога в БД:', err));
      }
    });
    next();
  };
};

module.exports = logAction;