const { NotificationConfig, Log } = require('../models');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Отправить уведомление через все активные каналы.
 * @param {Object} notification - объект уведомления
 * @param {number[]} userIds - массив ID пользователей
 */
async function sendNotification(notification, userIds = []) {
  logger.info(`[IntegrationEngine] sendNotification called for notification ID ${notification.id}`);

  const configs = await NotificationConfig.findAll({ where: { isActive: true } });
  logger.info(`[IntegrationEngine] Found ${configs.length} active notification configs`);

  if (configs.length === 0) {
    logger.warn('[IntegrationEngine] No active notification configs, skipping');
    return;
  }

  for (const cfg of configs) {
    try {
      logger.info(`[IntegrationEngine] Trying channel: ${cfg.channel}`);
      if (cfg.channel === 'email') {
        await sendEmail(cfg.config, notification);
      } else {
        logger.warn(`[IntegrationEngine] Unknown or unsupported channel: ${cfg.channel}`);
        continue;
      }

      // Логируем успешную отправку
      await Log.create({
        action: 'send_notification',
        module: 'integration',
        details: { notificationId: notification.id, channel: cfg.channel },
        status: 'success'
      });
    } catch (err) {
      logger.error(`[IntegrationEngine] Error sending via ${cfg.channel}: ${err.message}`);
      await Log.create({
        action: 'send_notification',
        module: 'integration',
        details: { notificationId: notification.id, channel: cfg.channel, error: err.message },
        status: 'error'
      });
    }
  }
}

async function sendEmail(config, notification) {
  const { host, port, secure, auth, from, to } = config;
  if (!host || !port || !auth?.user || !auth?.pass || !from || !to) {
    throw new Error('Email config missing required fields');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: secure || false,
    auth
  });

  const mailOptions = {
    from,
    to,
    subject: `[${notification.severity.toUpperCase()}] Уведомление о превышении ресурса фильтра`,
    text: formatMessage(notification),
    html: `<p>${formatMessage(notification).replace(/\n/g, '<br>')}</p>`
  };

  logger.info(`[Email] Sending to ${to}`);
  const info = await transporter.sendMail(mailOptions);
  logger.info(`[Email] Sent: ${info.messageId}`);
}

function formatMessage(notification) {
  const severityLabel = notification.severity === 'critical' ? 'КРИТИЧЕСКОЕ' : 'ВНИМАНИЕ';
  return `⚠️ <b>${severityLabel}</b>\n\n${notification.message}\n\nДата: ${new Date(notification.sentAt).toLocaleString('ru-RU')}`;
}

module.exports = { sendNotification };