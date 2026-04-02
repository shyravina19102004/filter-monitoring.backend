const toirSyncService = require('../services/toirSyncService');
const { Setting, Log, NotificationConfig } = require('../models');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

exports.getStatus = async (req, res) => {
  const settings = await Setting.findAll({
    where: { key: ['toir.lastSyncTime', 'toir.lastSyncStatus'] }
  });
  const status = {};
  settings.forEach(s => status[s.key] = s.value);

  const notificationConfigs = await NotificationConfig.findAll({
    where: { isActive: true }
  });
  const channels = {};
  notificationConfigs.forEach(c => {
    channels[c.channel] = { active: true, description: c.description };
  });

  res.json({
    toir: {
      lastSync: status['toir.lastSyncTime'] || null,
      lastStatus: status['toir.lastSyncStatus'] || 'unknown'
    },
    notificationChannels: channels
  });
};

exports.syncToir = async (req, res) => {
  setImmediate(() => toirSyncService.syncWithToir().catch(err => logger.error(err)));
  res.json({ message: 'Синхронизация с ТОИР запущена' });
};

exports.getSyncLogs = async (req, res) => {
  const logs = await Log.findAll({
    where: { action: 'toir_sync' },
    order: [['createdAt', 'DESC']],
    limit: 50
  });
  res.json(logs);
};