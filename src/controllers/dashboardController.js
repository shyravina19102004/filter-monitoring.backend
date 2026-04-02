const { Notification, FilterInstance, WorkOrder, FilterModel, Installation, FilterHousing, Location, Meter, sequelize } = require('../models');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');

async function getCurrentUsage(installation) {
  const now = new Date();
  const installDate = new Date(installation.installationDate);
  const daysUsed = Math.floor((now - installDate) / (1000 * 60 * 60 * 24));
  let volumeUsed = 0;
  if (installation.meter && installation.meterReadingAtInstall !== null) {
    volumeUsed = (installation.meter.lastValue || 0) - installation.meterReadingAtInstall;
    if (volumeUsed < 0) volumeUsed = 0;
  }
  return { daysUsed, volumeUsed };
}

exports.getSummary = async (req, res) => {
  try {
    const accessibleIds = await getAccessibleLocationIds(req.user);
    const locationWhere = accessibleIds && Array.isArray(accessibleIds) && accessibleIds.length > 0
      ? { id: { [Op.in]: accessibleIds } }
      : {};

    const criticalNotifications = await Notification.count({
      where: {
        userId: req.user.id,
        severity: 'critical',
        isRead: false
      }
    });

    const installations = await Installation.findAll({
      where: { isActive: true },
      include: [
        {
          model: FilterHousing,
          as: 'housing',
          required: true,
          include: [
            {
              model: Location,
              as: 'location',
              required: true,
              where: locationWhere
            }
          ]
        },
        {
          model: FilterInstance,
          as: 'filterInstance',
          required: true,
          include: [{ model: FilterModel, as: 'model' }]
        },
        { model: Meter, as: 'meter' }
      ]
    });

    let upcomingReplacements = 0;
    for (const inst of installations) {
      const filterModel = inst.filterInstance?.model;
      if (!filterModel) continue;
      const { daysUsed, volumeUsed } = await getCurrentUsage(inst);

      let timeCritical = false;
      if (filterModel.lifeTimeDays && filterModel.lifeTimeDays > 0) {
        const daysPercent = (daysUsed / filterModel.lifeTimeDays) * 100;
        if (daysPercent >= 90) timeCritical = true;
      }

      let volumeCritical = false;
      if (filterModel.lifeVolume && filterModel.lifeVolume > 0) {
        const volumePercent = (volumeUsed / filterModel.lifeVolume) * 100;
        if (volumePercent >= 90) volumeCritical = true;
      }

      if (timeCritical || volumeCritical) upcomingReplacements++;
    }

    // 3. Остатки на складе
    const stock = await FilterInstance.findAll({
      where: { status: 'in_stock' },
      attributes: [
        'filterModelId',
        [sequelize.fn('COUNT', sequelize.col('FilterInstance.id')), 'count'],
        [sequelize.fn('MIN', sequelize.col('model.minStock')), 'minStock']
      ],
      group: ['filterModelId'],
      include: [{ model: FilterModel, as: 'model', attributes: [] }]
    });

    let totalStock = 0;
    let lowStock = 0;
    for (const item of stock) {
      const count = parseInt(item.dataValues.count);
      totalStock += count;
      const minStock = parseInt(item.dataValues.minStock) || 0;
      if (count <= minStock) lowStock++;
    }

    const totalReplacements = await WorkOrder.count({ where: { workType: 'replacement' } });
    const lateReplacements = await Notification.count({
      where: { severity: 'critical', ruleId: { [Op.ne]: null } }
    });
    const efficiency = totalReplacements
      ? Math.round((1 - lateReplacements / totalReplacements) * 100)
      : 0;

    res.json({
      criticalNotifications,
      upcomingReplacements,
      stockSummary: { total: totalStock, lowStock },
      efficiency
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    throw new ApiError(500, 'Ошибка получения сводки', false, error.stack);
  }
};