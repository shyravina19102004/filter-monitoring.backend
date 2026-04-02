const cron = require('node-cron');
const rulesEngine = require('../services/rulesEngineService');
const toirSyncService = require('../services/toirSyncService');
const { Setting } = require('../models');
const logger = require('../utils/logger');

async function startScheduler() {

  // Синхронизация с АСУ ТП
  const asuSetting = await Setting.findOne({ where: { key: 'asu.syncCron' } });
  const asuSchedule = asuSetting ? asuSetting.value : '0 */6 * * *';
  if (cron.validate(asuSchedule)) {
    cron.schedule(asuSchedule, async () => {
      logger.info('Cron: starting ASU sync');
      try {
        await asuSyncService.syncWithAsu();
      } catch (err) {
        logger.error(`ASU sync failed: ${err.message}`);
      }
    });
    logger.info(`ASU sync scheduler started: ${asuSchedule}`);
  } else {
    logger.error(`Invalid ASU schedule: ${asuSchedule}`);
  }

module.exports = { startScheduler };
  // Правила – каждый час (из .env или по умолчанию)
  const ruleSchedule = process.env.CRON_SCHEDULE || '0 * * * *';
  if (cron.validate(ruleSchedule)) {
    cron.schedule(ruleSchedule, async () => {
      logger.info('Cron: starting rules check');
      try {
        await rulesEngine.checkAllInstallations();
      } catch (err) {
        logger.error(`Rules check failed: ${err.message}`);
      }
    });
    logger.info(`Rules scheduler started: ${ruleSchedule}`);
  } else {
    logger.error(`Invalid rule schedule: ${ruleSchedule}`);
  }

  // Синхронизация с ТОИР – получаем расписание из настроек
  const syncSetting = await Setting.findOne({ where: { key: 'toir.syncCron' } });
  const toirSchedule = syncSetting ? syncSetting.value : '0 2 * * *'; // по умолчанию в 2 ночи
  if (cron.validate(toirSchedule)) {
    cron.schedule(toirSchedule, async () => {
      logger.info('Cron: starting TOIR sync');
      try {
        await toirSyncService.syncWithToir();
      } catch (err) {
        logger.error(`TOIR sync failed: ${err.message}`);
      }
    });
    logger.info(`TOIR sync scheduler started: ${toirSchedule}`);
  } else {
    logger.error(`Invalid TOIR schedule: ${toirSchedule}`);
  }
}

module.exports = { startScheduler };