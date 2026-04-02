const axios = require('axios');
const { Op } = require('sequelize');
const { Setting, WorkOrder, Installation, FilterHousing, FilterInstance, Location, sequelize } = require('../models');
const logger = require('../utils/logger');

async function getToirSettings() {
  const settings = await Setting.findAll({
    where: { key: { [Op.in]: ['toir.apiUrl', 'toir.apiKey', 'toir.lastSyncTime', 'toir.lastSyncStatus'] } }
  });
  const result = {};
  settings.forEach(s => result[s.key] = s.value);
  return result;
}

async function updateSyncStatus(status, errorMessage = null) {
  await Setting.upsert({ key: 'toir.lastSyncTime', value: new Date().toISOString() });
  await Setting.upsert({ key: 'toir.lastSyncStatus', value: status });
  if (errorMessage) {
    logger.error(`TOIR sync failed: ${errorMessage}`);
  }
}

async function findHousingByExternalId(externalId) {
  const location = await Location.findOne({ where: { externalId } });
  if (!location) return null;
  return await FilterHousing.findOne({ where: { locationId: location.id } });
}

async function syncWithToir() {
  logger.info('TOIR sync started');
  const settings = await getToirSettings();
  const apiUrl = settings['toir.apiUrl'];
  const apiKey = settings['toir.apiKey'];

  if (!apiUrl || !apiKey) {
    logger.warn('TOIR integration not configured');
    await updateSyncStatus('skipped', 'API URL or key missing');
    return;
  }

  try {
    const lastSync = settings['toir.lastSyncTime'];
    let page = 1;
    const limit = 100; // размер страницы
    let hasMore = true;
    let imported = 0;

    while (hasMore) {
      const params = { page, limit };
      if (lastSync) {
        params.from = new Date(lastSync).toISOString();
      }

      const response = await axios.get(`${apiUrl}/work-orders`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        params
      });

      // Предполагаем, что ответ содержит { data: [...], total: number }
      const workOrders = response.data.data || response.data; // на случай, если data не обёрнута
      const total = response.data.total || (workOrders.length === limit ? Infinity : page * limit);

      if (!workOrders.length) break;

      for (const wo of workOrders) {
        const existing = await WorkOrder.findOne({ where: { externalId: wo.id } });
        if (existing) continue;

        const housing = await findHousingByExternalId(wo.equipmentExternalId);
        if (!housing) {
          logger.warn(`Housing not found for externalId ${wo.equipmentExternalId}, skipping work order ${wo.id}`);
          continue;
        }

        const installationAtDate = await Installation.findOne({
          where: {
            housingId: housing.id,
            installationDate: { [Op.lte]: wo.date },
            [Op.or]: [
              { removalDate: { [Op.gte]: wo.date } },
              { removalDate: null }
            ]
          },
          order: [['installationDate', 'DESC']]
        });

        await sequelize.transaction(async (t) => {
          const newWorkOrder = await WorkOrder.create({
            workDate: wo.date,
            oldInstallationId: installationAtDate ? installationAtDate.id : null,
            workType: wo.type || 'replacement',
            notes: wo.description || `Импортировано из ТОИР (ID ${wo.id})`,
            status: 'confirmed',
            externalId: wo.id,
            source: 'toir'
          }, { transaction: t });

          if (wo.type === 'replacement' && wo.newFilterSerial) {
            let filterInstance = await FilterInstance.findOne({
              where: { serialNumber: wo.newFilterSerial }
            });
            if (!filterInstance) {
              filterInstance = await FilterInstance.create({
                serialNumber: wo.newFilterSerial,
                status: 'installed',
                notes: 'Создано автоматически из ТОИР, модель не указана'
              }, { transaction: t });
              logger.warn(`Создан новый экземпляр фильтра с серийным номером ${wo.newFilterSerial} без модели (из ТОИР, work order ${wo.id})`);
            }

            if (installationAtDate) {
              await installationAtDate.update({ isActive: false }, { transaction: t });
              const oldFilter = await FilterInstance.findByPk(installationAtDate.filterInstanceId, { transaction: t });
              if (oldFilter) {
                await oldFilter.update({ status: 'written_off' }, { transaction: t });
              }
            }

            await Installation.create({
              housingId: housing.id,
              filterInstanceId: filterInstance.id,
              installationDate: wo.date,
              isActive: true,
              notes: 'Установлено из ТОИР'
            }, { transaction: t });
          }
        });

        imported++;
      }

      // Проверяем, есть ли следующая страница
      hasMore = page * limit < total;
      page++;
    }

    await updateSyncStatus('success');
    logger.info(`TOIR sync finished, imported ${imported} work orders`);
  } catch (err) {
    await updateSyncStatus('error', err.message);
    logger.error(`TOIR sync error: ${err.message}`);
  }
}

module.exports = {
  syncWithToir
};