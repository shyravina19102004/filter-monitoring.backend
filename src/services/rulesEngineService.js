const { Op } = require('sequelize');
const { Installation, FilterInstance, FilterModel, Rule, Notification, Meter, User, Location, FilterHousing, sequelize } = require('../models');
const integrationEngine = require('./integrationEngine');
const logger = require('../utils/logger');
const { getResponsibleUsers } = require('../utils/locationAccess');

/**
 * Получить текущую наработку для установки.
 * @param {Object} installation - запись Installation с включёнными моделями (filterInstance, meter)
 * @returns {Promise<{ time: number, volume: number }>} наработка в днях и литрах/часах
 */
async function getCurrentUsage(installation) {
  const now = new Date();

  // Наработка по времени (дни)
  const timeUsage = Math.floor((now - new Date(installation.installationDate)) / (1000 * 60 * 60 * 24));

  // Наработка по объёму
  let volumeUsage = 0;
  if (installation.meterId && installation.meterReadingAtInstall !== null) {
    const meter = installation.meter || await Meter.findByPk(installation.meterId);
    if (meter && meter.lastValue !== null) {
      volumeUsage = meter.lastValue - installation.meterReadingAtInstall;
      if (volumeUsage < 0) volumeUsage = 0;
    }
  }

  logger.info(`getCurrentUsage for installation ${installation.id}: timeUsage=${timeUsage}, volumeUsage=${volumeUsage}`);
  return { time: timeUsage, volume: volumeUsage };
}

/**
 * Определить, нужно ли создавать новое уведомление для данной установки и правила.
 * @param {number} installationId
 * @param {number} ruleId
 * @returns {Promise<boolean>} true, если уведомление не создавалось за последние 24 часа
 */
async function shouldCreateNotification(installationId, ruleId) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await Notification.findOne({
    where: {
      installationId,
      ruleId,
      createdAt: { [Op.gte]: oneDayAgo }
    }
  });
  const result = !existing;
  logger.info(`shouldCreateNotification for installation ${installationId}, rule ${ruleId}: ${result} (existing=${!!existing})`);
  return result;
}

/**
 * Основная функция проверки всех активных установок.
 */
async function checkAllInstallations() {
  logger.info('Rules Engine: starting check of all active installations');

  const transaction = await sequelize.transaction();
  try {
    // 1. Получаем все активные установки с необходимыми связями
    const installations = await Installation.findAll({
      where: { isActive: true },
      include: [
        {
          model: FilterInstance,
          as: 'filterInstance',
          include: [{ model: FilterModel, as: 'model' }]
        },
        { model: Meter, as: 'meter' },
        { model: FilterHousing, as: 'housing' }
      ],
      transaction
    });

    logger.info(`Found ${installations.length} active installations`);

    for (const installation of installations) {
      // Логируем базовую информацию об установке
      logger.info(`Processing installation ${installation.id}: housingId=${installation.housingId}, filterInstanceId=${installation.filterInstanceId}, meterId=${installation.meterId}`);

      // Проверяем наличие filterModel
      const filterModel = installation.filterInstance?.model;
      if (!filterModel) {
        logger.warn(`Installation ${installation.id} has no filter model, skipping`);
        continue;
      }
      logger.info(`Installation ${installation.id}: filterModelId=${filterModel.id}`);

      // Проверяем наличие housing и locationId
      const locationId = installation.housing?.locationId;
      if (!locationId) {
        logger.warn(`Installation ${installation.id}: housing or locationId missing, skipping`);
        continue;
      }
      logger.info(`Installation ${installation.id}: locationId=${locationId}`);

      // 2. Получаем правила для этой модели фильтра
      const rules = await Rule.findAll({
        where: { filterModelId: filterModel.id, isActive: true },
        transaction
      });

      logger.info(`Installation ${installation.id}: found ${rules.length} active rules`);

      if (rules.length === 0) continue;

      // 3. Рассчитываем текущую наработку
      const usage = await getCurrentUsage(installation);

      // 4. Для каждого правила проверяем превышение
      for (const rule of rules) {
        logger.info(`Checking rule ${rule.id} for installation ${installation.id}: param=${rule.parameter}, threshold=${rule.threshold}, unit=${rule.unit}`);

        let isTriggered = false;
        let currentValue = 0;

        if (rule.parameter === 'time') {
          currentValue = usage.time;
          if (rule.unit === 'days' && currentValue >= rule.threshold) isTriggered = true;
        } else if (rule.parameter === 'volume') {
          currentValue = usage.volume;
          // Единицы могут быть litres, hours – сравниваем напрямую
          if (currentValue >= rule.threshold) isTriggered = true;
        }

        logger.info(`Rule ${rule.id}: currentValue=${currentValue}, isTriggered=${isTriggered}`);

        if (isTriggered) {
          // 5. Проверяем, не создавали ли уведомление недавно
          const needCreate = await shouldCreateNotification(installation.id, rule.id);
          if (!needCreate) {
            logger.info(`Notification for installation ${installation.id}, rule ${rule.id} already exists recently, skipping`);
            continue;
          }

          // 6. Получаем ответственных пользователей
          const responsibleUsers = locationId ? await getResponsibleUsers(locationId) : [];

          // 7. Создаём запись в notifications
          const notification = await Notification.create({
            installationId: installation.id,
            ruleId: rule.id,
            message: `Превышен лимит по ${rule.parameter === 'time' ? 'времени' : 'объёму'}. Текущее значение: ${currentValue} ${rule.unit}, порог: ${rule.threshold} ${rule.unit}.`,
            severity: rule.action,
            isRead: false,
            sentAt: new Date()
          }, { transaction });

          logger.info(`Notification created for installation ${installation.id}, rule ${rule.id}, id=${notification.id}`);

          // 8. Отправляем уведомление через внешние каналы
          integrationEngine.sendNotification(notification, responsibleUsers).catch(err => {
            logger.error(`Failed to send notification: ${err.message}`);
          });
        }
      }
    }

    await transaction.commit();
    logger.info('Rules Engine: check completed successfully');
  } catch (error) {
    await transaction.rollback();
    logger.error(`Rules Engine error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  checkAllInstallations
};