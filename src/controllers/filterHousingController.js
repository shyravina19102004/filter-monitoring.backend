const { FilterHousing, Location, Installation } = require('../models');
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

  const housings = await FilterHousing.findAll({
    where,
    include: [{ model: Location, as: 'location', attributes: ['id', 'name'] }]
  });
  res.json(housings);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const housing = await FilterHousing.findByPk(id, {
    include: [{ model: Location, as: 'location' }]
  });
  if (!housing) {
    throw new ApiError(404, 'Корпус не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(housing.locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }
  res.json(housing);
};

exports.create = async (req, res) => {
  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(req.body.locationId)) {
    throw new ApiError(403, 'Нет прав на создание в этой локации');
  }
  const newHousing = await FilterHousing.create(req.body);
  res.status(201).json(newHousing);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const housing = await FilterHousing.findByPk(id);
  if (!housing) {
    throw new ApiError(404, 'Корпус не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(housing.locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }

  if (req.body.locationId && req.body.locationId !== housing.locationId) {
    if (accessibleIds !== null && !accessibleIds.includes(req.body.locationId)) {
      throw new ApiError(403, 'Нет прав на перемещение');
    }
  }

  await housing.update(req.body);
  res.json(housing);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const housing = await FilterHousing.findByPk(id);
  if (!housing) {
    throw new ApiError(404, 'Корпус не найден');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(housing.locationId)) {
    throw new ApiError(403, 'Нет доступа');
  }

  const activeInstall = await Installation.findOne({ where: { housingId: id, isActive: true } });
  if (activeInstall) {
    throw new ApiError(400, 'Нельзя удалить корпус с активной установкой');
  }

  await housing.destroy();
  res.status(204).send();
};