const { Location, LocationType } = require('../models');
const { getAccessibleLocationIds } = require('../utils/locationAccess');
const { sequelize } = require('../models');
const ApiError = require('../utils/ApiError');

// GET /api/locations
exports.getAll = async (req, res) => {
  const where = {};

  if (req.query.parentId !== undefined) {
    where.parentId = req.query.parentId === 'null' ? null : req.query.parentId;
  }
  if (req.query.locationTypeId) {
    where.locationTypeId = req.query.locationTypeId;
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null) {
    if (accessibleIds.length === 0) return res.json([]);
    where.id = accessibleIds;
  }

  const locations = await Location.findAll({
    where,
    include: [
      { model: LocationType, as: 'type' },
      { model: Location, as: 'parent', attributes: ['id', 'name'] }
    ],
    order: [['name', 'ASC']]
  });

  res.json(locations);
};

// GET /api/locations/tree
exports.getTree = async (req, res) => {
  const accessibleIds = await getAccessibleLocationIds(req.user);
  let where = {};
  if (accessibleIds !== null) {
    where.id = accessibleIds;
  }

  const locations = await Location.findAll({
    where,
    include: [{ model: LocationType, as: 'type' }],
    order: [['name', 'ASC']]
  });

  res.json(locations);
};

// GET /api/locations/:id
exports.getOne = async (req, res) => {
  const { id } = req.params;

  const location = await Location.findByPk(id, {
    include: [
      { model: LocationType, as: 'type' },
      { model: Location, as: 'parent' },
      { model: Location, as: 'children', include: [{ model: LocationType, as: 'type' }] }
    ]
  });

  if (!location) {
    throw new ApiError(404, 'Локация не найдена');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(location.id)) {
    throw new ApiError(403, 'Нет доступа к данной локации');
  }

  res.json(location);
};

// GET /api/locations/:id/hierarchy
exports.getHierarchy = async (req, res) => {
  const { id } = req.params;

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(parseInt(id))) {
    throw new ApiError(403, 'Нет доступа к данной локации');
  }

  const query = `
    WITH RECURSIVE location_tree AS (
      SELECT * FROM locations WHERE id = $1
      UNION ALL
      SELECT l.* FROM locations l
      INNER JOIN location_tree lt ON lt.id = l."parentId"
    )
    SELECT * FROM location_tree;
  `;
  const [results] = await sequelize.query(query, { bind: [id] });

  res.json(results);
};

// POST /api/locations
exports.create = async (req, res) => {
  if (req.body.parentId) {
    const accessibleIds = await getAccessibleLocationIds(req.user);
    if (accessibleIds !== null && !accessibleIds.includes(req.body.parentId)) {
      throw new ApiError(403, 'Нет прав на создание дочернего элемента в этой локации');
    }
  }

  const newLocation = await Location.create(req.body);
  res.status(201).json(newLocation);
};

// PUT /api/locations/:id
exports.update = async (req, res) => {
  const { id } = req.params;
  const location = await Location.findByPk(id);
  if (!location) {
    throw new ApiError(404, 'Локация не найдена');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(location.id)) {
    throw new ApiError(403, 'Нет доступа к данной локации');
  }

  if (req.body.parentId !== undefined && req.body.parentId !== location.parentId) {
    if (req.body.parentId) {
      if (accessibleIds !== null && !accessibleIds.includes(req.body.parentId)) {
        throw new ApiError(403, 'Нет прав на перемещение в эту локацию');
      }
    }
  }

  await location.update(req.body);
  res.json(location);
};

// DELETE /api/locations/:id
exports.delete = async (req, res) => {
  const { id } = req.params;
  const location = await Location.findByPk(id);
  if (!location) {
    throw new ApiError(404, 'Локация не найдена');
  }

  const accessibleIds = await getAccessibleLocationIds(req.user);
  if (accessibleIds !== null && !accessibleIds.includes(location.id)) {
    throw new ApiError(403, 'Нет доступа к данной локации');
  }

  const childrenCount = await Location.count({ where: { parentId: id } });
  if (childrenCount > 0) {
    throw new ApiError(400, 'Нельзя удалить локацию, имеющую дочерние элементы');
  }

  await location.destroy();
  res.status(204).send();
};