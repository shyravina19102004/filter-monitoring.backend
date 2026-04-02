const { MeterReading, Meter, User, Location } = require('../models');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const ApiError = require('../utils/ApiError');

// GET /api/meter-readings
exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const where = {};

  if (req.query.meterId) where.meterId = req.query.meterId;
  if (req.query.startDate && req.query.endDate) {
    where.readingDate = { [Op.between]: [req.query.startDate, req.query.endDate] };
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  let count, rows;

  if (accessibleIds !== null) {
    if (accessibleIds.length === 0) {
      rows = [];
      count = 0;
    } else {
      const result = await MeterReading.findAndCountAll({
        where,
        include: [
          {
            model: Meter,
            as: 'meter',
            required: true,
            where: { locationId: { [Op.in]: accessibleIds } },
            include: [{ model: Location, as: 'location' }] // для CSV
          },
          { model: User, as: 'user', attributes: ['id', 'fullName'] }
        ],
        order: [['readingDate', 'DESC']],
        limit,
        offset,
        distinct: true
      });
      count = result.count;
      rows = result.rows;
    }
  } else {
    const result = await MeterReading.findAndCountAll({
      where,
      include: [
        { model: Meter, as: 'meter', include: [{ model: Location, as: 'location' }] },
        { model: User, as: 'user', attributes: ['id', 'fullName'] }
      ],
      order: [['readingDate', 'DESC']],
      limit,
      offset
    });
    count = result.count;
    rows = result.rows;
  }

  // Экспорт в CSV, если запрошен
  if (req.query.format === 'csv') {
    const csvRows = [];
    // Заголовки
    csvRows.push(['id', 'meterId', 'value', 'readingDate', 'createdBy', 'notes', 'meterName', 'locationName'].join(','));
    // Данные
    for (const row of rows) {
      csvRows.push([
        row.id,
        row.meterId,
        row.value,
        row.readingDate,
        row.createdBy || '',
        `"${(row.notes || '').replace(/"/g, '""')}"`,
        `"${(row.meter?.name || '').replace(/"/g, '""')}"`,
        `"${(row.meter?.location?.name || '').replace(/"/g, '""')}"`
      ].join(','));
    }
    const csvContent = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="meter-readings.csv"');
    return res.send(csvContent);
  }

  res.json({ total: count, page, limit, data: rows });
};

// GET /api/meter-readings/:id
exports.getOne = async (req, res) => {
  const { id } = req.params;
  const reading = await MeterReading.findByPk(id, {
    include: [
      { model: Meter, as: 'meter' },
      { model: User, as: 'user', attributes: ['id', 'fullName'] }
    ]
  });
  if (!reading) {
    throw new ApiError(404, 'Показание не найдено');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    const meter = await Meter.findByPk(reading.meterId);
    if (meter && !accessibleIds.includes(meter.locationId)) {
      throw new ApiError(403, 'Нет доступа');
    }
  }
  res.json(reading);
};

// POST /api/meter-readings
exports.create = async (req, res) => {
  const { meterId, value, readingDate, notes } = req.body;

  // Проверка на отрицательное значение
  if (value < 0) {
    throw new ApiError(400, 'Показание не может быть отрицательным');
  }

  const meter = await Meter.findByPk(meterId);
  if (!meter) {
    throw new ApiError(404, 'Счётчик не найден');
  }

  // Проверка на уменьшение показаний
  if (meter.lastValue !== null && value < meter.lastValue) {
    throw new ApiError(400, `Новое показание (${value}) не может быть меньше предыдущего (${meter.lastValue})`);
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(meter.locationId)) {
    throw new ApiError(403, 'Нет доступа к этому счётчику');
  }

  const transaction = await sequelize.transaction();
  try {
    const newReading = await MeterReading.create({
      meterId,
      value,
      readingDate: readingDate || new Date(),
      createdBy: req.user.id,
      notes,
      source: 'manual'
    }, { transaction });

    meter.lastValue = value;
    meter.lastReadingDate = readingDate || new Date();
    await meter.save({ transaction });

    await transaction.commit();
    res.status(201).json(newReading);
  } catch (error) {
    await transaction.rollback();
    throw new ApiError(500, error.message, false, error.stack);
  }
};

// PUT /api/meter-readings/:id
exports.update = async (req, res) => {
  const { id } = req.params;
  const reading = await MeterReading.findByPk(id);
  if (!reading) {
    throw new ApiError(404, 'Показание не найдено');
  }

  if (req.user.role.name !== 'admin') {
    throw new ApiError(403, 'Только администратор может редактировать показания');
  }

  await reading.update(req.body);
  res.json(reading);
};

// DELETE /api/meter-readings/:id
exports.delete = async (req, res) => {
  const { id } = req.params;
  const reading = await MeterReading.findByPk(id);
  if (!reading) {
    throw new ApiError(404, 'Показание не найдено');
  }

  if (req.user.role.name !== 'admin') {
    throw new ApiError(403, 'Только администратор может удалять показания');
  }

  await reading.destroy();
  res.status(204).send();
};