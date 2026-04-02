const { Op } = require('sequelize');
const {
  Installation,
  FilterHousing,
  FilterInstance,
  FilterModel,
  FilterType,
  Rule,
  Notification,
  Meter,
  MeterReading,
  User,
  Location,
  WorkOrder,
  Role,
  sequelize,
} = require('../models');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const { generateReport } = require('../services/documentGenerator');
const ApiError = require('../utils/ApiError');

async function getLocationFilter(req) {
  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds === null) return {};
  if (accessibleIds.length === 0) return { id: null };
  return { id: { [Op.in]: accessibleIds } };
}

// 1. Отчёт по нарушениям сроков ТО
exports.getViolations = async (req, res) => {
  try {
    const { startDate, endDate, locationId, format } = req.query;
    const locationFilter = await getLocationFilter(req);

    const whereNotifications = {};
    if (startDate && endDate) {
      whereNotifications.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const include = [
      {
        model: Installation,
        as: 'installation',
        required: true,
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
                where: locationFilter,
              },
            ],
          },
        ],
      },
      { model: Rule, as: 'rule' },
    ];

    if (locationId && !locationFilter.id) {
      include[0].include[0].include[0].where = { id: locationId };
    }

    const notifications = await Notification.findAll({
      where: whereNotifications,
      include,
      order: [['createdAt', 'DESC']],
    });

    const rows = notifications.map((n) => ({
      id: n.id,
      installationId: n.installationId,
      location: n.installation?.housing?.location?.name || '—',
      housing: n.installation?.housing?.name || '—',
      rule: n.rule?.description || n.rule?.parameter || '—',
      message: n.message,
      severity: n.severity,
      createdAt: n.createdAt.toLocaleString('ru-RU'),
    }));

    const columns = [
      { header: 'ID', key: 'id' },
      { header: 'ID установки', key: 'installationId' },
      { header: 'Локация', key: 'location' },
      { header: 'Корпус', key: 'housing' },
      { header: 'Правило', key: 'rule' },
      { header: 'Сообщение', key: 'message' },
      { header: 'Важность', key: 'severity' },
      { header: 'Дата', key: 'createdAt' },
    ];

    const title = 'Отчёт по нарушениям сроков ТО';

    if (format === 'pdf' || format === 'xlsx') {
      const buffer = await generateReport(format, title, columns, rows);
      const mime = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="violations.${format === 'xlsx' ? 'xlsx' : 'pdf'}"`);
      return res.send(buffer);
    } else {
      return res.json({ message: 'Отчёт по нарушениям', data: rows });
    }
  } catch (error) {
    throw new ApiError(500, 'Ошибка формирования отчёта', false, error.stack);
  }
};

// 2. Анализ наработки
exports.getUsageAnalysis = async (req, res) => {
  try {
    const { startDate, endDate, locationId, format } = req.query;
    const locationFilter = await getLocationFilter(req);

    const whereInstallation = { isActive: true };
    const includeHousing = {
      model: FilterHousing,
      as: 'housing',
      required: true,
      include: [
        {
          model: Location,
          as: 'location',
          required: true,
          where: locationFilter,
        },
      ],
    };
    if (locationId && !locationFilter.id) {
      includeHousing.include[0].where = { id: locationId };
    }

    const installations = await Installation.findAll({
      where: whereInstallation,
      include: [
        includeHousing,
        {
          model: FilterInstance,
          as: 'filterInstance',
          include: [{ model: FilterModel, as: 'model' }],
        },
        { model: Meter, as: 'meter' },
      ],
    });

    const rows = [];
    for (const inst of installations) {
      const filterModel = inst.filterInstance?.model;
      if (!filterModel) continue;

      const now = new Date();
      const installDate = new Date(inst.installationDate);
      const daysUsed = Math.floor((now - installDate) / (1000 * 60 * 60 * 24));

      let volumeUsed = 0;
      if (inst.meter && inst.meterReadingAtInstall !== null) {
        volumeUsed = (inst.meter.lastValue || 0) - inst.meterReadingAtInstall;
        if (volumeUsed < 0) volumeUsed = 0;
      }

      const lifeTimeDays = filterModel.lifeTimeDays || 0;
      const lifeVolume = filterModel.lifeVolume || 0;

      rows.push({
        installationId: inst.id,
        location: inst.housing?.location?.name || '—',
        housing: inst.housing?.name || '—',
        filterModel: filterModel.name,
        daysUsed,
        daysLimit: lifeTimeDays,
        daysPercent: lifeTimeDays ? Math.round((daysUsed / lifeTimeDays) * 100) : 0,
        volumeUsed,
        volumeLimit: lifeVolume,
        volumePercent: lifeVolume ? Math.round((volumeUsed / lifeVolume) * 100) : 0,
        status: daysUsed >= lifeTimeDays || volumeUsed >= lifeVolume ? 'Превышение' : 'Норма',
      });
    }

    const columns = [
      { header: 'ID установки', key: 'installationId' },
      { header: 'Локация', key: 'location' },
      { header: 'Корпус', key: 'housing' },
      { header: 'Модель фильтра', key: 'filterModel' },
      { header: 'Дней использования', key: 'daysUsed' },
      { header: 'Лимит дней', key: 'daysLimit' },
      { header: '% времени', key: 'daysPercent' },
      { header: 'Объём (л/ч)', key: 'volumeUsed' },
      { header: 'Лимит объёма', key: 'volumeLimit' },
      { header: '% объёма', key: 'volumePercent' },
      { header: 'Статус', key: 'status' },
    ];

    const title = 'Анализ наработки фильтров';

    if (format === 'pdf' || format === 'xlsx') {
      const buffer = await generateReport(format, title, columns, rows);
      const mime = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="usage-analysis.${format === 'xlsx' ? 'xlsx' : 'pdf'}"`);
      return res.send(buffer);
    } else {
      return res.json({ message: 'Анализ наработки', data: rows });
    }
  } catch (error) {
    throw new ApiError(500, 'Ошибка формирования отчёта', false, error.stack);
  }
};

