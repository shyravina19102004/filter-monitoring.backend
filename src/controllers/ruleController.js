const { Rule, FilterModel } = require('../models');
const ApiError = require('../utils/ApiError');

// GET /api/rules
exports.getAll = async (req, res) => {
  const where = {};
  if (req.query.filterModelId) where.filterModelId = req.query.filterModelId;

  const rules = await Rule.findAll({
    where,
    include: [{ model: FilterModel, as: 'filterModel' }]
  });
  res.json(rules);
};

// GET /api/rules/:id
exports.getOne = async (req, res) => {
  const { id } = req.params;
  const rule = await Rule.findByPk(id, {
    include: [{ model: FilterModel, as: 'filterModel' }]
  });
  if (!rule) {
    throw new ApiError(404, 'Правило не найдено');
  }
  res.json(rule);
};

// POST /api/rules
exports.create = async (req, res) => {
  const { filterModelId, parameter, unit } = req.body;

  const model = await FilterModel.findByPk(filterModelId);
  if (!model) {
    throw new ApiError(400, 'Указанная модель фильтра не существует');
  }

  // Валидация соответствия
  if (parameter === 'time' && !['days', 'hours'].includes(unit)) {
    throw new ApiError(400, 'Для параметра "time" единица измерения должна быть "days" или "hours"');
  }
  if (parameter === 'volume' && !['liters', 'cubic_meters'].includes(unit)) {
    throw new ApiError(400, 'Для параметра "volume" единица измерения должна быть "liters" или "cubic_meters"');
  }

  const newRule = await Rule.create(req.body);
  res.status(201).json(newRule);
};

// PUT /api/rules/:id
exports.update = async (req, res) => {
  const { id } = req.params;
  const { filterModelId, parameter, unit } = req.body;

  const rule = await Rule.findByPk(id);
  if (!rule) {
    throw new ApiError(404, 'Правило не найдено');
  }

  if (filterModelId && filterModelId !== rule.filterModelId) {
    const model = await FilterModel.findByPk(filterModelId);
    if (!model) {
      throw new ApiError(400, 'Указанная модель фильтра не существует');
    }
  }

  const finalParam = parameter || rule.parameter;
  const finalUnit = unit || rule.unit;
  if (finalParam === 'time' && !['days', 'hours'].includes(finalUnit)) {
    throw new ApiError(400, 'Для параметра "time" единица измерения должна быть "days" или "hours"');
  }
  if (finalParam === 'volume' && !['liters', 'cubic_meters'].includes(finalUnit)) {
    throw new ApiError(400, 'Для параметра "volume" единица измерения должна быть "liters" или "cubic_meters"');
  }

  await rule.update(req.body);
  res.json(rule);
};

// DELETE /api/rules/:id
exports.delete = async (req, res) => {
  const { id } = req.params;
  const rule = await Rule.findByPk(id);
  if (!rule) {
    throw new ApiError(404, 'Правило не найдено');
  }
  await rule.destroy();
  res.status(204).send();
};