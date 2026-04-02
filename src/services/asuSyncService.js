const axios = require('axios');
const { Op } = require('sequelize');
const { Setting, Meter, MeterReading, sequelize } = require('../models');
const logger = require('../utils/logger');

async function getAsuSettings() {
  const settings = await Setting.findAll({
    where: { key: { [Op.in]: ['asu.apiUrl', 'asu.apiKey', 'asu.lastSyncTime', 'asu.lastSyncStatus'] } }
  });
  const result = {};
  settings.forEach(s => result[s.key] = s.value);
  return result;
}

async function updateSyncStatus(status, errorMessage = null) {
  await Setting.upsert({ key: 'asu.lastSyncTime', value: new Date().toISOString() });
  await Setting.upsert({ key: 'asu.lastSyncStatus', value: status });
  if (errorMessage) {
    logger.error(`ASU sync failed: ${errorMessage}`);
  }
}

/**
 * Получает показания из АСУ ТП и сохраняет в базу.
 * Предполагается, что API возвращает массив объектов с полями:
 * - meterExternalId: идентификатор счётчика во внешней системе
 * - value: числовое показание
 * - readingDate: дата показания (ISO)
 * - notes: примечания
 *
 * В настройках можно указать mapping, но для простоты будем считать, что у счётчиков в нашей системе есть поле externalId,
 * которое соответствует meterExternalId.
 */
async function syncWithAsu() {
  logger.info('ASU sync started');
  const settings = await getAsuSettings();
  const apiUrl = settings['asu.apiUrl'];
  const apiKey = settings['asu.apiKey'];

  if (!apiUrl || !apiKey) {
    logger.warn('ASU integration not configured');
    await updateSyncStatus('skipped', 'API URL or key missing');
    return;
  }

  try {
    const lastSync = settings['asu.lastSyncTime'];
    const params = {};
    if (lastSync) {
      params.from = new Date(lastSync).toISOString();
    }

    const response = await axios.get(`${apiUrl}/readings`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      params
    });

    const readings = response.data; // ожидаем массив
    let imported = 0;

    for (const reading of readings) {
      // Находим счётчик в нашей системе по внешнему идентификатору
      const meter = await Meter.findOne({ where: { externalId: reading.meterExternalId } });
      if (!meter) {
        logger.warn(`Meter not found for externalId ${reading.meterExternalId}, skipping`);
        continue;
      }

      // Проверка, что новое показание не меньше предыдущего (защита от сброса)
      if (meter.lastValue !== null && reading.value < meter.lastValue) {
        logger.warn(`Skipping reading for meter ${meter.id}: new value ${reading.value} is less than previous ${meter.lastValue}`);
        continue;
      }

      // Начинаем транзакцию для сохранения показания и обновления последнего значения счётчика
      const transaction = await sequelize.transaction();
      try {
        // Создаём запись о показании
        await MeterReading.create({
          meterId: meter.id,
          value: reading.value,
          readingDate: reading.readingDate || new Date(),
          source: 'auto',   // указываем источник "auto"
          notes: reading.notes || 'Автоматический сбор из АСУ ТП',
          createdBy: null   // автоматические показания не привязаны к пользователю
        }, { transaction });

        // Обновляем lastValue в счётчике
        meter.lastValue = reading.value;
        meter.lastReadingDate = reading.readingDate || new Date();
        await meter.save({ transaction });

        await transaction.commit();
        imported++;
      } catch (err) {
        await transaction.rollback();
        logger.error(`Failed to save reading for meter ${meter.id}: ${err.message}`);
      }
    }

    await updateSyncStatus('success');
    logger.info(`ASU sync finished, imported ${imported} readings`);
  } catch (err) {
    await updateSyncStatus('error', err.message);
    logger.error(`ASU sync error: ${err.message}`);
  }
}

module.exports = { syncWithAsu };