// 3. Прогноз расхода
exports.getForecast = async (req, res) => {
  try {
    const { months = 1, format } = req.query;
    const locationFilter = await getLocationFilter(req);

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
              where: locationFilter,
            },
          ],
        },
        {
          model: FilterInstance,
          as: 'filterInstance',
          include: [
            {
              model: FilterModel,
              as: 'model',
              include: [{ model: FilterType, as: 'type' }]
            }
          ],
        },
        { model: Meter, as: 'meter' },
      ],
    });

    const forecastMap = new Map();

    for (const inst of installations) {
      const model = inst.filterInstance?.model;
      if (!model) continue;

      const key = model.id;
      if (!forecastMap.has(key)) {
        forecastMap.set(key, {
          modelId: model.id,
          modelName: model.name,
          filterType: model.type?.name || '—',
          currentStock: 0,
          minStock: model.minStock || 0,
          estimatedReplacements: 0,
        });
      }
      const record = forecastMap.get(key);

      const now = new Date();
      const installDate = new Date(inst.installationDate);
      const daysUsed = Math.floor((now - installDate) / (1000 * 60 * 60 * 24));
      const lifeTimeDays = model.lifeTimeDays;
      let daysLeft = lifeTimeDays ? lifeTimeDays - daysUsed : Infinity;

      let volumeUsed = 0;
      if (inst.meter && inst.meterReadingAtInstall !== null) {
        volumeUsed = (inst.meter.lastValue || 0) - inst.meterReadingAtInstall;
        if (volumeUsed < 0) volumeUsed = 0;
      }
      const lifeVolume = model.lifeVolume;
      let volumeLeft = lifeVolume ? lifeVolume - volumeUsed : Infinity;

      const monthsNum = parseInt(months) || 1;
      const msInMonth = 30 * 24 * 60 * 60 * 1000;
      const horizonMs = monthsNum * msInMonth;

      if (lifeTimeDays) {
        const msPerDay = 24 * 60 * 60 * 1000;
        const timeToReplaceMs = daysLeft * msPerDay;
        if (timeToReplaceMs <= horizonMs) {
          record.estimatedReplacements += Math.ceil(horizonMs / timeToReplaceMs);
        }
      }
      if (lifeVolume && daysUsed > 0) {
        const avgVolumePerDay = volumeUsed / daysUsed;
        if (avgVolumePerDay > 0) {
          const daysToReplaceByVolume = volumeLeft / avgVolumePerDay;
          if (daysToReplaceByVolume * msInMonth <= horizonMs) {
            record.estimatedReplacements += Math.ceil(horizonMs / (daysToReplaceByVolume * msInMonth));
          }
        }
      }
    }

    const stock = await FilterInstance.findAll({
      where: { status: 'in_stock' },
      attributes: ['filterModelId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['filterModelId'],
    });

    const stockMap = new Map(stock.map((s) => [s.filterModelId, parseInt(s.dataValues.count)]));

    const rows = [];
    for (const [modelId, record] of forecastMap.entries()) {
      rows.push({
        modelId: record.modelId,
        modelName: record.modelName,
        filterType: record.filterType,
        currentStock: stockMap.get(modelId) || 0,
        minStock: record.minStock,
        estimatedReplacements: Math.ceil(record.estimatedReplacements),
        recommendedOrder: Math.max(0, record.estimatedReplacements - (stockMap.get(modelId) || 0) + record.minStock),
      });
    }

    const columns = [
      { header: 'ID модели', key: 'modelId' },
      { header: 'Модель фильтра', key: 'modelName' },
      { header: 'Тип', key: 'filterType' },
      { header: 'Текущий запас', key: 'currentStock' },
      { header: 'Мин. запас', key: 'minStock' },
      { header: 'Прогноз замен', key: 'estimatedReplacements' },
      { header: 'Рекомендуемый заказ', key: 'recommendedOrder' },
    ];

    const title = `Прогноз расхода фильтров на ${months} мес.`;

    if (format === 'pdf' || format === 'xlsx') {
      const buffer = await generateReport(format, title, columns, rows);
      const mime = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="forecast.${format === 'xlsx' ? 'xlsx' : 'pdf'}"`);
      return res.send(buffer);
    } else {
      return res.json({ message: 'Прогноз расхода', data: rows });
    }
  } catch (error) {
    throw new ApiError(500, 'Ошибка формирования отчёта', false, error.stack);
  }
};

// 4. Эффективность мастеров
exports.getEfficiency = async (req, res) => {
  try {
    const { startDate, endDate, locationId, format } = req.query;
    const locationFilter = await getLocationFilter(req);

    const masters = await User.findAll({
      include: [
        {
          model: Role,
          as: 'role',
          where: { name: 'master' },
          attributes: [],
        },
        {
          model: Location,
          as: 'location',
          required: false,
          where: locationFilter,
        },
      ],
      attributes: ['id', 'fullName', 'locationId'],
    });

    const rows = [];
    for (const master of masters) {
      const whereWorkOrder = {
        approvedBy: master.id,
        workType: 'replacement',
      };
      if (startDate && endDate) {
        whereWorkOrder.workDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }

      const totalReplacements = await WorkOrder.count({ where: whereWorkOrder });

      let violationsCount = 0;
      if (master.locationId) {
        const subLocations = await sequelize.query(
          `WITH RECURSIVE loc_tree AS (
             SELECT id FROM locations WHERE id = :rootId
             UNION ALL
             SELECT l.id FROM locations l
             INNER JOIN loc_tree lt ON lt.id = l."parentId"
           ) SELECT id FROM loc_tree`,
          {
            replacements: { rootId: master.locationId },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        const locationIds = subLocations.map((l) => l.id);

        // Если locationIds не пуст, добавляем условие, иначе violationsCount = 0
        if (locationIds.length > 0) {
          violationsCount = await Notification.count({
            where: {
              severity: 'critical',
              createdAt: whereWorkOrder.workDate,
            },
            include: [
              {
                model: Installation,
                as: 'installation',
                required: true,
                include: [
                  {
                    model: FilterHousing,
                    as: 'housing',
                    required: true,
                    where: { locationId: locationIds },
                  },
                ],
              },
            ],
          });
        }
      }

      const efficiency = totalReplacements === 0 ? 0 : Math.round((totalReplacements / (violationsCount + 1)) * 100);

      rows.push({
        masterId: master.id,
        masterName: master.fullName,
        location: master.location?.name || '—',
        totalReplacements,
        violations: violationsCount,
        efficiency: efficiency > 100 ? 100 : efficiency,
      });
    }

    const columns = [
      { header: 'ID мастера', key: 'masterId' },
      { header: 'Мастер', key: 'masterName' },
      { header: 'Участок', key: 'location' },
      { header: 'Кол-во замен', key: 'totalReplacements' },
      { header: 'Кол-во нарушений', key: 'violations' },
      { header: 'Эффективность, %', key: 'efficiency' },
    ];

    const title = 'Эффективность мастеров';

    if (format === 'pdf' || format === 'xlsx') {
      const buffer = await generateReport(format, title, columns, rows);
      const mime = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="efficiency.${format === 'xlsx' ? 'xlsx' : 'pdf'}"`);
      return res.send(buffer);
    } else {
      return res.json({ message: 'Эффективность мастеров', data: rows });
    }
  } catch (error) {
    throw new ApiError(500, 'Ошибка формирования отчёта', false, error.stack);
  }
};

