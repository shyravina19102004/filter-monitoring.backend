const { FilterType } = require('../models');
const ApiError = require('../utils/ApiError');

exports.getAll = async (req, res) => {
  const filterTypes = await FilterType.findAll({
    order: [['name', 'ASC']]
  });
  res.json(filterTypes);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const filterType = await FilterType.findByPk(id);
  if (!filterType) {
    throw new ApiError(404, 'Тип фильтра не найден');
  }
  res.json(filterType);
};

exports.create = async (req, res) => {
  const { name, description } = req.body;
  const newFilterType = await FilterType.create({ name, description });
  res.status(201).json(newFilterType);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const filterType = await FilterType.findByPk(id);
  if (!filterType) {
    throw new ApiError(404, 'Тип фильтра не найден');
  }
  await filterType.update(req.body);
  res.json(filterType);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const filterType = await FilterType.findByPk(id);
  if (!filterType) {
    throw new ApiError(404, 'Тип фильтра не найден');
  }
  await filterType.destroy();
  res.status(204).send();
};