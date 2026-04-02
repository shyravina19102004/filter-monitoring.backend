const { FilterModel, FilterType, Manufacturer } = require('../models');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const where = {};
  if (req.query.filterTypeId) where.filterTypeId = req.query.filterTypeId;
  if (req.query.manufacturerId) where.manufacturerId = req.query.manufacturerId;

  const { count, rows } = await FilterModel.findAndCountAll({
    where,
    include: [
      { model: FilterType, as: 'type' },
      { model: Manufacturer, as: 'manufacturer' }
    ],
    order: [['name', 'ASC']],
    limit,
    offset,
    distinct: true
  });

  res.json({ total: count, page, limit, data: rows });
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const model = await FilterModel.findByPk(id, {
    include: [
      { model: FilterType, as: 'type' },
      { model: Manufacturer, as: 'manufacturer' }
    ]
  });
  if (!model) {
    throw new ApiError(404, 'Модель не найдена');
  }
  res.json(model);
};

exports.create = async (req, res) => {
  const newModel = await FilterModel.create(req.body);
  res.status(201).json(newModel);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const model = await FilterModel.findByPk(id);
  if (!model) {
    throw new ApiError(404, 'Модель не найдена');
  }
  await model.update(req.body);
  res.json(model);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const model = await FilterModel.findByPk(id);
  if (!model) {
    throw new ApiError(404, 'Модель не найдена');
  }
  await model.destroy();
  res.status(204).send();
};