// 5. Складские остатки
exports.getStock = async (req, res) => {
  try {
    const { format } = req.query;

    // 1. Получаем количество in_stock экземпляров по моделям
    const stockCounts = await FilterInstance.findAll({
      where: { status: 'in_stock' },
      attributes: [
        'filterModelId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['filterModelId'],
      raw: true,
    });

    if (stockCounts.length === 0) {
      const rows = [];
      const columns = [
        { header: 'ID модели', key: 'modelId' },
        { header: 'Модель фильтра', key: 'modelName' },
        { header: 'Тип', key: 'filterType' },
        { header: 'Количество', key: 'quantity' },
        { header: 'Мин. запас', key: 'minStock' },
        { header: 'Статус', key: 'status' },
      ];
      const title = 'Складские остатки фильтров';
      if (format === 'pdf' || format === 'xlsx') {
        const buffer = await generateReport(format, title, columns, rows);
        const mime = format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf';
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Disposition', `attachment; filename="stock.${format === 'xlsx' ? 'xlsx' : 'pdf'}"`);
        return res.send(buffer);
      } else {
        return res.json({ message: 'Складские остатки', data: rows });
      }
    }

    // 2. Получаем детали моделей для этих filterModelId
    const modelIds = stockCounts.map(item => item.filterModelId);
    const models = await FilterModel.findAll({
      where: { id: modelIds },
      include: [{ model: FilterType, as: 'type', attributes: ['name'] }],
      attributes: ['id', 'name', 'minStock'],
    });

    // 3. Объединяем
    const rows = stockCounts.map(stock => {
      const model = models.find(m => m.id === stock.filterModelId);
      const quantity = parseInt(stock.count);
      const minStock = model?.minStock || 0;
      return {
        modelId: stock.filterModelId,
        modelName: model?.name || '—',
        filterType: model?.type?.name || '—',
        quantity: quantity,
        minStock: minStock,
        status: quantity <= minStock ? 'Требуется заказ' : 'Норма',
      };
    });

    const columns = [
      { header: 'ID модели', key: 'modelId' },
      { header: 'Модель фильтра', key: 'modelName' },
      { header: 'Тип', key: 'filterType' },
      { header: 'Количество', key: 'quantity' },
      { header: 'Мин. запас', key: 'minStock' },
      { header: 'Статус', key: 'status' },
    ];

    const title = 'Складские остатки фильтров';

    if (format === 'pdf' || format === 'xlsx') {
      const buffer = await generateReport(format, title, columns, rows);
      const mime = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="stock.${format === 'xlsx' ? 'xlsx' : 'pdf'}"`);
      return res.send(buffer);
    } else {
      return res.json({ message: 'Складские остатки', data: rows });
    }
  } catch (error) {
    throw new ApiError(500, 'Ошибка формирования отчёта', false, error.stack);
  }
};

// 6. Динамика показателей
exports.getDynamics = async (req, res) => {
  try {
    const { startDate, endDate, interval = 'month', locationId, format } = req.query;
    const locationFilter = await getLocationFilter(req);

    let dateTrunc;
    switch (interval) {
      case 'day': dateTrunc = 'day'; break;
      case 'week': dateTrunc = 'week'; break;
      default: dateTrunc = 'month'; break;
    }

    const replacementsQuery = `
      SELECT
        DATE_TRUNC(:interval, "workDate") AS period,
        COUNT(*) AS count
      FROM work_orders
      WHERE "workType" = 'replacement'
        AND "workDate" BETWEEN :startDate AND :endDate
      GROUP BY period
      ORDER BY period
    `;

    const replacements = await sequelize.query(replacementsQuery, {
      replacements: {
        interval: dateTrunc,
        startDate: startDate || '1970-01-01',
        endDate: endDate || '2100-01-01',
      },
      type: sequelize.QueryTypes.SELECT,
    });

    // Определяем список ID локаций для фильтрации
    let locationIds = [];
    if (locationId) {
      locationIds = [locationId];
    } else if (locationFilter.id && locationFilter.id[Op.in]) {
      locationIds = locationFilter.id[Op.in];
    }

    const notificationsQuery = `
      SELECT
        DATE_TRUNC(:interval, n."createdAt") AS period,
        COUNT(*) AS count
      FROM notifications n
      INNER JOIN installations i ON n."installationId" = i.id
      INNER JOIN filter_housings fh ON i."housingId" = fh.id
      INNER JOIN locations l ON fh."locationId" = l.id
      WHERE n.severity = 'critical'
        AND n."createdAt" BETWEEN :startDate AND :endDate
        ${locationIds.length ? 'AND l.id IN (:locationIds)' : ''}
      GROUP BY period
      ORDER BY period
    `;

    const notifications = await sequelize.query(notificationsQuery, {
      replacements: {
        interval: dateTrunc,
        startDate: startDate || '1970-01-01',
        endDate: endDate || '2100-01-01',
        locationIds: locationIds.length ? locationIds : null,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    // Объединяем периоды
    const periods = new Set();
    replacements.forEach((r) => periods.add(r.period));
    notifications.forEach((n) => periods.add(n.period));

    const rows = Array.from(periods)
      .sort()
      .map((period) => ({
        period: new Date(period).toLocaleDateString('ru-RU'),
        replacements: replacements.find((r) => r.period === period)?.count || 0,
        criticalNotifications: notifications.find((n) => n.period === period)?.count || 0,
      }));

    const columns = [
      { header: 'Период', key: 'period' },
      { header: 'Количество замен', key: 'replacements' },
      { header: 'Крит. уведомления', key: 'criticalNotifications' },
    ];

    const title = `Динамика показателей (по ${interval === 'day' ? 'дням' : interval === 'week' ? 'неделям' : 'месяцам'})`;

    if (format === 'pdf' || format === 'xlsx') {
      const buffer = await generateReport(format, title, columns, rows);
      const mime = format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="dynamics.${format === 'xlsx' ? 'xlsx' : 'pdf'}"`);
      return res.send(buffer);
    } else {
      return res.json({ message: 'Динамика показателей', data: rows });
    }
  } catch (error) {
    throw new ApiError(500, 'Ошибка формирования отчёта', false, error.stack);
  }
};

// 7. Универсальный экспорт
exports.exportReport = async (req, res) => {
  const { type } = req.query;
  switch (type) {
    case 'violations': return exports.getViolations(req, res);
    case 'usage': return exports.getUsageAnalysis(req, res);
    case 'forecast': return exports.getForecast(req, res);
    case 'efficiency': return exports.getEfficiency(req, res);
    case 'stock': return exports.getStock(req, res);
    case 'dynamics': return exports.getDynamics(req, res);
    default:
      throw new ApiError(400, 'Неверный тип отчёта');
  }
};