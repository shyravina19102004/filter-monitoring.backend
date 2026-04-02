const { Meter, Location, Unit } = require('../models');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const where = {};
  if (req.query.locationId) where.locationId = req.query.locationId;

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    if (accessibleIds.length === 0) return res.json([]);
    where.locationId = { [Op.in]: accessibleIds };
  }

  const meters = await Meter.findAll({
    where,
    include: [
      { model: Location, as: 'location', attributes: ['id', 'name'] },
      { model: Unit, as: 'unit', attributes: ['id', 'name', 'symbol'] }
    ]
  });
  res.json(meters);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const meter = await Meter.findByPk(id, {
    include: [
      { model: Location, as: 'location' },
      { model: Unit, as: 'unit' }
    ]
  });
  if (!meter) {
    throw new ApiError(404, 'Счётчик не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(meter.locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }
  res.json(meter);
};

exports.create = async (req, res) => {
  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(req.body.locationId)) {
    throw new ApiError(403, 'Нет прав на создание в этой локации');
  }
  const newMeter = await Meter.create(req.body);
  res.status(201).json(newMeter);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const meter = await Meter.findByPk(id);
  if (!meter) {
    throw new ApiError(404, 'Счётчик не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(meter.locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }

  if (req.body.locationId && req.body.locationId !== meter.locationId) {
    if (accessibleIds !== null && !accessibleIds.includes(req.body.locationId)) {
      throw new ApiError(403, 'Нет прав на перемещение');
    }
  }

  await meter.update(req.body);
  res.json(meter);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const meter = await Meter.findByPk(id);
  if (!meter) {
    throw new ApiError(404, 'Счётчик не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(meter.locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }

  await meter.destroy();
  res.status(204).send();
};